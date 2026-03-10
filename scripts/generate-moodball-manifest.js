const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ENTRIES_DIR = path.join(__dirname, '../src/moodball_entries');
const MANIFEST_FILE = path.join(ENTRIES_DIR, 'manifest.js');

function parseEntryFile(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const exportMatch = content.match(/export\s+const\s+(\w+)\s*=/);
    if (!exportMatch) {
      console.warn(`Warning: Could not find export in ${fileName}`);
      return null;
    }
    const exportName = exportMatch[1];
    let braceCount = 0;
    let objectStart = -1;
    let objectEnd = -1;
    let inString = false;
    let stringChar = null;
    for (let i = exportMatch.index + exportMatch[0].length; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';
      if (!inString && (char === '"' || char === "'" || char === '`')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar && prevChar !== '\\') {
        inString = false;
        stringChar = null;
      }
      if (!inString) {
        if (char === '{') {
          if (braceCount === 0) objectStart = i;
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0) {
            objectEnd = i;
            break;
          }
        }
      }
    }
    if (objectStart === -1 || objectEnd === -1) return null;
    const objectString = content.substring(objectStart, objectEnd + 1);
    let entryData;
    try {
      const context = vm.createContext({});
      entryData = vm.runInContext(`(${objectString})`, context);
    } catch (e) {
      return null;
    }
    const idMatch = fileName.match(/^(\d+)_/);
    const idFromFile = idMatch ? parseInt(idMatch[1]) : null;
    const id = idFromFile || entryData.id;
    return {
      id,
      file: fileName,
      exportName,
      title: entryData.title || 'Untitled',
      date: entryData.date || '',
      timestamp: entryData.timestamp || '',
      rating: entryData.rating || 0,
      location: entryData.location || '',
      tags: entryData.tags || []
    };
  } catch (error) {
    return null;
  }
}

function generateManifest() {
  if (!fs.existsSync(ENTRIES_DIR)) {
    fs.mkdirSync(ENTRIES_DIR, { recursive: true });
    fs.writeFileSync(MANIFEST_FILE, `// Auto-generated - run npm run generate-moodball-manifest
export const entriesManifest = [];
export const getEntryMetadata = (id) => entriesManifest.find(e => e.id === id);
export const getAllTags = () => [];
export const getAllLocations = () => [];
`, 'utf8');
    console.log('✓ Created empty moodball manifest');
    return;
  }
  const files = fs.readdirSync(ENTRIES_DIR);
  const entryFiles = files.filter(file =>
    file.endsWith('.js') &&
    file !== 'manifest.js' &&
    file !== 'index.js' &&
    file !== 'template.js' &&
    /^\d+_/.test(file)
  );
  const entries = [];
  for (const file of entryFiles) {
    const entry = parseEntryFile(path.join(ENTRIES_DIR, file), file);
    if (entry) entries.push(entry);
  }
  entries.sort((a, b) => a.id - b.id);
  const manifestContent = `// Auto-generated manifest of moodball entries
// DO NOT EDIT - run npm run generate-moodball-manifest
export const entriesManifest = [
${entries.map(e => `  {
    id: ${e.id},
    file: '${e.file}',
    exportName: '${e.exportName}',
    title: ${JSON.stringify(e.title)},
    date: ${JSON.stringify(e.date)},
    timestamp: ${JSON.stringify(e.timestamp)},
    rating: ${e.rating},
    location: ${JSON.stringify(e.location)},
    tags: ${JSON.stringify(e.tags)}
  }`).join(',\n')}
];
export const getEntryMetadata = (id) => entriesManifest.find(e => e.id === id);
export const getAllTags = () => {
  const s = new Set();
  entriesManifest.forEach(e => { (e.tags || []).forEach(t => s.add(t)); });
  return Array.from(s).sort();
};
export const getAllLocations = () => {
  const s = new Set();
  entriesManifest.forEach(e => { if (e.location) s.add(e.location); });
  return Array.from(s).sort();
};
`;
  fs.writeFileSync(MANIFEST_FILE, manifestContent, 'utf8');
  console.log(`✓ Moodball manifest: ${entries.length} entries`);
}

generateManifest();

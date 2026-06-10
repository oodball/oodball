const fs = require('fs');
const path = require('path');
const vm = require('vm');

const IMAGES_DIR = path.join(__dirname, '../public/images/Digiball');
const ALBUMS_DIR = path.join(__dirname, '../src/digiball_albums');

const VALID_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function toTitleCase(folder) {
  return folder
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Read existing manifest to preserve captions and other metadata
function getExistingPhotos(manifestPath) {
  if (!fs.existsSync(manifestPath)) return {};

  try {
    let content = fs.readFileSync(manifestPath, 'utf8');
    content = content.replace(/export\s+default\s+photos;?/, '');
    const sandbox = { photos: [] };
    vm.runInNewContext(content + '\n', sandbox);
    const map = {};
    for (const photo of sandbox.photos) {
      if (photo.src) {
        map[photo.src] = photo;
      }
    }
    return map;
  } catch {
    return {};
  }
}

function generateAlbumManifests() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('No Digiball images directory found, skipping.');
    return;
  }

  if (!fs.existsSync(ALBUMS_DIR)) {
    fs.mkdirSync(ALBUMS_DIR, { recursive: true });
  }

  const folders = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  const albumEntries = [];

  for (const folder of folders) {
    const folderPath = path.join(IMAGES_DIR, folder);
    const files = fs.readdirSync(folderPath)
      .filter(f => VALID_EXTENSIONS.includes(path.extname(f).toLowerCase()))
      .sort();

    if (files.length === 0) continue;

    const manifestPath = path.join(ALBUMS_DIR, `${folder}.js`);
    const existing = getExistingPhotos(manifestPath);

    const photos = files.map(f => {
      const src = `/images/Digiball/${folder}/${f}`;
      if (existing[src]) {
        return existing[src];
      }
      return { src };
    });

    const manifestContent = `const photos = ${JSON.stringify(photos, null, 2)};

export default photos;
`;

    fs.writeFileSync(manifestPath, manifestContent);
    albumEntries.push({ id: folder, title: toTitleCase(folder) });
    console.log(`  ${folder}: ${files.length} photos`);
  }

  // Generate index.js that exports all albums
  const imports = albumEntries.map(a => `import ${a.id} from './${a.id}';`).join('\n');
  const albumsObj = albumEntries
    .map(a => `  ${a.id}: { title: '${a.title}', photos: ${a.id} },`)
    .join('\n');

  const indexContent = `${imports}

const albums = {
${albumsObj}
};

export default albums;
`;

  fs.writeFileSync(path.join(ALBUMS_DIR, 'index.js'), indexContent);
  console.log(`✓ Digiball manifests: ${albumEntries.length} albums`);
}

generateAlbumManifests();

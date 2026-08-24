// Auto-generated manifest of moodball entries
// DO NOT EDIT - run npm run generate-moodball-manifest
export const entriesManifest = [
  {
    id: 1,
    file: '1_example.js',
    exportName: 'example',
    date: "8/24/2026",
    tags: ["Observation Log"],
    published: true
  }
];
export const getEntryMetadata = (id) => entriesManifest.find(e => e.id === id);
export const getAllTags = () => {
  const s = new Set();
  entriesManifest.forEach(e => { (e.tags || []).forEach(t => s.add(t)); });
  return Array.from(s).sort();
};

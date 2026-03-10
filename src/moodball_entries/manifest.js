// Auto-generated manifest of moodball entries
// DO NOT EDIT - run npm run generate-moodball-manifest
export const entriesManifest = [
  {
    id: 1,
    file: '1_example.js',
    exportName: 'example',
    title: "Example Moodball Entry",
    date: "2/20/2026",
    timestamp: "2026-02-20T02:02:00.000Z",
    rating: 3,
    location: "San Diego",
    tags: ["Example","Moodball"]
  }
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

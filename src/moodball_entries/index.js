import { entriesManifest, getEntryMetadata, getAllTags } from './manifest.js';

const entryCache = new Map();

export const getEntry = async (id) => {
  const entryId = parseInt(id);
  if (entryCache.has(entryId)) {
    return entryCache.get(entryId);
  }
  const metadata = getEntryMetadata(entryId);
  if (!metadata) return null;
  try {
    const module = await import(`./${metadata.file}`);
    const entry = module[metadata.exportName];
    entryCache.set(entryId, entry);
    return entry;
  } catch (error) {
    console.error(`Failed to load moodball entry ${entryId}:`, error);
    return null;
  }
};

export const getAllEntries = async () => {
  const entries = await Promise.all(
    entriesManifest.map(async (metadata) => {
      try {
        return await getEntry(metadata.id);
      } catch (error) {
        console.error(`Failed to load moodball entry ${metadata.id}:`, error);
        return null;
      }
    })
  );
  return entries.filter(entry => entry !== null);
};

export const getSortedEntriesMetadata = async (sortBy = 'date-high', includeUnpublished = false) => {
  const entries = await getAllEntries();
  const filteredEntries = includeUnpublished
    ? entries
    : entries.filter(entry => entry.published !== false);
  const sorted = [...filteredEntries].sort((a, b) => {
    const aValue = new Date(a.date);
    const bValue = new Date(b.date);
    switch (sortBy) {
      case 'date-low':
        return aValue - bValue;
      case 'date-high':
      default:
        return bValue - aValue;
    }
  });
  return sorted;
};

export const getFilteredEntriesMetadata = async (filter, includeUnpublished = false) => {
  const entries = await getAllEntries();
  const baseEntries = includeUnpublished
    ? entries
    : entries.filter(entry => entry.published !== false);
  if (!filter) return baseEntries;
  return baseEntries.filter(entry =>
    entry.tags && entry.tags.includes(filter)
  );
};

export const getPublishedEntriesMetadata = async () => {
  const entries = await getAllEntries();
  return entries.filter(entry => entry.published !== false);
};

export const getPublishedTags = async () => {
  const allTags = new Set();
  const publishedEntries = await getPublishedEntriesMetadata();
  publishedEntries.forEach(entry => {
    if (entry.tags) entry.tags.forEach(tag => allTags.add(tag));
  });
  return Array.from(allTags).sort();
};

export { entriesManifest, getEntryMetadata, getAllTags };

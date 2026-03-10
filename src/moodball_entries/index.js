import { entriesManifest, getEntryMetadata, getAllTags, getAllLocations } from './manifest.js';

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
    let aValue, bValue;
    switch (sortBy) {
      case 'rating-high':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        return bValue - aValue;
      case 'rating-low':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        return aValue - bValue;
      case 'location-a-z':
        aValue = (a.location || '').toLowerCase();
        bValue = (b.location || '').toLowerCase();
        return aValue.localeCompare(bValue);
      case 'date-low':
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
        return aValue - bValue;
      case 'date-high':
      default:
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
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
    (entry.tags && entry.tags.includes(filter)) ||
    (entry.location && entry.location === filter)
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

export const getPublishedLocations = async () => {
  const allLocations = new Set();
  const publishedEntries = await getPublishedEntriesMetadata();
  publishedEntries.forEach(entry => {
    if (entry.location) allLocations.add(entry.location);
  });
  return Array.from(allLocations).sort();
};

export { entriesManifest, getEntryMetadata, getAllTags, getAllLocations };

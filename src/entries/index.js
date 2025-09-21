import { entriesManifest, getEntryMetadata, getAllTags, getAllLocations } from './manifest.js';

// Cache for loaded entries
const entryCache = new Map();

/**
 * Dynamically load a single entry by ID
 * @param {number} id - Entry ID
 * @returns {Promise<Object|null>} - Entry object or null if not found
 */
export const getEntry = async (id) => {
  const entryId = parseInt(id);
  
  // Check cache first
  if (entryCache.has(entryId)) {
    return entryCache.get(entryId);
  }
  
  // Find entry metadata
  const metadata = getEntryMetadata(entryId);
  if (!metadata) {
    return null;
  }
  
  try {
    // Dynamic import
    const module = await import(`./${metadata.file}`);
    const entry = module[metadata.exportName];
    
    // Cache the result
    entryCache.set(entryId, entry);
    
    return entry;
  } catch (error) {
    console.error(`Failed to load entry ${entryId}:`, error);
    return null;
  }
};

/**
 * Load all entries (use sparingly - prefer working with metadata when possible)
 * @returns {Promise<Array>} - Array of all entry objects
 */
export const getAllEntries = async () => {
  const entries = await Promise.all(
    entriesManifest.map(async (metadata) => {
      try {
        return await getEntry(metadata.id);
      } catch (error) {
        console.error(`Failed to load entry ${metadata.id}:`, error);
        return null;
      }
    })
  );
  
  // Filter out failed loads
  return entries.filter(entry => entry !== null);
};

/**
 * Get sorted entries metadata (now loads entries to check published status)
 * @param {string} sortBy - Sort criteria ('date-high', 'date-low', 'rating-high', 'rating-low', 'location-a-z')
 * @param {boolean} includeUnpublished - Whether to include unpublished entries (default: false)
 * @returns {Promise<Array>} - Sorted array of entry metadata
 */
export const getSortedEntriesMetadata = async (sortBy = 'date-high', includeUnpublished = false) => {
  // Load all entries to check their published status
  const entries = await getAllEntries();
  
  // Filter based on published status
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

/**
 * Filter entries metadata by tag or location (now loads entries to check published status)
 * @param {string|null} filter - Tag or location to filter by
 * @param {boolean} includeUnpublished - Whether to include unpublished entries (default: false)
 * @returns {Promise<Array>} - Filtered array of entry metadata
 */
export const getFilteredEntriesMetadata = async (filter, includeUnpublished = false) => {
  // Load all entries to check their published status
  const entries = await getAllEntries();
  
  // Filter based on published status
  const baseEntries = includeUnpublished 
    ? entries 
    : entries.filter(entry => entry.published !== false);
  
  if (!filter) {
    return baseEntries;
  }
  
  return baseEntries.filter(entry => 
    (entry.tags && entry.tags.includes(filter)) || 
    (entry.location && entry.location === filter)
  );
};

/**
 * Get all published entries metadata
 * @returns {Promise<Array>} - Array of published entry metadata
 */
export const getPublishedEntriesMetadata = async () => {
  const entries = await getAllEntries();
  return entries.filter(entry => entry.published !== false);
};

/**
 * Get all unique tags from published entries
 * @returns {Promise<Array>} - Sorted array of unique tags
 */
export const getPublishedTags = async () => {
  const allTags = new Set();
  const publishedEntries = await getPublishedEntriesMetadata();
  publishedEntries.forEach(entry => {
    if (entry.tags) {
      entry.tags.forEach(tag => allTags.add(tag));
    }
  });
  return Array.from(allTags).sort();
};

/**
 * Get all unique locations from published entries
 * @returns {Promise<Array>} - Sorted array of unique locations
 */
export const getPublishedLocations = async () => {
  const allLocations = new Set();
  const publishedEntries = await getPublishedEntriesMetadata();
  publishedEntries.forEach(entry => {
    if (entry.location) {
      allLocations.add(entry.location);
    }
  });
  return Array.from(allLocations).sort();
};

// Re-export manifest utilities
export { entriesManifest, getEntryMetadata, getAllTags, getAllLocations };

// Legacy exports for backward compatibility (will load all entries)
export const allEntries = getAllEntries();
export const sortedEntries = allEntries.then(entries => 
  entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
); 
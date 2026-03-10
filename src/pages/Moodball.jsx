import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSortedEntriesMetadata } from '../moodball_entries';
import '../styles/foodball.css';

function Moodball() {
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('date-high');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      try {
        const sortedEntries = await getSortedEntriesMetadata(sortBy, false);
        setEntries(sortedEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEntries();
  }, [sortBy]);

  const sortedAndFilteredEntries = selectedTag
    ? entries.filter(entry => entry.location && entry.location === selectedTag)
    : entries;

  const handleTagClick = (tag) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const clearFilter = () => {
    setSelectedTag(null);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="foodball">
      <div className="moodball-title-box">
        <h3>Moodball</h3>
      </div>

      <div className="entries-section">
        <div className="section-header">
          <h2>
            {selectedTag ? `Entries in "${selectedTag}"` : 'Entries'}
            ({sortedAndFilteredEntries.length})
          </h2>
          <div className="header-controls">
            {selectedTag && (
              <button onClick={clearFilter} className="clear-filter-btn">
                Clear
              </button>
            )}
            <div className="sort-container">
              <span className="sort-label">Sort by:</span>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="sort-dropdown eightbit-dropdown"
              >
                <option value="date-high">Newest</option>
                <option value="date-low">Oldest</option>
                <option value="location-a-z">Location</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading entries...</div>
        ) : sortedAndFilteredEntries.length === 0 ? (
          <div className="no-entries">
            <p>
              {selectedTag
                ? `No entries found with tag "${selectedTag}".`
                : 'No journal entries yet.'}
            </p>
          </div>
        ) : (
          <div className="entries-list">
            {sortedAndFilteredEntries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <Link to={`/moodball/${entry.id}`} className="entry-title-link">
                    <h3>{entry.title}</h3>
                  </Link>
                  <div className="entry-meta">
                    <span className="entry-date">{entry.date}</span>
                    {entry.location && (
                      <button
                        onClick={() => handleTagClick(entry.location)}
                        className={`entry-location clickable-location ${selectedTag === entry.location ? 'active' : ''}`}
                      >
                        📍 {entry.location}
                      </button>
                    )}
                  </div>
                </div>
                {entry.image && (
                  <div className="entry-thumbnail">
                    <img
                      src={entry.image}
                      alt={entry.title}
                      className="entry-thumbnail-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <Link to={`/moodball/${entry.id}`} className="read-more-link">
                  Read full entry →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Moodball;

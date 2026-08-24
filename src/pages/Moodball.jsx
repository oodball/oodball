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
    ? entries.filter(entry => entry.tags && entry.tags.includes(selectedTag))
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
            {selectedTag ? `Entries tagged "${selectedTag}"` : 'Entries'}
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
                    {entry.tags && entry.tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`entry-location clickable-location ${selectedTag === tag ? 'active' : ''}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
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

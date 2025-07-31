import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sortedEntries } from '../entries';
import '../styles/foodball.css';

function Foodball() {
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('date-high');

  const filteredEntries = selectedTag 
    ? sortedEntries.filter(entry => 
        (entry.tags && entry.tags.includes(selectedTag)) || 
        (entry.location && entry.location === selectedTag)
      )
    : sortedEntries;

  const sortedAndFilteredEntries = [...filteredEntries].sort((a, b) => {
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
      <div className="foodball-header">
        <h1>Foodball</h1>
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
                <option value="rating-high">Best Rated</option>
                <option value="rating-low">Lowest Rated</option>
                <option value="location">Location</option>
              </select>
            </div>
          </div>
        </div>

        {sortedAndFilteredEntries.length === 0 ? (
          <div className="no-entries">
            <p>
              {selectedTag 
                ? `No entries found with tag "${selectedTag}".` 
                : 'No journal entries yet.'
              }
            </p>
          </div>
        ) : (
          <div className="entries-list">
            {sortedAndFilteredEntries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <Link to={`/foodball/${entry.id}`} className="entry-title-link">
                    <h3>{entry.title}</h3>
                  </Link>
                  <div className="entry-meta">
                    <span className="entry-date">{entry.date}</span>
                    {entry.rating && (
                      <span className="entry-rating">⭐ {entry.rating}/5</span>
                    )}
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
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="entry-tags">
                  {entry.tags && entry.tags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagClick(tag)}
                      className={`tag clickable-tag ${selectedTag === tag ? 'active' : ''}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <Link to={`/foodball/${entry.id}`} className="read-more-link">
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

export default Foodball; 
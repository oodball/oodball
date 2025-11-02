import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSortedEntriesMetadata } from '../entries';
import NotificationSubscription from '../components/NotificationSubscription';
import { supabase } from '../supabase_client';
import '../styles/foodball.css';

function Foodball() {
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('date-high');
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadEntries = async () => {
      setLoading(true);
      try {
        const sortedEntries = await getSortedEntriesMetadata(sortBy, false); // false = only published entries
        setEntries(sortedEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEntries();
  }, [sortBy]);

  // Filter entries based on selected tag
  const sortedAndFilteredEntries = selectedTag 
    ? entries.filter(entry => 
        (entry.tags && entry.tags.includes(selectedTag)) || 
        (entry.location && entry.location === selectedTag)
      )
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
      <div className="foodball-header">
        <h1>Foodball</h1>
      </div>

      <NotificationSubscription user={user} />

      <div className="ranking-notes-section">
        <div className="ranking-notes-header">
          <h3>Notes on Ranking System</h3>
        </div>
        <div className="ranking-notes-content">
          <p>Every restaurant starts out at a 3/5 rating. For any positive reviews, I raise the rating, and for any negative reviews I'll lower it.
            <br />
          <br />
          Any rating above 3 is a good restaurant.
          </p>
        </div>
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
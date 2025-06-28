import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/foodball.css';

function Foodball() {
  const [entries, setEntries] = useState([]);

  // Load entries from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('foodballEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  return (
    <div className="foodball">
      <div className="foodball-header">
        <h1>🍽️ Foodball</h1>
      </div>

      <div className="entries-section">
        <h2>Journal Entries ({entries.length})</h2>
        {entries.length === 0 ? (
          <div className="no-entries">
            <p>No journal entries yet.</p>
          </div>
        ) : (
          <div className="entries-list">
            {entries.map(entry => (
              <div key={entry.id} className="entry-card">
                <div className="entry-header">
                  <Link to={`/foodball/${entry.id}`} className="entry-title-link">
                    <h3>{entry.title}</h3>
                  </Link>
                  <span className="entry-date">{entry.date}</span>
                </div>
                <div className="entry-preview">
                  <p>{entry.preview}</p>
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
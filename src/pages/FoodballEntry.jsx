import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import '../styles/foodball.css';

function FoodballEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const savedEntries = localStorage.getItem('foodballEntries');
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      const foundEntry = entries.find(e => e.id === parseInt(id));
      if (foundEntry) {
        setEntry(foundEntry);
      } else {
        navigate('/foodball');
      }
    } else {
      navigate('/foodball');
    }
  }, [id, navigate]);

  if (!entry) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="foodball-entry">
      <div className="entry-navigation">
        <Link to="/foodball" className="back-link">
          ← Back to Journal
        </Link>
      </div>

      <div className="entry-detail">
        <div className="entry-header">
          <h1>{entry.title}</h1>
          <span className="entry-date">{entry.date}</span>
        </div>
        <div className="entry-content">
          {entry.content.split('\n').map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FoodballEntry; 
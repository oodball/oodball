import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">oodball</Link>
      </div>
      <div className="navbar-links">
        <div className="dropdown">
          <button 
            className="dropdown-button"
            onClick={() => setIsOpen(!isOpen)}
          >
            ▼
          </button>
          {isOpen && (
            <div className="dropdown-content">
              <Link to="/">Main Menu</Link>
              <Link to="/foodball">Foodball</Link>
              <Link to="/Filmball">Filmball</Link>
              <Link to="/Embroodball">Embroodball</Link>
              <Link to="/digiball">Digiball</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 
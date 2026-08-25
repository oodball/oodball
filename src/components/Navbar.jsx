import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isBeta = location.pathname.startsWith('/beta');

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">oodball</Link>
      </div>
      {!isBeta && (
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
                <Link to="/" onClick={() => setIsOpen(false)}>Main Menu</Link>
                <Link to="/foodball" onClick={() => setIsOpen(false)}>Foodball</Link>
                <Link to="/embroodball" onClick={() => setIsOpen(false)}>Embroodball</Link>
                <Link to="/digiball" onClick={() => setIsOpen(false)}>Digiball</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

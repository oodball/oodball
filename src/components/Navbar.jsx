import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">oodball</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Oodball</Link>
        <Link to="/Foodball">Foodball</Link>
        <Link to="/Filmball">Filmball</Link>
        <Link to="/Embroodball">Embroodball</Link>
      </div>
    </nav>
  );
}

export default Navbar; 
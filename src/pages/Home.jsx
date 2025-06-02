import React from 'react';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Oodball</h1>
        <p className="subtitle">Part-time farmer, full-time rotter</p>
      </section>

      <section className="about">
        <h2>About Me</h2>
        <div className="card">
          <p>
            Farming sims have me in a chokehold.
          </p>
          <div className="skills">
            <h3>Skills</h3>
            <ul>
              <li>Farming</li>
              <li>Selling</li>
              <li>Harvesting</li>
              <li>Movies</li>
              <li>Embroidery</li>
              <li>Gardening</li>
              <li>Crafting</li>
              <li>Building</li>
              <li>Repairing</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 
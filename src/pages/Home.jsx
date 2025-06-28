import React from 'react';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Oodball</h1>
        <p className="subtitle">Professional Dilly-dallyer</p>
      </section>

      <section className="about">
        <h2>About Me</h2>
        <div className="card">
          <p>
            <h3>Achievements</h3>
            <ul>
              <li>Level 44 in Hay Day</li>
              <li>114 hours in Stardew Valley</li>
              <li>Pro Shark Catcher in Animal Crossing</li>
              <li>200+ Hours in Breath of the Wild</li>
              <li>9391 trophies in Brawl Stars</li>
              <li>Instant replier to texts when I feel like it</li>
              <li>Speedrunner in Super Paper Mario: Origami King</li>
            </ul>
              
          </p>
          <div className="skills">
            <h3>Skills</h3>
            <ul>
              <li>Devious</li>
              <li>Silly lil guy</li>
              <li>Farming Sims</li>
              <li>Brawling</li>
              <li>Embroidery</li>
              <li>Tomfoolery</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 
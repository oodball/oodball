import React from 'react';

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <h1>Welcome to My Portfolio</h1>
        <p className="subtitle">Machine Learning Engineer & Full Stack Developer</p>
      </section>

      <section className="about">
        <h2>About Me</h2>
        <div className="card">
          <p>
            I'm a passionate developer with expertise in machine learning and web development.
            I love building innovative solutions that combine cutting-edge ML techniques with
            modern web technologies.
          </p>
          <div className="skills">
            <h3>Skills</h3>
            <ul>
              <li>Machine Learning</li>
              <li>Python</li>
              <li>React</li>
              <li>Flask</li>
              <li>Data Analysis</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 
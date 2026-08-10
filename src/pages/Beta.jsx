import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/beta.css';

const BETA_FEATURES = [
  {
    id: 'food-diary-control',
    title: 'Food Diary (Control)',
    description: 'Control group diary — log meals, lunch photos, snacks, drinks, mood, and energy for 7 days.',
    path: '/beta/food-diary/control',
    status: 'live',
  },
  {
    id: 'food-diary-intervention',
    title: 'Food Diary (Intervention)',
    description: 'Intervention group diary — log meals, lunch photos, snacks, drinks, mood, and energy for 7 days.',
    path: '/beta/food-diary/intervention',
    status: 'live',
  },
];

function Beta() {
  return (
    <div className="beta">
      <header className="beta-header">
        <span className="beta-badge">BETA</span>
        <h1>Beta Lab</h1>
        <p className="beta-subtitle">Experimental features for oodball.com</p>
      </header>

      <section className="beta-features">
        <h2>Available Features</h2>
        <div className="beta-feature-grid">
          {BETA_FEATURES.map((feature) => (
            <Link key={feature.id} to={feature.path} className="beta-feature-card">
              <div className="beta-feature-card-header">
                <h3>{feature.title}</h3>
                <span className={`beta-status beta-status-${feature.status}`}>
                  {feature.status}
                </span>
              </div>
              <p>{feature.description}</p>
              <span className="beta-feature-link">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="beta-disclaimer">
        <p>
          These pages are in active development. Data may be stored locally in your browser
          and could change without notice.
        </p>
      </section>
    </div>
  );
}

export default Beta;

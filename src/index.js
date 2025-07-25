// All imports at the top (required by JS modules)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './styles/main.css';

// PATCH: Supabase + HashRouter workaround
if (window.location.hash.startsWith('#/access_token=')) {
  console.log('Supabase hash patch running:', window.location.hash);
  window.location.hash = '#/auth/callback' + window.location.hash.replace('#', '?');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
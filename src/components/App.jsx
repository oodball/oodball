import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Foodball from '../pages/Foodball';
import FoodballEntry from '../pages/FoodballEntry';
import Filmball from '../pages/Filmball';
import Embroodball from '../pages/Embroodball';
import Digiball from '../pages/Digiball';
import Navbar from './Navbar';
import '../styles/main.css';
import '../styles/filmball.css';
import '../styles/embroodball.css';
import '../styles/digiball.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/foodball" element={<Foodball />} />
            <Route path="/foodball/:id" element={<FoodballEntry />} />
            <Route path="/filmball" element={<Filmball />} />
            <Route path="/embroodball" element={<Embroodball />} />
            <Route path="/digiball" element={<Digiball />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 
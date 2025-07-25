import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Foodball from '../pages/Foodball';
import FoodballEntry from '../pages/FoodballEntry';
import Filmball from '../pages/Filmball';
import Embroodball from '../pages/Embroodball';
import Digiball from '../pages/Digiball';
import Navbar from './Navbar';
import Login from '../pages/login';
import AuthCallback from '../pages/AuthCallback';
import { supabase } from '../supabase_client';
import '../styles/main.css';
import '../styles/filmball.css';
import '../styles/embroodball.css';
import '../styles/digiball.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/foodball" element={<Foodball />} />
            <Route path="/foodball/:id" element={<FoodballEntry user={user} />} />
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
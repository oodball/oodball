import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Home from '../pages/Home';
import Foodball from '../pages/Foodball';
import FoodballEntry from '../pages/FoodballEntry';
import Filmball from '../pages/Filmball';
import Embroodball from '../pages/Embroodball';
import Digiball from '../pages/Digiball';
import Navbar from './Navbar';
import Login from '../pages/login';
import AuthCallback from '../pages/AuthCallback';
import ResetPassword from '../pages/ResetPassword';
import ResetPasswordConfirm from '../pages/ResetPasswordConfirm';
import { supabase } from '../supabase_client';
import '../styles/main.css';
import '../styles/filmball.css';
import '../styles/embroodball.css';
import '../styles/digiball.css';

// ScrollToTop component to handle scrolling to top on route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Component to handle auth errors in URL hash
function AuthErrorHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for Supabase auth errors in URL hash
    if (location.hash) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      if (error && errorCode) {
        // If it's a password reset error, redirect to reset password page with error
        if (errorCode === 'otp_expired' || errorCode === 'token_expired' || errorDescription?.includes('expired')) {
          navigate(`/reset-password?error=${encodeURIComponent(errorDescription || 'Link expired. Please request a new password reset link.')}`, { replace: true });
        } else if (errorCode === 'access_denied') {
          navigate(`/reset-password?error=${encodeURIComponent(errorDescription || 'Access denied. Please request a new password reset link.')}`, { replace: true });
        } else {
          // Other auth errors - redirect to login
          navigate(`/login?error=${encodeURIComponent(errorDescription || error)}`, { replace: true });
        }
      }
    }
  }, [location.hash, navigate]);

  return null;
}

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
        <ScrollToTop />
        <AuthErrorHandler />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-confirm" element={<ResetPasswordConfirm />} />
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
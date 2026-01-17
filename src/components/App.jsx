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

// Component to handle auth errors and recovery tokens in URL hash
function AuthErrorHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Only handle hash on homepage or if we're not already on a password reset page
    if (location.hash && (location.pathname === '/' || location.pathname === '')) {
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');

      console.log('=== AuthErrorHandler Debug ===');
      console.log('Pathname:', location.pathname);
      console.log('Hash:', location.hash.substring(0, 100) + '...');
      console.log('Type:', type);
      console.log('Error:', error);
      console.log('Error Code:', errorCode);
      console.log('Has access token:', !!accessToken);

      // Check for password reset recovery tokens first
      if (type === 'recovery' && accessToken) {
        console.log('AuthErrorHandler: Found recovery token, redirecting to reset-password-confirm');
        // Preserve the hash when redirecting
        navigate(`/reset-password-confirm${location.hash}`, { replace: true });
        return;
      }

      // Then check for errors
      if (error && errorCode) {
        console.log('AuthErrorHandler: Found error, redirecting to appropriate page');
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
  }, [location.hash, location.pathname, navigate]);

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
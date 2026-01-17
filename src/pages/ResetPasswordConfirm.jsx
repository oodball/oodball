import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase_client';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/main.css';

function ResetPasswordConfirm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle Supabase password reset flow
    const handlePasswordReset = async () => {
      console.log('ResetPasswordConfirm: Checking for password reset tokens...');
      console.log('Current URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      console.log('Search:', window.location.search);
      
      // Check URL hash for access token (Supabase puts it in the hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashAccessToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      const hashRefreshToken = hashParams.get('refresh_token');
      
      // Check URL search params as well (sometimes Supabase uses query params)
      const searchParams = new URLSearchParams(window.location.search);
      const searchAccessToken = searchParams.get('access_token');
      const searchType = searchParams.get('type');
      const searchRefreshToken = searchParams.get('refresh_token');
      
      const token = hashAccessToken || searchAccessToken;
      const tokenType = hashType || searchType;
      const refreshToken = hashRefreshToken || searchRefreshToken;
      
      console.log('Found token:', !!token);
      console.log('Token type:', tokenType);
      console.log('Has refresh token:', !!refreshToken);
      
      if (token && tokenType === 'recovery') {
        console.log('Processing password reset recovery token...');
        // Set the session using the tokens from the URL
        try {
          if (refreshToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error('Error setting session:', error);
              setError('Invalid or expired reset link. Please request a new password reset.');
              return;
            }
            
            if (data.session) {
              setSession(data.session);
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          }
          
          // Fallback: wait for Supabase to automatically set the session
          setTimeout(async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setSession(session);
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
            } else {
              setError('Invalid or expired reset link. Please request a new password reset.');
            }
          }, 1000);
        } catch (error) {
          console.error('Error handling password reset:', error);
          setError('Invalid or expired reset link. Please request a new password reset.');
        }
      } else {
        // Check if we already have a session (might have been set by Supabase automatically)
        console.log('No token found, checking for existing session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }
        
        if (session) {
          console.log('Found existing session');
          setSession(session);
        } else {
          console.log('No session found');
          // Wait a bit longer - Supabase might still be processing
          setTimeout(async () => {
            const { data: { session: delayedSession } } = await supabase.auth.getSession();
            if (delayedSession) {
              console.log('Found session after delay');
              setSession(delayedSession);
            } else {
              console.log('No session found after delay');
              setError('Invalid or expired reset link. Please request a new password reset.');
            }
          }, 2000);
        }
      }
    };
    
    handlePasswordReset();
    
    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        if (session) {
          console.log('Session established via auth state change');
          setSession(session);
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session && !error) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-card">
          <div className="reset-password-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h2>Set New Password</h2>
        <p className="reset-password-description">
          Enter your new password below.
        </p>
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            className="reset-password-input"
            disabled={loading}
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            required
            onChange={e => setConfirmPassword(e.target.value)}
            className="reset-password-input"
            disabled={loading}
            minLength={6}
          />
          <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        {error && <div className="reset-password-error">{error}</div>}
        {message && <div className="reset-password-message">{message}</div>}
        <div className="reset-password-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordConfirm;


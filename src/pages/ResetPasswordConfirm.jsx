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
    let mounted = true;
    let checkInterval = null;
    
    // Handle Supabase password reset flow
    const handlePasswordReset = async () => {
      console.log('=== ResetPasswordConfirm Debug ===');
      console.log('Current URL:', window.location.href);
      console.log('Hash:', window.location.hash);
      console.log('Search:', window.location.search);
      console.log('Pathname:', window.location.pathname);
      console.log('Origin:', window.location.origin);
      
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
      
      // First, check if we already have a session (Supabase might have already processed it)
      const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
      console.log('Initial session check:', {
        hasSession: !!existingSession,
        sessionError: sessionError?.message,
        userId: existingSession?.user?.id,
        userEmail: existingSession?.user?.email
      });
      
      if (existingSession && mounted) {
        console.log('Found existing session immediately');
        // Verify this is a password recovery session by checking if we have recovery tokens in URL
        const hasRecoveryToken = hashType === 'recovery' || searchType === 'recovery';
        console.log('Recovery token check:', { hasRecoveryToken, hashType, searchType });
        if (hasRecoveryToken || existingSession.user) {
          console.log('Session is valid for password reset');
          setSession(existingSession);
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          return;
        }
      }
      
      const token = hashAccessToken || searchAccessToken;
      const tokenType = hashType || searchType;
      const refreshToken = hashRefreshToken || searchRefreshToken;
      
      console.log('Token analysis:', {
        hasToken: !!token,
        tokenType,
        hasRefreshToken: !!refreshToken,
        tokenLength: token?.length,
        hashHasToken: !!hashAccessToken,
        searchHasToken: !!searchAccessToken
      });
      
      // Check if we have tokens in the URL
      if (token && tokenType === 'recovery') {
        console.log('Processing password reset recovery token...');
        
        // Try to set session manually
        if (refreshToken) {
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: refreshToken
            });
            
            if (error) {
              console.error('Error setting session:', error);
              if (mounted) {
                setError('Invalid or expired reset link. Please request a new password reset.');
              }
              return;
            }
            
            if (data?.session && mounted) {
              console.log('Session set manually from tokens');
              setSession(data.session);
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }
          } catch (error) {
            console.error('Error handling password reset:', error);
          }
        }
      }
      
      // Since detectSessionInUrl is true, Supabase should automatically detect and set the session
      // Let's check for the session with multiple attempts
      const checkSession = async (attempt = 0) => {
        if (!mounted) return;
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log(`Session check attempt ${attempt + 1}:`, {
          hasSession: !!session,
          error: sessionError?.message,
          userId: session?.user?.id
        });
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
        }
        
        if (session) {
          console.log('✓ Found session (attempt', attempt + 1, ')');
          if (mounted) {
            setSession(session);
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
          }
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
        } else if (attempt < 10) {
          // Check again after a short delay (up to 10 times = 5 seconds total)
          setTimeout(() => checkSession(attempt + 1), 500);
        } else {
          console.error('✗ No session found after multiple attempts');
          console.log('Final state:', {
            hash: window.location.hash,
            search: window.location.search,
            url: window.location.href
          });
          if (mounted) {
            setError('Invalid or expired reset link. Please request a new password reset.');
          }
        }
      };
      
      // Start checking for session
      checkSession();
      
      // Also set up interval as backup
      checkInterval = setInterval(async () => {
        if (!mounted) {
          clearInterval(checkInterval);
          return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          console.log('Session found via interval check');
          setSession(session);
          window.history.replaceState(null, '', window.location.pathname);
          clearInterval(checkInterval);
        }
      }, 1000);
    };
    
    handlePasswordReset();
    
    // Listen for auth state changes (this is the most reliable way)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      if (mounted && session) {
        // Accept any session - PASSWORD_RECOVERY, SIGNED_IN, TOKEN_REFRESHED, etc.
        console.log('Session established via auth state change:', event);
        setSession(session);
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
      } else if (mounted && event === 'SIGNED_OUT') {
        console.log('User signed out');
        setError('Session expired. Please request a new password reset link.');
      }
    });
    
    return () => {
      mounted = false;
      if (checkInterval) {
        clearInterval(checkInterval);
      }
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


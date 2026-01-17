import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase_client';
import { Link, useSearchParams } from 'react-router-dom';
import '../styles/main.css';

function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Check for error in URL params (from expired link redirect)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
      // Clear the error from URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      // Check if email exists (look up by email or username)
      let resetEmail = email;

      // If input is not an email, treat it as username and look up the email
      if (!email.includes('@')) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('user_usernames')
            .select('email')
            .eq('username', email)
            .single();

          if (!userError && userData) {
            resetEmail = userData.email;
          } else {
            // Fallback: try to find the email from comments table
            const { data: commentData, error: commentError } = await supabase
              .from('comments')
              .select('author')
              .eq('username', email)
              .order('timestamp', { ascending: false })
              .limit(1)
              .single();

            if (commentError || !commentData) {
              setError('Username not found. Please use your email address.');
              setLoading(false);
              return;
            }
            resetEmail = commentData.author;
          }
        } catch (error) {
          console.error('Error looking up username:', error);
          setError('Username not found. Please use your email address.');
          setLoading(false);
          return;
        }
      }

      const redirectUrl = `${window.location.origin}/reset-password-confirm`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        // Check if it's a rate limiting error
        if (resetError.message.includes('rate limit') || resetError.message.includes('too many requests') || resetError.message.includes('429')) {
          setError('Please wait a moment before requesting another reset link. Check your inbox for the previous email.');
        } else {
          setError(resetError.message);
        }
      } else {
        // Always show success message - Supabase sends the email even if one was recently sent
        setMessage('Password reset email sent! Check your inbox and follow the instructions to reset your password. If you don\'t see it, check your spam folder.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p className="reset-password-description">
          Enter your email or username and we'll send you a link to reset your password.
        </p>
        <p style={{ 
          fontSize: '0.75rem', 
          color: '#666', 
          marginTop: '0.5rem',
          fontFamily: 'Courier New, monospace'
        }}>
          Note: Reset links expire after 1 hour. If your link expired, request a new one below.
        </p>
        <form onSubmit={handleResetPassword}>
          <input
            type="text"
            placeholder="Email or Username"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            className="reset-password-input"
            disabled={loading}
          />
          <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        {error && (
          <div className="reset-password-error">
            <span>{error}</span>
            <button 
              type="button" 
              onClick={() => {
                setError(null);
                setMessage(null);
              }}
              className="reset-password-dismiss-btn"
            >
              Dismiss
            </button>
          </div>
        )}
        {message && (
          <div className="reset-password-message">
            <span>{message}</span>
            <button 
              type="button" 
              onClick={() => {
                setMessage(null);
                setError(null);
              }}
              className="reset-password-resend-btn"
            >
              Send Another
            </button>
          </div>
        )}
        <div className="reset-password-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;


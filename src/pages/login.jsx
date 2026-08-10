import React, { useState } from 'react';
import { supabase } from '../supabase_client';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { getAuthRedirectUrl } from '../utils/auth_redirect';
import '../styles/main.css';

async function signUpWithUsername({ email, password, username, from }) {
  const redirectUrl = getAuthRedirectUrl('/auth/callback', { from: from || '/' });
  console.log('Signup emailRedirectTo:', redirectUrl);
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: redirectUrl
    }
  });

  if (error) {
    return { data, error };
  }

  if (data.user) {
    try {
      const { error: insertError } = await supabase
        .from('user_usernames')
        .insert([
          {
            user_id: data.user.id,
            username: username,
            email: email
          }
        ]);

      if (insertError) {
        console.error('Error storing username:', insertError);
      }
    } catch (err) {
      console.error('Error storing username:', err);
    }
  }

  return { data, error };
}

async function resendSignupConfirmation(email, from) {
  const redirectUrl = getAuthRedirectUrl('/auth/callback', { from: from || '/' });
  console.log('Resend signup confirmation emailRedirectTo:', redirectUrl);

  return supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: redirectUrl }
  });
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [username, setUsername] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Robust 'from' logic: check URL params first, then state, never redirect to /login
  const urlParams = new URLSearchParams(location.search);
  let from = urlParams.get('redirect') || location.state?.from;
  if (!from || from === '/login') {
    from = window.location.pathname !== '/login' ? window.location.pathname : '/';
  }
  // Log the 'from' value for debugging
  console.log('Login page from value:', from);

  const handleResendSignupEmail = async () => {
    setError(null);
    setMessage(null);

    if (!email || !email.includes('@')) {
      setError('Please enter the email you signed up with first.');
      return;
    }

    setResendLoading(true);

    try {
      const { error: resendError } = await resendSignupConfirmation(email, from);

      if (resendError) {
        if (
          resendError.message.includes('rate limit') ||
          resendError.message.includes('too many requests') ||
          resendError.message.includes('429')
        ) {
          setError('Please wait a moment before requesting another confirmation email.');
        } else {
          setError(resendError.message);
        }
      } else {
        setMessage('Confirmation email sent! Check your inbox and spam folder.');
        setShowResend(true);
      }
    } catch (err) {
      console.error('Error resending confirmation email:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setShowResend(false);

    let loginEmail = email;

    // If the input is not an email, treat it as a username and look up the email
    if (mode === 'login' && email && !email.includes('@')) {
      try {
        // First try to look up from the user_usernames table
        const { data: userData, error: userError } = await supabase
          .from('user_usernames')
          .select('email')
          .eq('username', email)
          .single();

        if (!userError && userData) {
          loginEmail = userData.email;
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
            setError('Username not found. Please use your email or sign up.');
            return;
          }
          loginEmail = commentData.author;
        }
      } catch (error) {
        console.error('Error looking up username:', error);
        setError('Username not found. Please use your email or sign up.');
        return;
      }
    }

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email before logging in.');
          setMessage('Need a new confirmation link? Use Resend email below.');
          setShowResend(true);
        } else {
          setError(error.message);
        }
      } else {
        setMessage('Logged in.');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      }
    } else {
      const { data, error } = await signUpWithUsername({ email, password, username, from });
      if (error) {
        setError(error.message);
      } else if (data?.user && data.user.identities?.length === 0) {
        const { error: resendError } = await resendSignupConfirmation(email, from);
        if (resendError) {
          setError('This email is already registered. Try logging in, or wait a few minutes and use Resend email.');
          setShowResend(true);
        } else {
          setMessage('This email is already registered. We sent a new confirmation email — check your inbox and spam folder.');
          setShowResend(true);
        }
      } else {
        setMessage('Signup successful! Check your email for confirmation.');
        setShowResend(true);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleAuth}>
          {mode === 'login' ? (
            <input
              type="text"
              placeholder="Email or Username"
              value={email}
              required
              onChange={e => setEmail(e.target.value)}
              className="login-input"
            />
          ) : (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
                className="login-input"
              />
              <input
                type="text"
                placeholder="Username"
                value={username}
                required
                onChange={e => setUsername(e.target.value)}
                className="login-input"
              />
            </>
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={e => setPassword(e.target.value)}
            className="login-input"
          />
          <button
            type="submit"
            className="login-button"
          >
            {mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <div className="login-links">
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
              setMessage(null);
              setShowResend(false);
            }}
            className="login-link-button"
          >
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
          {mode === 'login' && (
            <>
              <span className="login-link-separator">|</span>
              <Link
                to="/reset-password"
                className="login-link"
              >
                Forgot password?
              </Link>
            </>
          )}
        </div>
        {error && <div className="login-error">{error}</div>}
        {message && <div className="login-message">{message}</div>}
        {showResend && (
          <button
            type="button"
            onClick={handleResendSignupEmail}
            className="login-resend-btn"
            disabled={resendLoading}
          >
            {resendLoading ? 'Sending...' : 'Resend email'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import { supabase } from '../supabase_client';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../styles/main.css';

async function signUpWithUsername({ email, password, username, from }) {
  // Log the redirect URL for debugging
  const redirectUrl = `https://www.oodball.com/auth/callback?from=${encodeURIComponent(from || '/')}`;
  console.log('Signup emailRedirectTo:', redirectUrl);
  
  // First, sign up the user
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

  // If signup successful, store username in a separate table for easy lookup
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
        // Don't fail the signup if username storage fails
      }
    } catch (err) {
      console.error('Error storing username:', err);
    }
  }

  return { data, error };
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [username, setUsername] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
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
      // Match the reset-password page behavior: build a redirect URL that works in both dev and prod.
      const isProduction =
        window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';
      const protocol = isProduction ? 'https' : window.location.protocol.slice(0, -1);
      const hostname = window.location.hostname;
      const port = window.location.port ? `:${window.location.port}` : '';
      const redirectUrl = `${protocol}://${hostname}${port}/auth/callback?from=${encodeURIComponent(from || '/')}`;

      console.log('Resend signup confirmation emailRedirectTo:', redirectUrl);

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: redirectUrl }
      });

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
      if (error) setError(error.message);
      else {
        setMessage('Logged in.');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      }
    } else {
      const { error } = await signUpWithUsername({ email, password, username, from });
      if (error) setError(error.message);
      else setMessage('Signup successful! Check your email for confirmation.');
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
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
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
        {message && (
          <div className="login-message">
            <span>{message}</span>
            {mode === 'signup' && (
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
        )}
      </div>
    </div>
  );
}

export default Login;

import React, { useState } from 'react';
import { supabase } from '../supabase_client';
import { useLocation, useNavigate } from 'react-router-dom';

async function signUpWithUsername({ email, password, username, from }) {
  // Log the redirect URL for debugging
  const redirectUrl = `https://oodball.com/auth/callback?from=${encodeURIComponent(from || '/')}`;
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
  const location = useLocation();
  const navigate = useNavigate();

  // Robust 'from' logic: never redirect to /login, always prefer a real previous page or fallback to '/'
  let from = location.state?.from;
  if (!from || from === '/login') {
    from = window.location.pathname !== '/login' ? window.location.pathname : '/';
  }
  // Log the 'from' value for debugging
  console.log('Login page from value:', from);

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
    <div className="login-page" style={{ maxWidth: 400, margin: '2rem auto', padding: '2rem', background: '#f7fafc', borderRadius: 8, boxShadow: '0 2px 8px #e8dcc0' }}>
      <h2 style={{ fontFamily: 'Courier New, monospace', color: '#6b3e1d' }}>{mode === 'login' ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleAuth}>
        {mode === 'login' ? (
          <input
            type="text"
            placeholder="Email or Username"
            value={email}
            required
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: 12, padding: 8, fontFamily: 'Courier New, monospace' }}
          />
        ) : (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', marginBottom: 12, padding: 8, fontFamily: 'Courier New, monospace' }}
            />
            <input
              type="text"
              placeholder="Username"
              value={username}
              required
              onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', marginBottom: 12, padding: 8, fontFamily: 'Courier New, monospace' }}
            />
          </>
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', marginBottom: 12, padding: 8, fontFamily: 'Courier New, monospace' }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            background: '#8b4513',
            color: '#f7fafc',
            border: '3px solid #5d2e0a',
            borderBottom: '4px solid #3d1f06',
            borderRight: '4px solid #3d1f06',
            padding: '0.75rem 1.5rem',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            cursor: 'pointer',
            boxShadow: 'inset 2px 2px 0 rgba(255,255,255,0.2), inset -2px -2px 0 rgba(0,0,0,0.3)',
            textShadow: '1px 1px 0 rgba(0,0,0,0.6)',
            marginBottom: 12
          }}
        >
          {mode === 'login' ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <button
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          style={{
            background: 'none',
            border: 'none',
            color: '#a0522d',
            fontFamily: 'Courier New, monospace',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {mode === 'login' ? 'Sign up' : 'Login'}
        </button>
      </div>
      {error && <div style={{ color: '#c53030', fontFamily: 'Courier New, monospace' }}>{error}</div>}
      {message && <div style={{ color: '#2c7a7b', fontFamily: 'Courier New, monospace' }}>{message}</div>}
    </div>
  );
}

export default Login;

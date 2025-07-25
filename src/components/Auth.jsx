import React, { useState } from 'react';
import { supabase } from '../supabase_client';

function Auth({ onAuth }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    setError(error?.message || null);
    if (!error) onAuth();
  };

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setError(error?.message || null);
    if (!error) onAuth();
  };

  return (
    <div>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder='Email' />
      <input value={password} onChange={e => setPassword(e.target.value)} type='password' placeholder='Password' />
      <button onClick={signUp}>Sign Up</button>
      <button onClick={signIn}>Sign In</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

export default Auth;

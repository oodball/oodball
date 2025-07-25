import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mkusymfkgvqnzdjjznrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdXN5bWZrZ3Zxbnpkamp6bnJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNjYwMTYsImV4cCI6MjA2ODc0MjAxNn0.u_5mw3AKSzpSKgKP7ssEs6sQ2jXRLRhbCD2OhviKMb8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: sessionStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

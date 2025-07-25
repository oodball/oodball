import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Workaround for Supabase + HashRouter: handle /#/access_token=... hash
    if (window.location.hash.startsWith('#/access_token=')) {
      // Parse the hash as query params
      const params = new URLSearchParams(window.location.hash.replace('#/', ''));
      const from = params.get('from') || '/';
      navigate(from, { replace: true });
      return;
    }
    // Normal flow for /#/auth/callback?from=...
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || '/';
    navigate(from, { replace: true });
  }, [navigate, location]);

  return <div>Redirecting...</div>;
}

export default AuthCallback; 
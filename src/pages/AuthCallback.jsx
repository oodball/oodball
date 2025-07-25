import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only handle normal flow for /auth/callback?from=...
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || '/';
    navigate(from, { replace: true });
  }, [navigate, location]);

  return <div>Redirecting...</div>;
}

export default AuthCallback; 
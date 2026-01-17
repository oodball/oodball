import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if this is a password reset flow
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const searchParams = new URLSearchParams(location.search);
    
    const type = hashParams.get('type') || searchParams.get('type');
    
    console.log('AuthCallback: type =', type);
    console.log('AuthCallback: hash =', location.hash);
    console.log('AuthCallback: search =', location.search);
    
    if (type === 'recovery') {
      // This is a password reset - redirect to reset password confirm page
      // Preserve hash and search params
      const hash = location.hash || window.location.hash || '';
      const search = location.search || window.location.search || '';
      
      // If we have a hash, we need to use window.location to preserve it
      // React Router's navigate doesn't preserve hash fragments
      if (hash) {
        const newUrl = `${window.location.origin}/reset-password-confirm${search}${hash}`;
        console.log('AuthCallback: Redirecting to', newUrl);
        window.location.replace(newUrl);
      } else {
        // No hash, can use React Router
        navigate(`/reset-password-confirm${search}`, { replace: true });
      }
      return;
    }
    
    // Otherwise, handle normal auth callback
    const params = new URLSearchParams(location.search);
    const from = params.get('from') || '/';
    navigate(from, { replace: true });
  }, [navigate, location]);

  return <div>Redirecting...</div>;
}

export default AuthCallback; 
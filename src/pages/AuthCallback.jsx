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
    
    if (type === 'recovery') {
      // This is a password reset - redirect to reset password confirm page
      // Preserve the hash/query params so ResetPasswordConfirm can handle them
      const hash = location.hash ? location.hash : '';
      const search = location.search ? location.search : '';
      navigate(`/reset-password-confirm${search}${hash}`, { replace: true });
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
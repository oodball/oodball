import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase_client';

function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      // Check if this is a password reset flow
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const searchParams = new URLSearchParams(location.search);
      
      const type = hashParams.get('type') || searchParams.get('type');
      
      console.log('=== AuthCallback Debug ===');
      console.log('Type:', type);
      console.log('Hash:', location.hash);
      console.log('Search:', location.search);
      console.log('Full URL:', window.location.href);
      console.log('Pathname:', location.pathname);
      
      if (type === 'recovery') {
        // This is a password reset
        // Preserve the hash and redirect immediately - let ResetPasswordConfirm handle session setup
        const hash = location.hash || window.location.hash || '';
        const search = location.search || window.location.search || '';
        
        console.log('AuthCallback: Password reset detected, redirecting to reset-password-confirm');
        console.log('AuthCallback: Preserving hash:', hash.substring(0, 50) + '...');
        
        // Always redirect with hash preserved - ResetPasswordConfirm will handle the session
        const newUrl = `${window.location.origin}/reset-password-confirm${search}${hash}`;
        console.log('AuthCallback: Redirecting to:', newUrl.substring(0, 100) + '...');
        window.location.replace(newUrl);
        return;
      }
      
      // Otherwise, handle normal auth callback
      // Wait for session to be established
      for (let i = 0; i < 10; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const params = new URLSearchParams(location.search);
      const from = params.get('from') || '/';
      navigate(from, { replace: true });
    };
    
    handleCallback();
  }, [navigate, location]);

  return <div>Redirecting...</div>;
}

export default AuthCallback; 
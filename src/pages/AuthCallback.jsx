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
      
      console.log('AuthCallback: type =', type);
      console.log('AuthCallback: hash =', location.hash);
      console.log('AuthCallback: search =', location.search);
      
      if (type === 'recovery') {
        // This is a password reset
        // Wait for Supabase to process the session (since detectSessionInUrl is true)
        // Then redirect to reset password confirm page
        const hash = location.hash || window.location.hash || '';
        const search = location.search || window.location.search || '';
        
        console.log('AuthCallback: Waiting for Supabase to process password reset session...');
        
        // Wait a moment for Supabase to process the session
        let sessionFound = false;
        for (let i = 0; i < 10; i++) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            console.log('AuthCallback: Session found, redirecting to reset-password-confirm');
            sessionFound = true;
            // Redirect with the hash preserved so ResetPasswordConfirm can also process it
            const newUrl = `${window.location.origin}/reset-password-confirm${search}${hash}`;
            window.location.replace(newUrl);
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // If no session found but we have tokens, redirect anyway and let ResetPasswordConfirm handle it
        if (hash && !sessionFound) {
          console.log('AuthCallback: No session found, redirecting with hash preserved');
          const newUrl = `${window.location.origin}/reset-password-confirm${search}${hash}`;
          window.location.replace(newUrl);
          return;
        }
        
        // Fallback: redirect without hash
        navigate('/reset-password-confirm', { replace: true });
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
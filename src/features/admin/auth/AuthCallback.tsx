import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabase/config';


const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The hash contains the access_token and other params
    // Supabase client automatically handles parsing the hash and setting the session
    // We just need to wait a brief moment or check the session state
    
    const handleAuthCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/login');
      } else if (session) {
        // Successful login, redirect to home or intended destination
        navigate('/');
      } else {
        // If no session yet, it might be processing the hash
        // We can listen for the auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session) {
            navigate('/');
          }
        });
        
        return () => subscription.unsubscribe();
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-300 font-medium">Connexion en cours...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

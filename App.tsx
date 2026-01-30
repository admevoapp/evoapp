
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import LandingPage from './components/LandingPage';
import MainLayout from './components/MainLayout';
import UpdatePasswordModal from './components/UpdatePasswordModal';

console.log('App.tsx executing - initializing Supabase inline');

const supabaseUrl = 'https://rsedxpjfrfwozptuwxvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzZWR4cGpmcmZ3b3pwdHV3eHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNDE5MjEsImV4cCI6MjA4MDgxNzkyMX0.JTZna6qkIinxwWqWLpkTQKjgZ67TEozwaw5yGBcAsko';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    }).catch((error) => {
      console.error('Error checking session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);

      if (event === 'PASSWORD_RECOVERY') {
        setShowUpdatePasswordModal(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = () => {
    // Auth is handled by Supabase listener
  };

  const handleLogout = async () => {
    localStorage.removeItem('evo_token_version');
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] text-gray-500">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {isAuthenticated ? (
        <MainLayout onLogout={handleLogout} />
      ) : (
        <LandingPage onLogin={handleLogin} />
      )}

      <UpdatePasswordModal
        isOpen={showUpdatePasswordModal}
        onClose={() => setShowUpdatePasswordModal(false)}
      />
    </div>
  );
};

export default App;

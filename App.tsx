
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import LandingPage from './components/LandingPage';
import MainLayout from './components/MainLayout';
import UpdatePasswordModal from './components/UpdatePasswordModal';

console.log('App.tsx executing');

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

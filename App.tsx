
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
      {showUpdatePasswordModal ? (
        // Password Recovery Mode - Exclusive View
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
          <UpdatePasswordModal
            isOpen={true}
            onClose={() => {
              setShowUpdatePasswordModal(false);
              // If closing after success (handled inside modal with delay), the user is updated and logged in.
              // If we wanted to support "cancel", we'd need a button in the modal calling onClose.
              // But for security, if they just reload or something, session persists? 
              // Actually, UpdatePasswordModal 'onClose' is called after success. 
              // So we just set showUpdatePasswordModal(false) and since they are authenticated, they go to main app.
            }}
            isRecovery={true}
          />
        </div>
      ) : isAuthenticated ? (
        <MainLayout onLogout={handleLogout} />
      ) : (
        <LandingPage onLogin={handleLogin} />
      )}

      {/* Normal Update Password Modal (triggered from settings, if we reuse it later, or if we kept the old structure) 
          Wait, if we use the exclusive view above, we don't need this rendered at the bottom.
          However, the 'UpdatePasswordModal' is also used inside Settings? No, looking at imports, it's imported here.
          Is it used anywhere else?
          The grep showed it imported in App.tsx and UpdatePasswordModal.tsx (self).
          It seems valid to keep the logic clean.
      */}
      {!showUpdatePasswordModal && (
        // This creates a potential issue if we want to use the modal from within MainLayout for regular password updates.
        // But currently App.tsx controls it via 'showUpdatePasswordModal' state which is ONLY set by PASSWORD_RECOVERY event.
        // Regular "Change Password" usually happens inside SettingsPage which likely imports it or uses a different mechanism.
        // Let's check SettingsPage imports if possible?
        // Actually, the grep showed 'SettingsPage.tsx' in the list but didn't show the import line match for UpdatePasswordModal?
        // Wait, grep output:
        // {"File":"d:\\Evo\\EVOAPP\\APP\\components\\SettingsPage.tsx"}
        // This means SettingsPage.tsx DOES contain "UpdatePasswordModal" string.
        // So it might have its own instance.
        // So 'showUpdatePasswordModal' in App.tsx is EXCLUSIVELY for the recovery flow event.
        <></>
      )}
    </div>
  );
};

export default App;

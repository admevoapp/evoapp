import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { MenuIcon } from '../icons';
import AdminDashboard from './AdminDashboard';
import AdminBanners from './AdminBanners';
import AdminPosts from './AdminPosts';
import AdminEvents from './AdminEvents';
import AdminLibrary from './AdminLibrary';
import AdminUsers from './AdminUsers';
import AdminSettings from './AdminSettings';
import AdminCentral from './AdminCentral';
import AdminShop from './AdminShop';
import AdminFeed from './AdminFeed';
import AdminReflections from './AdminReflections';
import AdminPremium from './AdminPremium';
import AdminActivityLog from './AdminActivityLog';
import AdminReports from './AdminReports';
import AdminBottles from './AdminBottles';

interface AdminLayoutProps {
  onLogout: () => void;
  onBackToApp: () => void;
  onViewProfile?: (user: any) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ onLogout, onBackToApp, onViewProfile }) => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <AdminDashboard
          onNavigate={setActiveModule}
        />;
      case 'activity-log':
        return <AdminActivityLog />;
      case 'central':
        return <AdminCentral />;
      case 'shop':
        return <AdminShop />;
      case 'premium':
        return <AdminPremium />;
      case 'banners':
        return <AdminBanners />;
      case 'feed-principal':
        return <AdminFeed />;
      case 'reflections':
        return <AdminReflections />;
      case 'posts':
        return <AdminPosts />;
      case 'events':
        return <AdminEvents />;
      case 'library':
        return <AdminLibrary />;
      case 'users':
        return <AdminUsers onViewProfile={onViewProfile} />;
      case 'settings':
        return <AdminSettings />;
      case 'reports':
        return <AdminReports />;
      case 'bottles':
        return <AdminBottles />;
      default:
        return <AdminDashboard onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-sans text-slate-200 selection:bg-evo-purple selection:text-white">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#121212] border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <img
            src="/images/logo-evoapp-fundo-escuro-300x65.png"
            alt="EVO APP"
            className="h-6 object-contain"
          />
        </div>
      </div>

      <AdminSidebar
        activeModule={activeModule}
        onNavigate={(module) => {
          setActiveModule(module);
          setIsSidebarOpen(false);
        }}
        onLogout={onLogout}
        onBackToApp={onBackToApp}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 min-h-screen p-4 lg:p-12 pt-8 lg:ml-64`}>
        <div className="max-w-7xl mx-auto space-y-8">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

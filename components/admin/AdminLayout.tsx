import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
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
      <AdminSidebar
        activeModule={activeModule}
        onNavigate={setActiveModule}
        onLogout={onLogout}
        onBackToApp={onBackToApp}
      />
      <main className="ml-64 p-8 lg:p-12 min-h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

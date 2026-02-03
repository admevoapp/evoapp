import React from 'react';
import { HomeIcon, PhotoIcon, CalendarIcon, DocumentTextIcon, UsersIcon, CogIcon, LogoutIcon, ArrowLeftIcon, MegaphoneIcon, ShoppingBagIcon, DiamondIcon, BrainIcon, ExclamationTriangleIcon, BottleIcon, XMarkIcon } from '../icons';

interface AdminSidebarProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  onLogout: () => void;
  onBackToApp: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeModule, onNavigate, onLogout, onBackToApp, isOpen, onClose }) => {
  const NavItem = ({ id, icon, label }: { id: string; icon: React.ReactNode; label: string }) => (
    <button
      onClick={() => onNavigate(id)}
      className={`flex items-center justify-start text-left space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${activeModule === id
        ? 'bg-gradient-to-r from-evo-blue/20 to-evo-purple/20 text-white font-semibold border border-white/10'
        : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <div className={`${activeModule === id ? 'text-evo-purple' : 'text-slate-400'}`}>{icon}</div>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed left-0 top-0 z-50 h-screen w-64 flex flex-col
        bg-[#121212] border-r border-white/10
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          <img
            src="/images/logo-evoapp-fundo-escuro-300x65.png"
            alt="EVO APP"
            className="h-8 object-contain"
          />
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem id="dashboard" icon={<HomeIcon className="w-5 h-5" />} label="Dashboard" />

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gestão</div>
          <NavItem id="central" icon={<MegaphoneIcon className="w-5 h-5" />} label="Central EVO" />
          <NavItem id="shop" icon={<ShoppingBagIcon className="w-5 h-5" />} label="EVO Store" />
          <NavItem id="premium" icon={<DiamondIcon className="w-5 h-5" />} label="EVO+ Premium" />

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Conteúdo</div>
          <NavItem id="banners" icon={<PhotoIcon className="w-5 h-5" />} label="Banners" />
          <NavItem id="feed-principal" icon={<MegaphoneIcon className="w-5 h-5" />} label="Feed Principal" />
          <NavItem id="reflections" icon={<BrainIcon className="w-5 h-5" />} label="Reflexões" />
          <NavItem id="bottles" icon={<BottleIcon className="w-5 h-5" />} label="Garrafas" />

          <NavItem id="events" icon={<CalendarIcon className="w-5 h-5" />} label="Eventos" />
          <NavItem id="library" icon={<DocumentTextIcon className="w-5 h-5" />} label="Biblioteca" />

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Sistema</div>
          <NavItem id="reports" icon={<ExclamationTriangleIcon className="w-5 h-5" />} label="Denúncias" />
          <NavItem id="users" icon={<UsersIcon className="w-5 h-5" />} label="Usuários" />
          <NavItem id="settings" icon={<CogIcon className="w-5 h-5" />} label="Configurações" />
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={onBackToApp}
            className="flex items-center justify-start text-left space-x-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Voltar ao App</span>
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-start text-left space-x-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;


import React from 'react';
import { HomeIcon, PhotoIcon, ChatBubbleIcon, CalendarIcon, DocumentTextIcon, UsersIcon, CogIcon, LogoutIcon, ArrowLeftIcon, MegaphoneIcon, ShoppingBagIcon, DiamondIcon, BrainIcon, ExclamationTriangleIcon, BottleIcon } from '../icons';

interface AdminSidebarProps {
  activeModule: string;
  onNavigate: (module: string) => void;
  onLogout: () => void;
  onBackToApp: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeModule, onNavigate, onLogout, onBackToApp }) => {
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
    <div className="w-64 bg-[#121212] border-r border-white/10 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <img
          src="/images/logo-evoapp-fundo-escuro-300x65.png"
          alt="EVO APP"
          className="h-8 object-contain"
        />
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
  );
};

export default AdminSidebar;

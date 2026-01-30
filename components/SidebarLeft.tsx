
import React from 'react';
import { User, Page } from '../types';
import {
  HomeIcon, UserIcon, CogIcon, UsersIcon, StarIcon, MailIcon, SearchIcon,
  CalendarIcon, ShoppingBagIcon, DiamondIcon, LightningBoltIcon, LogoutIcon, MegaphoneIcon, BellIcon
} from './icons';

interface SidebarLeftProps {
  user: User;
  onLogout: () => void;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  isPremium?: boolean;
  isAdmin?: boolean;
}> = ({ icon, label, active, onClick, isPremium, isAdmin }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left group relative overflow-hidden ${active
      ? 'bg-gradient-to-r from-evo-blue/10 via-evo-purple/10 to-evo-orange/10 text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-white/5'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#252527] hover:text-slate-900 dark:hover:text-white'
      }`}
  >
    {/* Active Indicator */}
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-evo-blue to-evo-purple rounded-r-full"></span>
    )}

    <span className={`relative z-10 flex-shrink-0 ${active
      ? 'text-evo-blue'
      : isPremium
        ? 'text-evo-orange'
        : isAdmin
          ? 'text-yellow-400'
          : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
      }`}>
      {icon}
    </span>
    <span className="relative z-10 truncate text-sm">{label}</span>
  </button>
);

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h4 className="px-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-6 mb-2">
    {title}
  </h4>
);

const SidebarLeft: React.FC<SidebarLeftProps> = ({ user, onLogout, currentPage, onNavigate }) => {
  return (
    <div className="w-full flex flex-col h-full bg-surface-light dark:bg-[#1C1C1E] border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm p-4 overflow-y-auto custom-scrollbar transition-colors duration-300">

      {/* Profile Summary Section */}
      <div className="mb-6 flex flex-col items-center text-center">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700 mb-3"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700 mb-3 text-slate-400 dark:text-slate-500">
            <UserIcon className="w-10 h-10" />
          </div>
        )}

        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{user.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">@{user.username}</p>

        {(user.location?.city && user.location?.state) && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            {user.location.city} - {user.location.state}
          </p>
        )}

        {user.profession && (
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
            {user.profession}
          </p>
        )}

        {user.behavioralProfile && (
          <div className="flex items-center justify-center space-x-1 mt-1">
            {user.behavioralProfile.toLowerCase().includes('analítico') && (
              <div className="w-3 h-3 rounded-full bg-blue-500" title="Analítico"></div>
            )}
            {user.behavioralProfile.toLowerCase().includes('dominante') && (
              <div className="w-3 h-3 rounded-full bg-red-500" title="Dominante"></div>
            )}
            {user.behavioralProfile.toLowerCase().includes('influente') && (
              <div className="w-3 h-3 rounded-full bg-yellow-400" title="Influente"></div>
            )}
            {user.behavioralProfile.toLowerCase().includes('estável') && (
              <div className="w-3 h-3 rounded-full bg-green-500" title="Estável"></div>
            )}
          </div>
        )}

        <div className="w-full h-px bg-slate-200/50 dark:bg-white/10 mt-6 mb-2"></div>
      </div>

      {/* Section 1: Main Navigation */}
      <div className="space-y-1">
        <NavItem icon={<HomeIcon className="w-5 h-5" />} label="Página Inicial" active={currentPage === 'feed'} onClick={() => onNavigate('feed')} />
        <NavItem icon={<SearchIcon className="w-5 h-5" />} label="Buscar ARPs" active={currentPage === 'search'} onClick={() => onNavigate('search')} />
        <NavItem icon={<UserIcon className="w-5 h-5" />} label="Meu Perfil" active={currentPage === 'profile'} onClick={() => onNavigate('profile')} />
        <NavItem icon={<UsersIcon className="w-5 h-5" />} label="Conexões" active={currentPage === 'connections'} onClick={() => onNavigate('connections')} />
        <NavItem icon={<StarIcon className="w-5 h-5" />} label="Favoritos" active={currentPage === 'favorites'} onClick={() => onNavigate('favorites')} />
        <NavItem icon={<MailIcon className="w-5 h-5" />} label="Mensagens" active={currentPage === 'messages'} onClick={() => onNavigate('messages')} />
        <NavItem icon={<BellIcon className="w-5 h-5" />} label="Notificações" active={currentPage === 'notifications'} onClick={() => onNavigate('notifications')} />
        <NavItem icon={<CogIcon className="w-5 h-5" />} label="Configurações" active={currentPage === 'settings'} onClick={() => onNavigate('settings')} />
      </div>

      {/* Section 2: Events */}
      <SectionTitle title="Eventos" />
      <div className="space-y-1">
        <NavItem icon={<CalendarIcon className="w-5 h-5" />} label="Eventos" active={currentPage === 'events' || currentPage === 'event-details'} onClick={() => onNavigate('events')} />
      </div>

      {/* Section 3: Premium */}
      <SectionTitle title="Premium" />
      <div className="space-y-1">
        <NavItem isPremium icon={<DiamondIcon className="w-5 h-5" />} label="EVO+" active={currentPage === 'premium'} onClick={() => onNavigate('premium')} />
      </div>

      {/* Section 4: System */}
      <SectionTitle title="Sistema" />
      <div className="space-y-1">
        <NavItem icon={<MegaphoneIcon className="w-5 h-5" />} label="Central EVO" active={currentPage === 'central-evo'} onClick={() => onNavigate('central-evo')} />
        <NavItem icon={<ShoppingBagIcon className="w-5 h-5" />} label="EVO Store" active={currentPage === 'shop'} onClick={() => onNavigate('shop')} />
      </div>

      {/* Section 5: Admin (Conditional) */}
      {(user.app_role === 'master' || user.app_role === 'admin' || user.role === 'master') && (
        <>
          <SectionTitle title="Administração" />
          <div className="space-y-1">
            <NavItem
              isAdmin
              icon={<LightningBoltIcon className="w-5 h-5" />}
              label="AdminHub"
              active={currentPage === 'admin-hub'}
              onClick={() => onNavigate('admin-hub')}
            />
          </div>
        </>
      )}

      {/* Logout Button */}
      <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-white/10">
        <button
          onClick={onLogout}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 group"
        >
          <span className="flex-shrink-0">
            <LogoutIcon className="w-5 h-5" />
          </span>
          <span className="text-sm font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarLeft;

import React from 'react';
import { 
  HomeIcon, HomeIconSolid,
  UserGroupIcon, UserGroupIconSolid,
  ChatBubbleIcon, ChatBubbleIconSolid,
  SearchIcon, SearchIconSolid,
  UserIcon, UserIconSolid 
} from './icons';
import { User, Page } from '../types';

interface MobileBottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  userProfile: User | null;
  unreadMessagesCount: number;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
  userProfile,
  unreadMessagesCount,
}) => {
  const navItems = [
    { id: 'feed', label: 'Home', icon: HomeIcon, solidIcon: HomeIconSolid },
    { id: 'connections', label: 'Conexões', icon: UserGroupIcon, solidIcon: UserGroupIconSolid },
    { id: 'messages', label: 'Mensagem', icon: ChatBubbleIcon, solidIcon: ChatBubbleIconSolid },
    { id: 'search', label: 'Explorar', icon: SearchIcon, solidIcon: SearchIconSolid },
    { id: 'profile', label: 'Perfil', icon: UserIcon, solidIcon: UserIconSolid }, // Handled specially for avatar
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-[#121212] border-t border-slate-200 dark:border-white/10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)] transition-colors duration-300">
      <nav className="flex justify-between items-center h-[64px] sm:h-[72px] px-2 max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const isProfile = item.id === 'profile';
          const isMessages = item.id === 'messages';

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Page)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-all duration-300 relative ${
                isActive ? 'text-evo-purple scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              aria-label={item.label}
            >
              <div className="relative flex items-center justify-center">
                {isProfile ? (
                  userProfile?.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt="Perfil" 
                      className={`w-[28px] h-[28px] sm:w-8 sm:h-8 rounded-full object-cover transition-all ${isActive ? 'ring-2 ring-evo-purple ring-offset-2 dark:ring-offset-[#121212]' : ''}`} 
                    />
                  ) : (
                    isActive ? (
                      <UserIconSolid className="w-[28px] h-[28px] sm:w-8 sm:h-8" />
                    ) : (
                      <UserIcon className="w-[28px] h-[28px] sm:w-8 sm:h-8" />
                    )
                  )
                ) : (
                  isActive ? (
                    item.solidIcon && <item.solidIcon className="w-[28px] h-[28px] sm:w-8 sm:h-8" />
                  ) : (
                    item.icon && <item.icon className="w-[28px] h-[28px] sm:w-8 sm:h-8" />
                  )
                )}

                {/* Badge for Messages */}
                {isMessages && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] sm:text-[11px] font-bold text-white border-2 border-white dark:border-[#121212] shadow-sm transform scale-100 animate-fade-in">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </div>
              
              {/* Active Indicator underneath */}
              {isActive && (
                <span className="absolute top-0 w-10 h-[3px] bg-evo-purple rounded-b-full transition-all duration-300" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;

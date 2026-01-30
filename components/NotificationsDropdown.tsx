
import React, { useEffect } from 'react';
import { Notification } from '../types';

interface NotificationsDropdownProps {
  notifications: Notification[];
  isSidebar?: boolean;
  onViewAll?: () => void;
}

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ notifications, isSidebar, onViewAll }) => {
  const positionClasses = isSidebar
    ? 'absolute top-0 left-full ml-2 w-80 md:w-96'
    : 'absolute top-full right-0 mt-2 w-80 md:w-96';

  useEffect(() => {
    const styleId = 'notifications-dropdown-animation';
    if (document.getElementById(styleId)) {
      return;
    }
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fade-in-down {
        0% {
          opacity: 0;
          transform: translateY(-10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in-down {
        animation: fade-in-down 0.2s ease-out forwards;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  return (
    <div className={`${positionClasses} bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden animate-fade-in-down z-40`}>
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Notificações</h3>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <li key={notification.id} className="p-4 hover:bg-light dark:hover:bg-slate-700/50 transition-colors duration-200 cursor-pointer">
              <div className="flex items-start space-x-3">
                <img src={notification.actor?.avatar_url || 'https://via.placeholder.com/150'} alt={notification.actor?.name || 'User'} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="text-sm text-slate-800 dark:text-slate-200">
                    <span className="font-bold">{notification.actor?.name || 'Alguém'}</span> {notification.action}
                    {notification.target && <span className="font-semibold text-gray-text"> "{notification.target}"</span>}
                  </p>
                  <p className="text-xs text-primary mt-1">{new Date(notification.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </li>
          ))
        ) : (
          <li className="p-4 text-center text-gray-text">
            Nenhuma notificação nova.
          </li>
        )}
      </ul>
      <div className="p-2 bg-light dark:bg-dark border-t border-slate-200/50 dark:border-slate-700/50 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent closing dropdown immediately if handled upstream incorrectly
            if (onViewAll) onViewAll();
          }}
          className="text-sm font-semibold text-primary hover:underline w-full py-2 block"
        >
          Ver todas
        </button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;
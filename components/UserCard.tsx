
import React from 'react';
import { User } from '../types';

interface UserCardProps {
  user: User;
  onSecondaryAction: () => void;
  secondaryActionLabel: string;
  onViewProfile?: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onSecondaryAction, secondaryActionLabel, onViewProfile }) => {
  const isDangerAction = secondaryActionLabel === 'Remover';
  const actionButtonClasses = isDangerAction 
    ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20'
    : 'text-primary-dark border border-primary-dark/50 hover:bg-primary-dark/5 dark:text-white dark:border-white/30 dark:hover:border-white dark:hover:bg-white/5';

  return (
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative cursor-pointer" onClick={() => onViewProfile && onViewProfile(user)}>
        <img
          src={user.coverUrl || 'https://picsum.photos/id/1018/400/120'}
          alt={`${user.name}'s cover`}
          className="w-full h-24 object-cover"
        />
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-surface-light dark:border-surface-dark shadow-md"
          />
        </div>
      </div>
      <div className="pt-14 p-4 flex flex-col items-center text-center flex-grow cursor-pointer" onClick={() => onViewProfile && onViewProfile(user)}>
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">{user.name}</h3>
        <p className="text-sm text-gray-text dark:text-slate-400">@{user.username}</p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 flex-grow">{user.bio?.substring(0, 70)}{user.bio && user.bio.length > 70 ? '...' : ''}</p>
      </div>
      <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-center space-x-2">
        <button 
            onClick={() => onViewProfile && onViewProfile(user)}
            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-primary-dark rounded-full hover:bg-primary/90 transition-colors shadow-sm"
        >
          Ver Perfil
        </button>
        <button 
          onClick={onSecondaryAction}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${actionButtonClasses}`}
        >
          {secondaryActionLabel}
        </button>
      </div>
    </div>
  );
};

export default UserCard;

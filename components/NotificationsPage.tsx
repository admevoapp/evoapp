
import React, { useState, useEffect } from 'react';
import { Notification, User } from '../types';
import { BellIcon, CheckCircleIcon, HeartIcon, ChatBubbleIcon, UserIcon, TrashIcon, MailIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { useModal } from '../contexts/ModalContext';

interface NotificationsPageProps {
  user: User;
  onViewProfile?: (user: User) => void;
}

type FilterType = 'all' | 'unread' | 'likes' | 'comments' | 'follows' | 'messages';

const NotificationsPage: React.FC<NotificationsPageProps> = ({ user, onViewProfile }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!actor_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Map the response to our Notification type
      const mappedNotifs: Notification[] = (data || []).map((n: any) => ({
        id: n.id,
        user_id: n.user_id,
        actor: n.actor ? {
          id: n.actor.id,
          name: n.actor.full_name || n.actor.username || 'Usuário',
          avatar_url: n.actor.avatar_url,
          username: n.actor.username
        } : undefined,
        action: n.action,
        target: n.target,
        target_id: n.target_id,
        is_read: n.is_read,
        created_at: n.created_at
      }));

      setNotifications(mappedNotifs);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const subscription = supabase
      .channel('notifications_channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  useEffect(() => {
    const styleId = 'page-fade-in-animation';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeInPage { 
        from { opacity: 0; transform: translateY(10px); } 
        to { opacity: 1; transform: translateY(0); } 
      }
      .animate-fade-in-page { 
        animation: fadeInPage 0.5s ease-out forwards; 
      }
    `;
    document.head.appendChild(style);
  }, []);

  const { showAlert, showConfirm } = useModal();

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

    } catch (error) {
      console.error('Erro ao marcar como lidas:', error);
      await showAlert('Erro', 'Não foi possível atualizar as notificações. Tente novamente.');
    }
  };

  const handleClearAll = async () => {
    const confirmed = await showConfirm(
      'Limpar Histórico',
      'Deseja realmente limpar todas as suas notificações? Esta ação não pode ser desfeita.',
      { icon: <TrashIcon className="w-8 h-8 text-red-500" /> }
    );

    if (confirmed) {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;

        setNotifications([]);
      } catch (error) {
        console.error('Erro ao limpar notificações:', error);
        await showAlert('Erro', 'Não foi possível limpar as notificações.');
      }
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notification.id);

        setNotifications(prev => prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        ));
      } catch (e) {
        console.error(e);
      }
    }

    if (notification.actor && onViewProfile) {
      const actorUser: Partial<User> = {
        id: notification.actor.id,
        name: notification.actor.name,
        username: notification.actor.username,
        avatarUrl: notification.actor.avatar_url
      };
      onViewProfile(actorUser as User);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('curtiu')) return <div className="bg-pink-100 dark:bg-pink-900/30 p-1.5 rounded-full"><HeartIcon className="w-4 h-4 text-pink-500" filled /></div>;
    if (action.includes('comentou')) return <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full"><ChatBubbleIcon className="w-4 h-4 text-blue-500" /></div>;
    if (action.includes('seguir') || action.includes('conectou')) return <div className="bg-purple-100 dark:bg-purple-900/30 p-1.5 rounded-full"><UserIcon className="w-4 h-4 text-evo-purple" /></div>;
    if (action.includes('mensagem')) return <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-full"><MailIcon className="w-4 h-4 text-indigo-500" /></div>;
    return <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded-full"><BellIcon className="w-4 h-4 text-slate-500" /></div>;
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);

    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const isYesterday = (dateString: string) => {
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    if (filter === 'likes') return n.action.includes('curtiu');
    if (filter === 'comments') return n.action.includes('comentou');
    if (filter === 'follows') return n.action.includes('seguir') || n.action.includes('conectou');
    if (filter === 'messages') return n.action.includes('mensagem');
    return true;
  });

  // Group notifications
  const groups = {
    today: filteredNotifications.filter(n => isToday(n.created_at)),
    yesterday: filteredNotifications.filter(n => isYesterday(n.created_at)),
    earlier: filteredNotifications.filter(n => !isToday(n.created_at) && !isYesterday(n.created_at))
  };

  const renderNotificationItem = (notification: Notification) => (
    <div
      key={notification.id}
      className={`p-4 rounded-xl transition-all duration-200 flex items-start gap-4 cursor-pointer mb-3 border ${!notification.is_read
        ? 'bg-gradient-to-r from-evo-purple/5 to-transparent border-evo-purple/20'
        : 'bg-white dark:bg-[#1E1E20] hover:bg-slate-50 dark:hover:bg-[#252527] border-slate-200 dark:border-slate-800'
        }`}
      onClick={() => handleNotificationClick(notification)}
    >
      <div className="relative shrink-0">
        {notification.actor?.avatar_url ? (
          <img
            src={notification.actor.avatar_url}
            alt={notification.actor.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-[#1E1E20]"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-white dark:border-[#1E1E20]">
            <UserIcon className="w-6 h-6 text-slate-400" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 shadow-sm rounded-full bg-white dark:bg-[#1E1E20]">
          {getActionIcon(notification.action)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
            <span className="font-bold hover:text-evo-purple transition-colors cursor-pointer">
              {notification.actor?.name || 'Alguém'}
            </span>
            <span className="text-slate-600 dark:text-slate-400"> {notification.action}</span>
            {notification.target && (
              <span className="font-medium text-slate-900 dark:text-slate-100"> "{notification.target}"</span>
            )}
          </p>
          {!notification.is_read && (
            <span className="w-2 h-2 bg-evo-purple rounded-full shrink-0 mt-2"></span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1">{formatTime(notification.created_at)}</p>
      </div>
    </div>
  );

  if (loading && notifications.length === 0) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evo-purple"></div>
      </div>
    );
  }

  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'unread', label: 'Não lidas' },
    { id: 'likes', label: 'Curtidas' },
    { id: 'comments', label: 'Comentários' },
    { id: 'follows', label: 'Conexões' },
    { id: 'messages', label: 'Mensagens' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-page pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Notificações</h1>
          <div className="flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Marcar todas como lidas"
            >
              <CheckCircleIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleClearAll}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
              title="Limpar tudo"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Gerencie suas interações e alertas.</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as FilterType)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.id
              ? 'bg-evo-purple text-white shadow-lg shadow-evo-purple/25'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-surface-dark rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">🔔 Tudo em dia</h3>
            <p className="text-slate-500 dark:text-slate-400">Aqui você será avisado apenas quando algo realmente importar:<br />
              conexões, mensagens e interações reais.</p>
          </div>
        ) : (
          <>
            {groups.today.length > 0 && (
              <section className="animate-fade-in-up">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-1">Hoje</h3>
                {groups.today.map(renderNotificationItem)}
              </section>
            )}

            {groups.yesterday.length > 0 && (
              <section className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-1">Ontem</h3>
                {groups.yesterday.map(renderNotificationItem)}
              </section>
            )}

            {groups.earlier.length > 0 && (
              <section className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 ml-1">Anteriores</h3>
                {groups.earlier.map(renderNotificationItem)}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

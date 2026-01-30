
import React, { useState, useEffect, useRef } from 'react';
import SidebarLeft from './SidebarLeft';
import Feed from './Feed';
import SidebarRight from './SidebarRight';
import ProfilePage from './ProfilePage';
import ConnectionsPage from './ConnectionsPage';
import FavoritesPage from './FavoritesPage';
import MessagesPage from './MessagesPage';
import SettingsPage from './SettingsPage';
import SearchPage from './SearchPage';
import EventsPage from './EventsPage';
import EventDetailsPage from './EventDetailsPage';
import AboutPage from './AboutPage';
import MissionPage from './MissionPage';
import HowItWorksPage from './HowItWorksPage';
import AdminsPage from './AdminsPage';
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';
import GuidelinesPage from './GuidelinesPage';
import CookiesPage from './CookiesPage';
import LibraryPage from './LibraryPage';
import BestPracticesPage from './BestPracticesPage';
import HelpCenterPage from './HelpCenterPage';
import ContactPage from './ContactPage';
import ReportPage from './ReportPage';
import PremiumPage from './PremiumPage';
import ShopPage from './ShopPage';
import CentralEvoPage from './CentralEvoPage';
import NotificationsPage from './NotificationsPage'; // Import new page
import { Post, Message, User, Page, Event, Notification } from '../types';
import { mockPosts, currentUser, mockNotifications, mockUsers, mockMessages, DEFAULT_AVATAR_URL } from '../constants';
import {
  LogoIcon, BellIcon, MailIcon, SearchIcon, MenuIcon, XMarkIcon,
  ShoppingBagIcon, DiamondIcon, MegaphoneIcon, CogIcon, LogoutIcon, UserIcon,
  QuoteIcon, AcademicCapIcon, PresentationChartLineIcon, SunIcon, MoonIcon, TrashIcon, BanIcon, LightningBoltIcon
} from './icons';
import { supabase } from '../lib/supabaseClient';
import NotificationsDropdown from './NotificationsDropdown';
import Footer from './Footer';
import AdminLayout from './admin/AdminLayout';
import { useModal } from '../contexts/ModalContext';
import { useCart } from '../contexts/CartContext';
import CartDrawer from './CartDrawer';

interface MainLayoutProps {
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'profile' | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('feed');
  const [targetChatUserId, setTargetChatUserId] = useState<number | string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [favoritedUserIds, setFavoritedUserIds] = useState<(number | string)[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNewCentralItems, setHasNewCentralItems] = useState(false);

  // Theme State - Default to false (Light)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch real user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('MainLayout: User authenticated in App but getUser() returned null. Forcing logout.');
          await supabase.auth.signOut();
          onLogout();
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error || !data) {
          console.error('Profile not found, forcing logout:', error);
          await supabase.auth.signOut();
          onLogout();
          return;
        }

        // Fetch Favorites (now from connections table)
        const { data: favoritesData } = await supabase
          .from('connections')
          .select('friend_id')
          .eq('user_id', user.id)
          .eq('favorites', true)
          .eq('status', 'active');

        if (data) {
          setUserProfile(prev => ({
            ...prev,
            id: user.id,
            name: data.full_name || prev?.name || '',
            username: data.username || prev?.username || '',
            avatarUrl: data.avatar_url || DEFAULT_AVATAR_URL,
            coverUrl: data.cover_url || '',
            bio: data.bio || '',
            profession: data.profession || '',
            behavioralProfile: data.behavioral_profile || '',
            location: data.location || {},
            evoStatus: data.evo_status || prev?.evoStatus,
            socials: data.socials || {},
            gallery: data.gallery || [],
            mission: data.mission || '',
            helpArea: data.help_area || '',
            classYear: data.class_year || '',
            maritalStatus: data.marital_status || '',
            app_role: data.app_role || 'user',
            status: data.status || 'active',
            token_version: data.token_version
          }));

          // Force Logout Check (Initial Load)
          const storedVersion = localStorage.getItem('evo_token_version');
          const serverVersion = data.token_version || 0;

          if (storedVersion && parseInt(storedVersion) < serverVersion) {
            // Token is old, force logout
            console.log('Force logout triggered on load (version mismatch)');
            await showAlert(
              'Sessão Encerrada',
              'Sua sessão foi encerrada pelo administrador. Você será redirecionado para o login.',
              { icon: <BanIcon className="w-10 h-10 text-red-500" /> }
            );
            await supabase.auth.signOut();
            onLogout();
            return;
          }

          // Update local version
          localStorage.setItem('evo_token_version', String(serverVersion));
        }

        if (favoritesData) {
          setFavoritedUserIds(favoritesData.map((f: any) => f.friend_id));
        }

        // Check for new Central Evo items
        const { data: latestItem } = await supabase
          .from('central_items')
          .select('created_at')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (latestItem) {
          const lastViewed = localStorage.getItem('evo_last_viewed_central');
          if (!lastViewed || new Date(latestItem.created_at) > new Date(lastViewed)) {
            setHasNewCentralItems(true);
          }
        }

      } catch (error) {
        console.error('Error fetching profile in MainLayout:', error);
        // Force logout if profile is missing (User deleted but session persists)
        // Check if error is specifically "row not found" (PGRST116) or if we just have a general failure that implies inconsistent state
        // For safety, we can check if error is present and we have no userProfile yet.
        await supabase.auth.signOut();
        onLogout();
      }
    };

    fetchProfile();

    // Subscribe to realtime profile changes
    const profileSubscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, (payload: any) => {
        if (payload.new && userProfile && payload.new.id === userProfile.id) {
          // Update local state with new profile data
          setUserProfile(prev => {
            if (!prev) return null;
            return {
              ...prev,
              name: payload.new.full_name || prev.name,
              username: payload.new.username || prev.username,
              avatarUrl: payload.new.avatar_url || prev.avatarUrl || DEFAULT_AVATAR_URL,
              coverUrl: payload.new.cover_url || prev.coverUrl,
              bio: payload.new.bio || prev.bio,
              profession: payload.new.profession || prev.profession,
              behavioralProfile: payload.new.behavioral_profile || prev.behavioralProfile,
              location: payload.new.location || prev.location,
              evoStatus: payload.new.evo_status || prev.evoStatus,
              socials: payload.new.socials || prev.socials,
              gallery: payload.new.gallery || prev.gallery,
              mission: payload.new.mission || prev.mission,
              helpArea: payload.new.help_area || prev.helpArea,
              classYear: payload.new.class_year || prev.classYear,
              maritalStatus: payload.new.marital_status || prev.maritalStatus,
              app_role: payload.new.app_role || prev.app_role,
              status: payload.new.status || prev.status, // Ensure status is updated
              token_version: payload.new.token_version || prev.token_version
            };
          });

          // Check for Force Logout (Realtime)
          if (payload.new.token_version && userProfile && payload.new.token_version > (userProfile.token_version || 0)) {
            console.log('Force logout triggered via realtime');
            const handleAsyncLogout = async () => {
              await showAlert(
                'Sessão Encerrada',
                'Sua sessão foi encerrada pelo administrador.',
                { icon: <BanIcon className="w-10 h-10 text-red-500" /> }
              );
              await supabase.auth.signOut();
              onLogout();
            };
            handleAsyncLogout();
          }
        } else {
          // If we don't have userProfile yet but we have the ID from auth
          supabase.auth.getUser().then(({ data: { user } }) => {
            if (user && payload.new.id === user.id) {
              fetchProfile(); // Refetch if we missed the state sync
            }
          });
        }
      })
      .subscribe();

    return () => {
      profileSubscription.unsubscribe();
    };
  }, [userProfile?.id]); // Re-subscribe if ID changes (login/logout)

  // Apply theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync viewingUser with userProfile when userProfile loads
  useEffect(() => {
    if (userProfile && !viewingUser) {
      setViewingUser(userProfile);
    }

    // Redirect Master Admin to AdminHub
    if (userProfile?.app_role === 'master' && currentPage === 'feed') {
      setCurrentPage('admin-hub');
    }

    // Force Logout if Blocked
    if (userProfile?.status === 'blocked') {
      const handleBlockedUser = async () => {
        await showAlert('Conta Banida', 'Sua conta foi banida permanentemente por violar as diretrizes da comunidade.', { type: 'danger', icon: <BanIcon className="w-10 h-10 text-red-500" /> });
        await supabase.auth.signOut();
        onLogout();
      };
      handleBlockedUser();
    }
  }, [userProfile, viewingUser, currentPage]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch unread count
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!countError) {
        setUnreadCount(count || 0);
      }

      // Fetch latest notifications for dropdown
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
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const mappedNotifs: Notification[] = (data || []).map((n: any) => ({
        id: n.id,
        user_id: n.user_id,
        actor: n.actor ? {
          id: n.actor.id,
          name: n.actor.full_name || n.actor.username || 'Usuário',
          avatar_url: n.actor.avatar_url || DEFAULT_AVATAR_URL,
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
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const subscription = supabase
      .channel('main_layout_notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, (payload: any) => {
        // We can optimize this by checking if the notification belongs to current user
        // But for simplicity and security (RLS might not filter socket events fully on client side logic without deeper check), we just refetch if it looks relevant or just refetch always.
        // Actually, realtime payloads include columns.
        if (payload.new && userProfile && payload.new.user_id === userProfile.id) {
          fetchNotifications();
        } else if (payload.old && userProfile && payload.old.user_id === userProfile.id) {
          fetchNotifications(); // Handle deletions or reads
        }
        // Fallback: just refetch for now to be safe
        fetchNotifications();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userProfile?.id]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const headerDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Should allow public view? Maybe. For now assume auth.

      // 1. Fetch Connected IDs (Following + Favorites)
      const { data: favoriteConnections } = await supabase
        .from('connections')
        .select('friend_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .eq('favorites', true);

      // Include self and friends (favorites only)
      const allowedUserIds = [user.id, ...(favoriteConnections?.map((c: any) => c.friend_id) || [])];

      // 2. Fetch Posts (Filtered) (Only Me + Following)
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!posts_user_id_fkey(id, full_name, username, avatar_url, profession, evo_status),
          likes(count),
          comments(count)
        `)
        .in('user_id', allowedUserIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // 2. Fetch My Likes
      const { data: myLikes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id);

      const myLikedIds = new Set(myLikes?.map((l: any) => l.post_id));

      // 3. Map Data
      const mappedPosts: Post[] = data.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        author: {
          id: p.author.id,
          name: p.author.full_name || 'Usuário',
          username: p.author.username || 'user',
          avatarUrl: p.author.avatar_url || DEFAULT_AVATAR_URL,
          profession: p.author.profession,
          evoStatus: p.author.evo_status
          // Simplified user object
        } as User,
        content: p.content,
        imageUrl: p.image_url,
        likes: p.likes?.[0]?.count || 0,
        comments: p.comments?.[0]?.count || 0,
        timestamp: new Date(p.created_at).toLocaleString('pt-BR'),
        isLiked: myLikedIds.has(p.id),
      }));

      setPosts(mappedPosts);

    } catch (e) {
      console.error('Exception fetching posts:', e);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUpdateUser = (updatedUser: User) => {
    setUserProfile(updatedUser);
    if (viewingUser && updatedUser.id === viewingUser.id) {
      setViewingUser(updatedUser);
    }
  };

  const handleCreatePost = (content: string, imageUrl?: string) => {
    // Just refresh data as CreatePost component handles insertion
    fetchPosts();
  };

  const { showConfirm, showAlert } = useModal();
  const { toggleCart, cartCount } = useCart();
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const handleDeletePost = async (postId: number) => {
    const confirmed = await showConfirm(
      'Excluir Publicação',
      'Tem certeza que deseja excluir esta publicação? Esta ação não pode ser desfeita.',
      { icon: <TrashIcon className="w-8 h-8 text-red-500" /> }
    );

    if (confirmed) {
      setIsDeletingPost(true);
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);

        if (error) throw error;
        fetchPosts(); // Refresh
      } catch (e) {
        console.error('Error deleting post:', e);
        await showAlert('Erro', 'Erro ao excluir post.');
      } finally {
        setIsDeletingPost(false);
      }
    }
  };

  // confirmDeletePost is no longer needed as logic is inside handleDeletePost

  const handleEditPost = (postId: number, newContent: string) => {
    // TODO: Implement edit logic via Supabase
    setPosts(posts.map(post => post.id === postId ? { ...post, content: newContent } : post));
  };

  const handleSendMessage = (receiverId: number | string, text: string) => {
    const newMessage: Message = {
      id: Date.now(),
      senderId: userProfile.id,
      receiverId,
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([...messages, newMessage]);
  };

  const handleStartChat = (userId: number | string) => {
    setTargetChatUserId(userId);
    setCurrentPage('messages');
  };

  const handleLikeToggle = async (postId: number) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.isLiked;

      // Optimistic update
      setPosts(posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !isLiked,
            likes: isLiked ? Math.max(0, p.likes - 1) : p.likes + 1
          };
        }
        return p;
      }));

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .match({ user_id: userProfile?.id, post_id: postId });
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: userProfile?.id, post_id: postId });
        if (error) throw error;
      }
    } catch (e) {
      console.error('Error toggling like:', e);
      fetchPosts(); // Revert on error
    }
  };

  const handleNavigate = (page: Page) => {
    if (page === 'profile') {
      setViewingUser(userProfile);
    }

    // Clear Central Evo notification
    if (page === 'central-evo') {
      localStorage.setItem('evo_last_viewed_central', new Date().toISOString());
      setHasNewCentralItems(false);
    }

    setCurrentPage(page);
    if (page !== 'messages') {
      setTargetChatUserId(null);
    }
    setShowMobileMenu(false);
    setActiveDropdown(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleViewProfile = async (user: User) => {
    // Check if user object is "incomplete" (likely from notification)
    // If we only have basic info but missing detailed fields like bio/cover/profession
    const isPartial = !user.bio && !user.coverUrl && !user.profession && !user.evoStatus;

    if (isPartial) {
      // Prevent viewing master profile if desired, or just allow but they are hidden
      if (user.app_role === 'master') return;

      // Optimistically navigate immediately with what we have (optional, or wait?)
      // Better to show partial then update, OR wait. 
      // Let's set partial first so interaction feels instant, then fetch and update?
      // Actually, if we set partial, ProfilePage renders partial. 
      // If we fetch then set, there is a delay. 
      // Let's set partial, navigate, THEN fetch and update.
      setViewingUser(user);
      setCurrentPage('profile');
      setShowMobileMenu(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data && !error) {
          const fullUser: User = {
            ...user, // Keep ID/Name/Avatar we had
            // Overwrite with DB data
            name: data.full_name || user.name,
            username: data.username || user.username,
            avatarUrl: data.avatar_url || user.avatarUrl || DEFAULT_AVATAR_URL,
            coverUrl: data.cover_url || '',
            bio: data.bio || '',
            profession: data.profession || '',
            behavioralProfile: data.behavioral_profile || '',
            location: data.location || {},
            evoStatus: data.evo_status,
            socials: data.socials || {},
            gallery: data.gallery || [],
            mission: data.mission || '',
            helpArea: data.help_area || '',
            classYear: data.class_year || '',
            maritalStatus: data.marital_status || '',
            app_role: data.app_role || 'user'
          };
          setViewingUser(fullUser);
        }
      } catch (err) {
        console.error("Error fetching full profile:", err);
      }

    } else {
      // Data is already robust (e.g. from Feed or Sidebar)
      setViewingUser(user);
      setCurrentPage('profile');
      setShowMobileMenu(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setCurrentPage('event-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = async (userId: number | string) => {
    // Ensure both IDs are compared as strings to avoid type mismatches
    const isFavorited = favoritedUserIds.some(id => String(id) === String(userId));

    // Optimistic Update
    setFavoritedUserIds(prev =>
      isFavorited
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );

    try {
      // Update connections table
      const newFavoriteStatus = !isFavorited;
      const { error } = await supabase
        .from('connections')
        .update({ favorites: newFavoriteStatus })
        .match({ user_id: userProfile?.id, friend_id: userId });

      if (error) throw error;

    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimism
      setFavoritedUserIds(prev => isFavorited ? [...prev, userId] : prev.filter(id => id !== userId));
      showAlert('Erro', 'Erro ao atualizar favoritos. Verifique se você está conectado a este usuário.');
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(event.target as Node)) {
        if (activeDropdown === 'notifications') setActiveDropdown(null);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        if (activeDropdown === 'profile') setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  // Placeholder components for new pages
  const PlaceholderPage: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#1C1C1E] rounded-2xl border border-white/10 animate-fade-in">
      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 text-evo-purple">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-slate-400">Esta funcionalidade estará disponível em breve para a comunidade.</p>
    </div>
  );

  // Separate render logic for AdminHub
  const isAdmin = userProfile?.app_role === 'master' || userProfile?.app_role === 'admin' || userProfile?.role === 'master';

  if (currentPage === 'admin-hub' && isAdmin) {
    return (
      <div className="min-h-screen bg-[#121212] text-slate-200 font-sans selection:bg-evo-purple selection:text-white">
        <AdminLayout
          onLogout={onLogout}
          onBackToApp={() => setCurrentPage('feed')}
          onViewProfile={handleViewProfile}
        />
      </div>
    );
  }

  if (!userProfile || !viewingUser) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center font-sans text-slate-200">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-evo-purple/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-evo-purple border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <h2 className="text-xl font-semibold text-white">Carregando EVOAPP</h2>
            <p className="text-slate-400">Preparando seu ecossistema de evolução...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light dark:bg-[#121212] min-h-screen flex flex-col font-sans text-slate-800 dark:text-slate-200 selection:bg-evo-purple selection:text-white transition-colors duration-300">

      {/* 1. TOP NAV */}
      <header className="fixed top-0 left-0 right-0 bg-surface-light/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-slate-200/50 dark:border-white/10 z-40 h-16 transition-all duration-300">
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">

            {/* Left: Logo */}
            <button onClick={() => handleNavigate('feed')} className="flex items-center space-x-3 group" aria-label="Go to homepage">
              <img
                src={isDarkMode
                  ? "https://static.wixstatic.com/media/8c7f55_75ce25282b0a45fcadd8df9bae146b16~mv2.png"
                  : "https://static.wixstatic.com/media/8c7f55_9b887c8ceb744ce9a6eaf5fcea98de06~mv2.png"
                }
                alt="EVOAPP Logo"
                className="h-9 w-auto group-hover:scale-105 transition-transform"
              />
            </button>

            {/* Center: Search Bar (Button) */}
            <div className="flex-1 max-w-lg mx-6 hidden md:block">
              <button
                onClick={() => handleNavigate('search')}
                className="relative w-full h-10 pl-10 pr-4 text-sm text-left bg-slate-100 dark:bg-[#1C1C1E] border border-transparent dark:border-white/10 rounded-full text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-200 dark:hover:bg-[#252527] transition-all group focus:outline-none focus:ring-2 focus:ring-evo-purple/50"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-hover:text-evo-purple transition-colors">
                  <SearchIcon className="w-5 h-5" />
                </div>
                <span className="truncate">Pesquisar na comunidade...</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Trigger */}
              <button className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white" onClick={() => handleNavigate('search')}>
                <SearchIcon className="w-6 h-6" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="hidden sm:block p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>

              {/* Cart Button */}
              <button
                onClick={toggleCart}
                className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors relative"
                title="Carrinho"
              >
                <ShoppingBagIcon className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-evo-purple text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Notifications */}
              <div className="relative" ref={headerDropdownRef}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'notifications' ? null : 'notifications')}
                  className={`p-2 rounded-full transition-all duration-200 ${activeDropdown === 'notifications' ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-evo-orange opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-evo-orange border border-white dark:border-[#121212]"></span>
                    </span>
                  )}
                </button>
                {activeDropdown === 'notifications' && (
                  <NotificationsDropdown
                    notifications={notifications}
                    onViewAll={() => handleNavigate('notifications')}
                  />
                )}
              </div>

              <button
                onClick={() => handleNavigate('central-evo')}
                className="hidden sm:block p-2 text-slate-400 hover:text-evo-blue hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors relative"
                title="Central EVO (Avisos)"
              >
                <MegaphoneIcon className="w-5 h-5" />
                {hasNewCentralItems && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-[#121212]"></span>
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavigate('messages')}
                className="hidden sm:block p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors"
                title="Mensagens"
              >
                <MailIcon className="w-5 h-5" />
              </button>

              <div className="relative ml-2" ref={profileDropdownRef}>
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  {userProfile.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-9 h-9 rounded-full ring-2 ring-transparent hover:ring-evo-purple transition-all object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-2 ring-transparent hover:ring-evo-purple transition-all text-slate-400 dark:text-slate-500">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  )}
                </button>

                {activeDropdown === 'profile' && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in-down origin-top-right">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5">
                      <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{userProfile.name}</p>
                      <p className="text-xs text-slate-500 truncate">@{userProfile.username}</p>
                    </div>
                    <div className="py-2">
                      <button onClick={() => handleNavigate('profile')} className="flex items-center w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <UserIcon className="w-4 h-4 mr-3" /> Meu Perfil
                      </button>
                      <button onClick={() => handleNavigate('premium')} className="flex items-center w-full px-4 py-2 text-sm text-evo-orange hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        <DiamondIcon className="w-4 h-4 mr-3" /> Assinatura
                      </button>
                      <button onClick={() => handleNavigate('settings')} className="flex items-center w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <CogIcon className="w-4 h-4 mr-3" /> Configurações
                      </button>
                      {(userProfile.app_role === 'master' || userProfile.app_role === 'admin' || userProfile.role === 'master') && (
                        <button onClick={() => handleNavigate('admin-hub')} className="flex items-center w-full px-4 py-2 text-sm text-evo-blue hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                          <LightningBoltIcon className="w-4 h-4 mr-3" /> Admin Hub
                        </button>
                      )}
                      <div className="h-px bg-slate-200 dark:bg-white/5 my-1 mx-4"></div>
                      <button onClick={toggleTheme} className="flex md:hidden items-center w-full px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                        {isDarkMode ? <SunIcon className="w-4 h-4 mr-3" /> : <MoonIcon className="w-4 h-4 mr-3" />}
                        {isDarkMode ? "Modo Claro" : "Modo Escuro"}
                      </button>
                      <button onClick={onLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <LogoutIcon className="w-4 h-4 mr-3" /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowMobileMenu(true)}
                className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <MenuIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Main Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 flex-grow">
        <div className="grid grid-cols-12 gap-6 lg:gap-8">

          {/* 2. SIDEBAR LEFT */}
          <aside className="hidden md:block md:col-span-3">
            <div className="sticky top-24 h-[calc(100vh-7rem)]">
              <SidebarLeft
                user={userProfile}
                onLogout={onLogout}
                currentPage={currentPage}
                onNavigate={handleNavigate}
              />
            </div>
          </aside>

          {/* 3. CENTER FEED */}
          <main className="col-span-12 md:col-span-9 lg:col-span-6 min-h-screen">
            {currentPage === 'feed' && (
              <Feed
                currentUser={userProfile}
                posts={posts}
                onCreatePost={handleCreatePost}
                onLikeToggle={handleLikeToggle}
                onViewProfile={handleViewProfile}
                onDeletePost={handleDeletePost}
                onEditPost={handleEditPost}
                onNavigate={handleNavigate}
                onViewEvent={handleViewEvent}
              />
            )}
            {currentPage === 'profile' && (
              <ProfilePage
                user={viewingUser}
                posts={posts.filter(p => p.author.id === viewingUser.id)}
                onLikeToggle={handleLikeToggle}
                onDeletePost={handleDeletePost}
                onEditPost={handleEditPost}
                isFavorited={favoritedUserIds.includes(viewingUser.id)}
                onToggleFavorite={handleToggleFavorite}
                ownFavoritesCount={favoritedUserIds.length}
                currentUser={userProfile}
                onStartChat={handleStartChat}
              />
            )}
            {currentPage === 'connections' && <ConnectionsPage user={userProfile} allUsers={mockUsers} onViewProfile={handleViewProfile} />}
            {currentPage === 'favorites' && <FavoritesPage allUsers={mockUsers} favoritedUserIds={favoritedUserIds} onToggleFavorite={handleToggleFavorite} onViewProfile={handleViewProfile} />}
            {currentPage === 'messages' && (
              <MessagesPage
                currentUser={userProfile}
                onSendMessage={handleSendMessage}
                targetUserId={targetChatUserId}
              />
            )}
            {currentPage === 'settings' && <SettingsPage user={userProfile} onUpdateUser={handleUpdateUser} />}
            {currentPage === 'search' && <SearchPage allUsers={mockUsers} onViewProfile={handleViewProfile} currentUser={userProfile} />}
            {currentPage === 'events' && <EventsPage onViewEvent={handleViewEvent} />}
            {currentPage === 'event-details' && selectedEvent && (
              <EventDetailsPage
                event={selectedEvent}
                onBack={() => handleNavigate('events')}
              />
            )}

            {/* Pages from Landing Reuse */}
            {currentPage === 'about' && <AboutPage />}
            {currentPage === 'mission' && <MissionPage />}
            {currentPage === 'how-it-works' && <HowItWorksPage />}
            {currentPage === 'admins' && <AdminsPage onNavigate={handleNavigate} />}
            {currentPage === 'terms' && <TermsPage />}
            {currentPage === 'privacy' && <PrivacyPage />}
            {currentPage === 'guidelines' && <GuidelinesPage />}
            {currentPage === 'cookies' && <CookiesPage />}
            {currentPage === 'library' && <LibraryPage />}
            {currentPage === 'best-practices' && <BestPracticesPage />}
            {currentPage === 'help-center' && <HelpCenterPage onNavigate={handleNavigate} />}
            {currentPage === 'contact' && <ContactPage />}
            {currentPage === 'report' && <ReportPage />}

            {/* New Sections */}
            {currentPage === 'testimonials' && (
              <div className="space-y-6">
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10">
                  <h1 className="text-2xl font-bold text-white mb-2">Amor Radical em Palavras</h1>
                  <p className="text-slate-400">Depoimentos que inspiram e conectam.</p>
                </div>
                <PlaceholderPage title="Depoimentos" icon={<QuoteIcon className="w-10 h-10" />} />
              </div>
            )}
            {currentPage === 'courses' && <PlaceholderPage title="Cursos EVO" icon={<AcademicCapIcon className="w-10 h-10" />} />}
            {currentPage === 'lives' && <PlaceholderPage title="Lives & Webinars" icon={<PresentationChartLineIcon className="w-10 h-10" />} />}

            {/* Integrated New Pages */}
            {currentPage === 'premium' && <PremiumPage />}
            {currentPage === 'shop' && <ShopPage />}
            {currentPage === 'central-evo' && <CentralEvoPage />}
            {currentPage === 'notifications' && <NotificationsPage user={userProfile} onViewProfile={handleViewProfile} />}
          </main>

          {/* 4. SIDEBAR RIGHT */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 h-[calc(100vh-7rem)] overflow-y-auto custom-scrollbar pr-2">
              <SidebarRight
                currentUser={userProfile}
                favoritedUserIds={favoritedUserIds}
                onToggleFavorite={handleToggleFavorite}
                onViewProfile={handleViewProfile}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ease-in-out ${showMobileMenu ? 'visible' : 'invisible'}`}>
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${showMobileMenu ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setShowMobileMenu(false)}
        />
        <div
          className={`absolute top-0 left-0 w-80 h-full bg-surface-light dark:bg-[#1C1C1E] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col border-r border-slate-200/50 dark:border-white/10 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-4 flex justify-between items-center border-b border-slate-200/50 dark:border-white/10 shrink-0">
            <div className="flex items-center space-x-2">
              <img
                src={isDarkMode
                  ? "https://static.wixstatic.com/media/8c7f55_75ce25282b0a45fcadd8df9bae146b16~mv2.png"
                  : "https://static.wixstatic.com/media/8c7f55_9b887c8ceb744ce9a6eaf5fcea98de06~mv2.png"
                }
                alt="EVOAPP Logo"
                className="h-8 w-auto"
              />
            </div>
            <button
              onClick={() => setShowMobileMenu(false)}
              className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-24">
            <SidebarLeft
              user={userProfile}
              onLogout={onLogout}
              currentPage={currentPage}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </div>

      <Footer onNavigate={handleNavigate} className="mt-12" isAuthenticated={true} />

      {/* Delete Confirmation Modal */}

    </div>
  );
};

export default MainLayout;

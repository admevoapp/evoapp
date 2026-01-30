
import React, { useState, useEffect } from 'react';
import { User, Post, Testimonial } from '../types';
import PostCard from './PostCard';
import { InstagramIcon, WhatsAppIcon, LinkedInIcon, QuoteIcon, XMarkIcon, PaperAirplaneIcon, LockClosedIcon, CheckCircleIcon, UsersIcon, StarIcon, TrashIcon, UserIcon, MailIcon } from './icons';
import { mockTestimonials, mockUsers, currentUser as mockCurrentUser, DEFAULT_AVATAR_URL } from '../constants';
import { supabase } from '../lib/supabaseClient';
import ConfirmModal from './ConfirmModal';
import { useModal } from '../contexts/ModalContext';

interface ProfilePageProps {
  user: User;
  posts: Post[];
  onLikeToggle: (postId: number) => void;
  onDeletePost: (postId: number) => void;
  onEditPost?: (postId: number, newContent: string) => void;
  isFavorited?: boolean;
  onToggleFavorite?: (userId: number | string) => void;
  ownFavoritesCount?: number; // Count of favorites for the CURRENT user
  currentUser: User;
  onStartChat?: (userId: number | string) => void;
}

const profileColorMap: { [key: string]: string } = {
  '🔴': 'bg-red-500',
  '🟡': 'bg-yellow-400',
  '🟢': 'bg-green-500',
  '🔵': 'bg-blue-500',
};

const getProfileColors = (profile?: string): string[] => {
  if (!profile) return [];
  // Match red, yellow, green, blue circle emojis
  const emojis = profile.match(/[\u{1F534}\u{1F7E1}\u{1F7E2}\u{1F535}]/gu) || [];
  return emojis.map(emoji => profileColorMap[emoji]).filter(Boolean);
};

const ProfilePage: React.FC<ProfilePageProps> = ({ user, posts, onLikeToggle, onDeletePost, onEditPost, isFavorited, onToggleFavorite, ownFavoritesCount, currentUser, onStartChat }) => {
  const [activeTab, setActiveTab] = useState('posts');
  const behavioralColors = getProfileColors(user.behavioralProfile);

  // Testimonial States
  const [testimonials, setTestimonials] = useState<Testimonial[]>(mockTestimonials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({ message: '', privacy: 'public' });

  // Connection & Favorite State
  const [isConnected, setIsConnected] = useState(false);
  const [isFavoritedState, setIsFavoritedState] = useState(false);
  const [connectionsCount, setConnectionsCount] = useState(0); // Seguidores
  const [followingCount, setFollowingCount] = useState(0); // Seguindo
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [testimonialsCount, setTestimonialsCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(null);
  const [isLoadingAction, setIsLoadingAction] = useState(false);





  // Sender profiles cache
  const [senderProfiles, setSenderProfiles] = useState<{ [key: string]: User }>({});

  // Gallery Lightbox State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndStatus = async () => {
      // 1. Get Current User
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setCurrentUserId(authUser.id);
        setCurrentUserAvatar(authUser.user_metadata?.avatar_url);
      } else {
        // Fallback to mock if strictly necessary
        // setCurrentUserId(String(mockCurrentUser.id)); 
      }

      const myId = authUser?.id;

      // 2. Fetch Connection & Favorite Status (only if logged in)
      if (myId) {
        const { data: connectionData } = await supabase
          .from('connections')
          .select('status, favorites')
          .match({ user_id: myId, friend_id: user.id })
          .eq('status', 'active')
          .maybeSingle();

        const isConn = !!connectionData;
        setIsConnected(isConn);

        // Favorite status comes directly from the connection row now
        if (isConn && connectionData) {
          if (isFavorited === undefined) {
            setIsFavoritedState(connectionData.favorites || false);
          }
        } else {
          setIsFavoritedState(false);
        }
      }
    };

    const fetchCounts = async () => {
      // Robustly get current user ID
      const { data: { user: sessionUser } } = await supabase.auth.getUser();
      const actualCurrentUserId = sessionUser?.id;

      // Use RPC to get accurate counts (bypassing RLS)
      const { data: stats, error } = await supabase.rpc('get_profile_stats', {
        target_user_id: user.id
      });

      if (!error && stats) {
        setConnectionsCount(stats.followers); // "Seguidores"
        setFollowingCount(stats.following); // "Seguindo"

        // For favorites: 
        // If it's MY profile, prefer the 'ownFavoritesCount' prop if available (synced with sidebar).
        // Otherwise, use the DB count.
        if (ownFavoritesCount !== undefined && actualCurrentUserId && String(user.id) === String(actualCurrentUserId)) {
          setFavoritesCount(ownFavoritesCount);
        } else {
          setFavoritesCount(stats.favorites);
        }
      } else {
        console.error('Error fetching profile stats:', error);
      }

      setPostsCount(posts.length);

      // Fetch Testimonials
      fetchTestimonials();
    };

    fetchUserAndStatus().then(() => {
      // Run fetchCounts after we might have currentUserId set
      fetchCounts();
    });
  }, [user.id, posts.length]); // Re-fetch on user or posts change

  // Sync state with prop if provided (ensures immediate update from MainLayout)
  useEffect(() => {
    if (isFavorited !== undefined) {
      setIsFavoritedState(isFavorited);
    }
  }, [isFavorited]);

  // Sync favorites count if prop changes and we are viewing self
  useEffect(() => {
    if (ownFavoritesCount !== undefined && currentUserId && String(user.id) === String(currentUserId)) {
      setFavoritesCount(ownFavoritesCount);
    }
  }, [ownFavoritesCount, currentUserId, user.id]);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Map DB fields to specific type format if needed
      const mappedTestimonials: Testimonial[] = data.map(t => ({
        id: t.id,
        senderId: t.sender_id,
        receiverId: t.receiver_id,
        message: t.message,
        date: new Date(t.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
        privacy: t.privacy,
        status: t.status
      }));
      setTestimonials(mappedTestimonials);

      // Count approved testimonials
      const approvedCount = mappedTestimonials.filter(t => t.status === 'approved').length;
      setTestimonialsCount(approvedCount);

      // Fetch profiles for these senders
      const senderIds = Array.from(new Set(mappedTestimonials.map(t => t.senderId)));
      if (senderIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', senderIds);

        if (profilesData) {
          const profilesMap: { [key: string]: User } = {};
          profilesData.forEach(p => {
            profilesMap[p.id] = {
              id: p.id,
              name: p.full_name || 'Usuário',
              username: p.username || '',
              avatarUrl: p.avatar_url || DEFAULT_AVATAR_URL,
              role: 'user',
              coverUrl: p.cover_url,
              bio: p.bio,
              profession: p.profession,
              location: p.location,
              evoStatus: p.evo_status,
              behavioralProfile: p.behavioral_profile
            } as User;
          });
          setSenderProfiles(prev => ({ ...prev, ...profilesMap }));
        }
      }
    } else {
      // failed to fetch or table doesnt exist
    }
  };


  const handleConnectToggle = async () => {
    if (!currentUserId || isLoadingAction) return;

    if (isConnected) {
      // Disconnect - Open Confirm Modal via Context
      const confirmed = await showConfirm(
        'Desconectar',
        `Deseja remover ${user.name} das suas conexões?`,
        { icon: <UserIcon className="w-8 h-8 text-red-500" /> }
      );

      if (confirmed) {
        setIsLoadingAction(true);
        try {
          if (isFavoritedState && onToggleFavorite) {
            onToggleFavorite(user.id);
          }
          setIsFavoritedState(false);

          const { error } = await supabase
            .from('connections')
            .delete()
            .match({ user_id: currentUserId, friend_id: user.id });

          if (!error) {
            setIsConnected(false);
            setConnectionsCount(prev => Math.max(0, prev - 1));
          } else {
            console.error('Error disconnecting:', error);
            await showAlert('Erro', 'Erro ao desconectar.');
          }
        } catch (error) {
          console.error('Error disconnecting:', error);
        } finally {
          setIsLoadingAction(false);
        }
      }
    } else {
      // Connect / Follow
      setIsLoadingAction(true);
      try {
        const { error } = await supabase
          .from('connections')
          .insert({ user_id: currentUserId, friend_id: user.id, status: 'active', favorites: false });

        if (!error) {
          setIsConnected(true);
          setConnectionsCount(prev => prev + 1);
        } else {
          console.error('Error connecting:', error);
          await showAlert('Erro', 'Erro ao conectar.');
        }
      } catch (error) {
        console.error('Error connecting:', error);
      } finally {
        setIsLoadingAction(false);
      }
    }
  };

  // handleConfirmDisconnect is replaced by logic inside handleConnectToggle

  const { showAlert, showConfirm } = useModal();

  // ... (existing code)

  const handleFavoriteToggleState = async () => {
    if (!currentUserId || isLoadingAction) return;

    // Check constraint: Must be connected
    if (!isConnected) {
      await showAlert('Atenção', 'Você precisa seguir este usuário para favoritar.', { icon: <StarIcon className="w-8 h-8 text-yellow-400" /> });
      return;
    }

    // Call prop function if available (let MainLayout handle the logic purely if configured)
    if (onToggleFavorite) {
      onToggleFavorite(user.id);
      setIsFavoritedState(!isFavoritedState);
      return;
    }

    // Fallback internal logic
    setIsLoadingAction(true);
    try {
      const newStatus = !isFavoritedState;
      const { error } = await supabase
        .from('connections')
        .update({ favorites: newStatus })
        .match({ user_id: currentUserId, friend_id: user.id });

      if (!error) {
        setIsFavoritedState(newStatus);
      } else {
        console.error('Error updating favorite:', error);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };


  // Logic to determine if "Write Testimonial" is allowed
  const isOwnProfile = currentUserId === String(user.id);

  // Filter Testimonials
  const approvedTestimonials = testimonials.filter(t =>
    t.receiverId === user.id &&
    t.status === 'approved' &&
    (t.privacy === 'public' || isOwnProfile || (t.senderId && currentUserId && String(t.senderId) === String(currentUserId)))
  );

  const pendingTestimonials = testimonials.filter(t =>
    t.receiverId === user.id &&
    t.status === 'pending'
  );

  // Check if current user can write a testimonial (cannot write to self)
  const canWriteTestimonial = !isOwnProfile && !!currentUserId;


  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    const { error } = await supabase
      .from('testimonials')
      .insert({
        sender_id: currentUserId,
        receiver_id: user.id,
        message: newTestimonial.message,
        privacy: newTestimonial.privacy,
        status: 'pending'
      });

    if (!error) {
      setNewTestimonial({ message: '', privacy: 'public' });
      setIsModalOpen(false);
      setActiveTab('testimonials');
      setShowSuccessModal(true);
      fetchTestimonials();
    } else {
      await showAlert('Erro', 'Erro ao enviar depoimento.');
      console.error(error);
    }
  };


  const handleApproveTestimonial = async (id: number) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ status: 'approved' })
      .eq('id', id);

    if (!error) {
      await fetchTestimonials();
    } else {
      await showAlert('Erro', 'Erro ao aprovar depoimento.');
    }
  };


  const handleRejectTestimonial = async (id: number) => {
    const confirmed = await showConfirm(
      'Recusar Depoimento',
      'Tem certeza que deseja recusar este depoimento? Ele não aparecerá no seu perfil.',
      { icon: <XMarkIcon className="w-8 h-8 text-red-500" /> }
    );

    if (confirmed) {
      const { error } = await supabase
        .from('testimonials')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (!error) {
        fetchTestimonials();
      }
    }
  };


  const handleDeleteTestimonial = async (id: number) => {
    const confirmed = await showConfirm(
      'Excluir Depoimento',
      'Tem certeza que deseja excluir este depoimento?',
      { icon: <TrashIcon className="w-8 h-8 text-red-500" /> }
    );

    if (confirmed) {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (!error) {
        fetchTestimonials();
      } else {
        await showAlert('Erro', 'Erro ao excluir depoimento.');
      }
    }
  };


  const getSender = (senderId: number | string) => {
    // Check senderProfiles first (strings for UUIDs)
    const realSender = senderProfiles[String(senderId)];
    if (realSender) return realSender;

    // Fallback logic if needed, or loading state placeholder
    return {
      id: senderId,
      name: 'Carregando...',
      username: '...',
      avatarUrl: DEFAULT_AVATAR_URL
    } as User;
  };

  const StatItem: React.FC<{ value: number | string; label: string }> = ({ value, label }) => (
    <div className="text-center">
      <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{value}</p>
      <p className="text-sm text-gray-text">{label}</p>
    </div>
  );

  const formatSocialLink = (platform: string, handle: string) => {
    if (handle.startsWith('http')) return handle;
    if (platform === 'instagram') return `https://instagram.com/${handle}`;
    if (platform === 'linkedin') return `https://${handle}`; // Handle is usually "linkedin.com/in/..."
    if (platform === 'whatsapp') return `https://wa.me/${handle.replace(/\D/g, '')}`;
    return handle;
  };

  return (
    <div className="w-full">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
        {/* Cover and Profile Info */}
        <div className="relative">
          {user.coverUrl ? (
            <img
              src={user.coverUrl}
              alt="Cover"
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-[#121212] flex items-center justify-center">
              <span className="text-slate-400 dark:text-slate-600 font-medium text-sm">Sem capa</span>
            </div>
          )}
          <div className="absolute top-28 left-6">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-surface-light dark:border-surface-dark shadow-md object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-surface-light dark:border-surface-dark shadow-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <UserIcon className="w-16 h-16" />
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="pt-20 px-6 pb-8 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h1>
              <p className="text-md text-gray-text mt-1">@{user.username}</p>
            </div>
            {/* Action Buttons (visible if not own profile) */}
            {canWriteTestimonial && (
              <div className="flex space-x-2">
                <button
                  onClick={() => isConnected && onStartChat?.(user.id)}
                  disabled={!isConnected}
                  title={!isConnected ? "Siga para enviar uma mensagem" : "Enviar Mensagem"}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center space-x-2 ${isConnected
                    ? "bg-primary-light dark:bg-primary/20 text-primary-dark dark:text-primary-light cursor-pointer hover:bg-primary-light/80 dark:hover:bg-primary/30"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  <MailIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar Mensagem</span>
                </button>

                <button
                  onClick={() => isConnected && setIsModalOpen(true)}
                  disabled={!isConnected}
                  title={!isConnected ? "Siga para escrever um depoimento" : "Escrever depoimento"}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center space-x-2 ${isConnected
                    ? "bg-evo-purple/10 hover:bg-evo-purple/20 text-evo-purple cursor-pointer"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  <QuoteIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Escrever Depoimento</span>
                </button>
              </div>
            )}
          </div>

          {(user.location?.city || user.location?.state) && (
            <p className="text-sm text-gray-text mt-1">
              {[user.location.city, user.location.state].filter(Boolean).join(' / ')}
            </p>
          )}

          {user.maritalStatus && (
            <p className="text-sm text-gray-text mt-1">
              {user.maritalStatus}
            </p>
          )}

          {behavioralColors.length > 0 && (
            <div className="mt-2 flex items-center space-x-1.5" aria-label={`Perfil: ${user.behavioralProfile}`}>
              {behavioralColors.map((colorClass, index) => (
                <span key={index} className={`block w-3.5 h-3.5 rounded-full ${colorClass}`} title={user.behavioralProfile}></span>
              ))}
            </div>
          )}

          {/* Status Evo */}
          {user.evoStatus && (
            <div className="mt-3 flex flex-wrap gap-2">
              {user.evoStatus.pelopes && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Pelopes</span>}
              {user.evoStatus.academy && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">Academy</span>}
              {user.evoStatus.family && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Family</span>}
              {user.evoStatus.leader && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Leader</span>}
              {user.evoStatus.teamEngineering && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">Team Engineering</span>}
              {user.evoStatus.missions && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800">Missions</span>}
              {user.evoStatus.missionsLeader && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">Missions Leader</span>}
              {user.evoStatus.legacy && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Legacy</span>}
              {user.evoStatus.eagles && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Eagles</span>}
              {user.evoStatus.trainer && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border border-pink-200 dark:border-pink-800">Trainer</span>}
              {user.evoStatus.headTrainer && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Head Trainer</span>}
              {user.evoStatus.partners && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200 dark:border-violet-800">Partners</span>}
              {user.evoStatus.dominios && <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800">Domínios</span>}
            </div>
          )}

          <div className="mt-4 text-slate-800 dark:text-slate-300">

            {user.mission && (
              <div className="mt-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Missão</h3>
                <p className="text-sm">{user.mission}</p>
              </div>
            )}

            {/* Bio */}
            {user.bio && (
              <div className="mt-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Bio</h3>
                <p className="whitespace-pre-line text-sm">{user.bio}</p>
              </div>
            )}

            {user.helpArea && (
              <div className="mt-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Posso Ajudar Com</h3>
                <p className="text-sm">{user.helpArea}</p>
              </div>
            )}

            {user.profession && (
              <div className="mt-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Profissão</h3>
                <p className="text-sm">{user.profession}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-6">
              <div className="flex items-center space-x-4">
                {user.socials?.instagram && (
                  <a href={formatSocialLink('instagram', user.socials.instagram)} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-orange-500 transition-colors">
                    <InstagramIcon className="w-6 h-6" />
                  </a>
                )}
                {user.socials?.whatsapp && (
                  <a href={formatSocialLink('whatsapp', user.socials.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-green-500 transition-colors">
                    <WhatsAppIcon className="w-6 h-6" />
                  </a>
                )}
                {user.socials?.linkedin && (
                  <a href={formatSocialLink('linkedin', user.socials.linkedin)} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                    <LinkedInIcon className="w-6 h-6" />
                  </a>
                )}

                {/* Favorite Button */}
                {!isOwnProfile && (
                  <button
                    onClick={handleFavoriteToggleState}
                    disabled={!isConnected}
                    className={`transition-colors p-1 rounded-full ${!isConnected
                      ? 'opacity-50 cursor-not-allowed text-slate-300'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      } ${isFavoritedState
                        ? 'text-yellow-400'
                        : isConnected ? 'text-slate-400 hover:text-yellow-400' : 'text-slate-300'
                      }`}
                    title={
                      !isConnected
                        ? "Siga para favoritar"
                        : isFavoritedState ? "Remover dos favoritos" : "Adicionar aos favoritos"
                    }
                  >
                    <StarIcon className="w-6 h-6" filled={isFavoritedState} />
                  </button>
                )}
              </div>

              {/* Connect Button */}
              {!isOwnProfile && (
                <button
                  onClick={handleConnectToggle}
                  disabled={isLoadingAction}
                  className={`flex items-center space-x-2 px-6 py-2 rounded-full text-sm font-bold text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 
                        ${isConnected
                      ? 'bg-slate-500 hover:bg-red-500 border border-slate-600'
                      : 'bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange'
                    }`}
                >
                  {isConnected ? (
                    <>
                      <XMarkIcon className="w-4 h-4" />
                      <span>Deixar de Seguir</span>
                    </>
                  ) : (
                    <>
                      <UsersIcon className="w-4 h-4" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around p-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <StatItem value={user.postsCount || posts.length} label="Publicações" />
          <StatItem value={connectionsCount} label="Seguidores" />
          <StatItem value={followingCount} label="Seguindo" />
          <StatItem value={approvedTestimonials.length} label="Depoimentos" />
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 min-w-[100px] p-4 font-semibold text-center transition-colors relative ${activeTab === 'posts' ? 'text-primary' : 'text-gray-text hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            Publicações
            {activeTab === 'posts' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 min-w-[100px] p-4 font-semibold text-center transition-colors relative ${activeTab === 'photos' ? 'text-primary' : 'text-gray-text hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            Fotos
            {activeTab === 'photos' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
          </button>
          <button
            onClick={() => setActiveTab('testimonials')}
            className={`flex-1 min-w-[120px] p-4 font-semibold text-center transition-colors relative ${activeTab === 'testimonials' ? 'text-primary' : 'text-gray-text hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
          >
            Depoimentos
            {isOwnProfile && pendingTestimonials.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] absolute top-3 right-2">
                {pendingTestimonials.length}
              </span>
            )}
            {activeTab === 'testimonials' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6 space-y-6">
        {activeTab === 'posts' && posts.map(post => (
          <PostCard key={post.id} currentUser={currentUser} post={post} onLikeToggle={onLikeToggle} onDeletePost={onDeletePost} onEditPost={onEditPost} />
        ))}

        {activeTab === 'photos' && (
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4">
            {user.gallery && user.gallery.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {user.gallery.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden cursor-pointer group" onClick={() => setSelectedImage(photo)}>
                    <img src={photo} alt={`Galeria ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-text">
                <p>Nenhuma foto disponível.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            {/* Pending Testimonials Section - Only for Owner */}
            {isOwnProfile && pendingTestimonials.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4 px-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">Pendentes de Aprovação</h3>
                </div>
                <div className="space-y-4">
                  {pendingTestimonials.map(testimonial => {
                    const sender = getSender(testimonial.senderId);
                    return (
                      <div key={testimonial.id} className="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-900/30 relative shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <img src={sender.avatarUrl} alt={sender.name} className="w-10 h-10 rounded-full mr-3 border-2 border-white dark:border-slate-800" />
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{sender.name}</h4>
                              <span className="text-xs text-gray-500">{testimonial.date}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveTestimonial(testimonial.id)}
                              className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition-colors"
                              title="Aprovar"
                            >
                              <CheckCircleIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRejectTestimonial(testimonial.id)}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition-colors"
                              title="Recusar"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 italic text-sm">
                          "{testimonial.message}"
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Approved Testimonials */}
            {approvedTestimonials.length > 0 ? (
              approvedTestimonials.map(testimonial => {
                const sender = getSender(testimonial.senderId);
                return (
                  <div key={testimonial.id} className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 relative shadow-sm hover:border-evo-purple/30 transition-all group">
                    <QuoteIcon className="absolute top-4 right-4 w-8 h-8 text-slate-100 dark:text-slate-800 group-hover:text-evo-purple/10 transition-colors" />

                    {isOwnProfile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTestimonial(testimonial.id);
                        }}
                        className="absolute top-4 right-14 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Excluir Depoimento"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}

                    <div className="flex items-center mb-4">
                      <img src={sender.avatarUrl} alt={sender.name} className="w-12 h-12 rounded-full mr-4 border-2 border-white dark:border-slate-800 shadow-sm" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{sender.name}</h4>
                        <div className="flex items-center space-x-2 text-xs text-gray-text">
                          <span>{testimonial.date}</span>
                          {testimonial.privacy === 'private' && (
                            <span className="flex items-center text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                              <LockClosedIcon className="w-3 h-3 mr-1" />
                              Privado
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <p className="text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{testimonial.message}"
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 text-center">
                <QuoteIcon className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">
                  {isOwnProfile && pendingTestimonials.length > 0
                    ? "Você não tem depoimentos publicados, mas tem pendentes!"
                    : "Nenhum depoimento publicado ainda."}
                </p>
                {canWriteTestimonial && (
                  <button onClick={() => setIsModalOpen(true)} className="mt-4 text-evo-purple font-semibold hover:underline">
                    Seja o primeiro a escrever!
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Write Testimonial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface-light dark:bg-surface-dark w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200/50 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#121212]">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
                <QuoteIcon className="w-5 h-5 text-evo-purple mr-2" />
                Escrever Depoimento
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitTestimonial} className="p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <img src={user.avatarUrl || 'https://picsum.photos/id/1005/100/100'} alt={user.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Enviando para:</p>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                </div>
              </div>

              <div>
                <textarea
                  className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D0D0D] text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-evo-purple focus:border-transparent outline-none resize-none placeholder-slate-400 text-sm"
                  rows={5}
                  placeholder={`Escreva algo inspirador sobre ${user.name.split(' ')[0]}...`}
                  value={newTestimonial.message}
                  onChange={(e) => setNewTestimonial({ ...newTestimonial, message: e.target.value })}
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-between bg-slate-50 dark:bg-[#121212] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 pl-1">Visibilidade:</span>
                <div className="flex space-x-1 bg-white dark:bg-surface-dark rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setNewTestimonial({ ...newTestimonial, privacy: 'public' })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${newTestimonial.privacy === 'public' ? 'bg-evo-purple text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    Público
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTestimonial({ ...newTestimonial, privacy: 'private' })}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center ${newTestimonial.privacy === 'private' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <LockClosedIcon className="w-3 h-3 mr-1" />
                    Privado
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-xs text-blue-700 dark:text-blue-300">
                O depoimento será enviado para aprovação de {user.name} antes de ser publicado.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!newTestimonial.message.trim()}
                  className="w-full py-3 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex justify-center items-center space-x-2"
                >
                  <span>Enviar Depoimento</span>
                  <PaperAirplaneIcon className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200/50 dark:border-slate-700 text-center transform transition-all scale-100 relative">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Depoimento Enviado!</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
              Seu depoimento foi enviado para aprovação de <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Fechar
            </button>
          </div>
        </div>
      )}


    </div>
  );
};

export default ProfilePage;

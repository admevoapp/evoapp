import React, { useState, useEffect } from 'react';
import { Post, User, Page, Event } from '../types';
import CreatePost from './CreatePost';
import PostCard from './PostCard';
import BannerSlider from './BannerSlider';
import { SparklesIcon, MegaphoneIcon, ArrowRightIcon, HeartIcon, ChatBubbleIcon, ShareIcon, PaperAirplaneIcon, BrainIcon } from './icons';
import { DEFAULT_AVATAR_URL } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { useModal } from '../contexts/ModalContext';
import { DailyReflection } from './DashboardWidgets';

interface FeedProps {
  currentUser: User;
  posts: Post[];
  onCreatePost: (content: string, imageUrl?: string) => void;
  onLikeToggle: (postId: number) => void;
  onViewProfile?: (user: User) => void;
  onDeletePost: (postId: number) => void;
  onEditPost?: (postId: number, newContent: string) => void;
  onNavigate: (page: Page) => void; // New prop
  onViewEvent: (event: Event) => void; // New prop
}

interface AdminPost {
  id: number;
  title: string;
  content: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  created_at?: string;
}

// Helper Component matching PostCard style
const ActionButton: React.FC<{ icon: React.ReactNode; label: string | number; onClick?: () => void; active?: boolean }> = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-200 group ${active ? 'text-secondary' : 'text-gray-text dark:text-slate-400 hover:text-primary-dark'}`}
  >
    <div className={`p-2 rounded-full group-hover:bg-primary-light dark:group-hover:bg-primary/20 ${active ? 'text-secondary group-hover:text-secondary-dark' : ''}`}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

const Feed: React.FC<FeedProps> = ({
  currentUser,
  posts,
  onCreatePost,
  onLikeToggle,
  onViewProfile,
  onDeletePost,
  onEditPost,
  onNavigate,
  onViewEvent
}) => {
  // const [todaysReflection, setTodaysReflection] = useState("O amor radical começa dentro de você."); // REMOVE
  const [adminPost, setAdminPost] = useState<AdminPost | null>(null);
  const [adminPostLikes, setAdminPostLikes] = useState(0);
  const [adminPostIsLiked, setAdminPostIsLiked] = useState(false);
  const [adminPostComments, setAdminPostComments] = useState<any[]>([]);
  const [showAdminComments, setShowAdminComments] = useState(false);
  const [adminCommentText, setAdminCommentText] = useState("");
  const { showAlert } = useModal();

  useEffect(() => {
    const fetchAdminPost = async () => {
      try {
        const { data } = await supabase
          .from('admin_feed_posts')
          .select('*')
          .eq('is_active', true)
          .single();

        if (data) {
          setAdminPost(data);
          fetchAdminInteractions(data.id);
        } else {
          setAdminPost(null);
        }
      } catch (error) {
        console.error('Error fetching admin post:', error);
      }
    };

    // fetchReflection removed

    fetchAdminPost();
    // fetchReflection(); // REMOVE

    // Subscribe to changes
    const subscription = supabase
      .channel('public:admin_feed_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_feed_posts' }, () => {
        fetchAdminPost();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAdminInteractions = async (postId: number) => {
    try {
      // Likes Count
      const { count } = await supabase
        .from('admin_feed_likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);
      setAdminPostLikes(count || 0);

      // Is Liked
      const { data: userLike } = await supabase
        .from('admin_feed_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();
      setAdminPostIsLiked(!!userLike);

      // 1. Fetch Comments (Raw)
      const { data: rawComments, error: commentsError } = await supabase
        .from('admin_feed_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      if (!rawComments || rawComments.length === 0) {
        setAdminPostComments([]);
        return;
      }

      // 2. Extract unique User IDs to fetch profiles
      const userIds = [...new Set(rawComments.map(c => c.user_id))];

      // 3. Fetch Profiles manually
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // 4. Create a Map for O(1) lookup
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      // 5. Merge data
      const formattedComments = rawComments.map(c => {
        const userProfile = profilesMap.get(c.user_id);
        return {
          ...c,
          user: userProfile || {
            id: c.user_id,
            full_name: 'Usuário',
            username: 'desconhecido',
            avatar_url: DEFAULT_AVATAR_URL
          }
        };
      });

      setAdminPostComments(formattedComments);

    } catch (error) {
      console.error('Error fetching interactions:', error);
    }
  }

  const handleAdminLike = async () => {
    if (!adminPost) return;

    try {
      if (adminPostIsLiked) {
        await supabase.from('admin_feed_likes').delete().eq('post_id', adminPost.id).eq('user_id', currentUser.id);
        setAdminPostLikes(prev => prev - 1);
        setAdminPostIsLiked(false);
      } else {
        await supabase.from('admin_feed_likes').insert({ post_id: adminPost.id, user_id: currentUser.id });
        setAdminPostLikes(prev => prev + 1);
        setAdminPostIsLiked(true);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleAdminCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPost || !adminCommentText.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('admin_feed_comments')
        .insert({
          post_id: adminPost.id,
          user_id: user.id,
          text: adminCommentText
        });

      if (error) throw error;

      setAdminCommentText("");
      fetchAdminInteractions(adminPost.id);
    } catch (error) {
      console.error("Error commenting:", error);
      showAlert("Erro", "Não foi possível enviar o comentário.");
    }
  }

  const handleAdminShare = async () => {
    if (!adminPost) return;
    const shareData = {
      title: `Confira este post no EVOAPP: ${adminPost.title}`,
      text: adminPost.content,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        showAlert('Link Copiado!', 'Link copiado para a área de transferência!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  // Handler for widget navigation
  const handleWidgetNavigate = (page: string, data?: any) => {
    if (page === 'event-details' && data) {
      onViewEvent(data);
    } else {
      onNavigate(page as Page);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Widgets Removed */}

      <BannerSlider />
      <DailyReflection />

      {/* Admin Spotlight Post */}
      {/* Admin Spotlight Post */}
      {adminPost && (
        <div className="relative rounded-2xl mb-8 group animate-fade-in">
          {/* Gradient Border for Highlight */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange rounded-2xl opacity-75 blur-sm transition duration-1000 group-hover:duration-200 group-hover:opacity-100"></div>

          <div className="relative bg-surface-light dark:bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-5 flex items-center space-x-3 border-b border-slate-100 dark:border-white/5">
              <div className="bg-gradient-to-br from-evo-purple to-evo-blue p-2.5 rounded-xl shadow-lg">
                <MegaphoneIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Destaque EVO</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {new Date(adminPost.created_at || Date.now()).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{adminPost.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mb-5">{adminPost.content}</p>

              {adminPost.image_url && (
                <div className="w-full relative aspect-[700/400] rounded-xl overflow-hidden shadow-md bg-slate-100 dark:bg-white/5">
                  <img src={adminPost.image_url} alt={adminPost.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}

              {adminPost.button_text && adminPost.button_link && (
                <a
                  href={adminPost.button_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-6 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white text-center font-bold py-3.5 rounded-xl hover:shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5 flex items-center justify-center shadow-md"
                >
                  {adminPost.button_text} <ArrowRightIcon className="w-4 h-4 ml-2" />
                </a>
              )}
            </div>

            {/* Footer / Actions - Replicated from PostCard */}
            <div className="px-5 py-1 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-gray-text">
              <ActionButton
                icon={<HeartIcon className="w-5 h-5" filled={adminPostIsLiked} />} // Assuming HeartIcon supports filled, as in PostCard
                label={adminPostLikes}
                onClick={handleAdminLike}
                active={adminPostIsLiked}
              />
              <ActionButton
                icon={<ChatBubbleIcon className="w-5 h-5" />}
                label={adminPostComments.length}
                onClick={() => setShowAdminComments(!showAdminComments)}
                active={showAdminComments}
              />
              <ActionButton
                icon={<ShareIcon className="w-5 h-5" />}
                label="Compartilhar"
                onClick={handleAdminShare}
              />
            </div>

            {/* Comments Section */}
            {showAdminComments && (
              <div className="p-5 bg-slate-50 dark:bg-black/20 border-t border-slate-100 dark:border-white/5">
                {/* List Comments */}
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                  {adminPostComments.length === 0 ? (
                    <p className="text-center text-sm text-slate-500 py-2">Seja o primeiro a comentar!</p>
                  ) : (
                    adminPostComments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <img src={comment.user.avatar_url} alt={comment.user.full_name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="flex-1 bg-white dark:bg-[#1C1C1E] p-3 rounded-r-xl rounded-bl-xl shadow-sm border border-slate-100 dark:border-white/5">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{comment.user.full_name}</p>
                            <p className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                <form onSubmit={handleAdminCommentSubmit} className="flex items-center space-x-3">
                  <img src={currentUser.avatar_url || DEFAULT_AVATAR_URL} alt="Você" className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10" />
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={adminCommentText}
                      onChange={(e) => setAdminCommentText(e.target.value)}
                      placeholder="Escreva um comentário..."
                      className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-full pl-4 pr-10 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-evo-purple focus:ring-1 focus:ring-evo-purple transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!adminCommentText.trim()}
                      className="absolute right-1.5 top-1.5 p-1.5 bg-evo-purple text-white rounded-full disabled:opacity-50 hover:bg-evo-purple/90 transition-colors shadow-sm"
                    >
                      <PaperAirplaneIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}


      <CreatePost currentUser={currentUser} onCreatePost={onCreatePost} />

      {
        posts.length > 0 ? (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              onLikeToggle={onLikeToggle}
              onViewProfile={onViewProfile}
              onDeletePost={onDeletePost}
              onEditPost={onEditPost}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-surface-light dark:bg-[#1C1C1E] rounded-2xl border border-slate-200/50 dark:border-white/10">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Nenhuma publicação encontrada.
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
              Faça um post ou favorite amigos para ver as atualizações deles aqui!
            </p>
          </div>
        )
      }
    </div >
  );
};

export default Feed;
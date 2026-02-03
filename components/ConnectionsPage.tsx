
import React, { useState, useEffect } from 'react';
import { User } from '../types';

import { UsersIcon, StarIcon } from './icons';
import { DEFAULT_AVATAR_URL } from '../constants';
import { supabase } from '../lib/supabaseClient';
import ConfirmModal from './ConfirmModal';

interface ConnectionsPageProps {
  user: User;
  allUsers: User[];
  onViewProfile?: (user: User) => void;
}

interface ConnectionUser extends User {
  isFavorite?: boolean;
}

const ConnectionsPage: React.FC<ConnectionsPageProps> = ({ user, onViewProfile }) => {
  const [activeTab, setActiveTab] = useState<'following' | 'followers'>('following');

  const [following, setFollowing] = useState<ConnectionUser[]>([]);
  const [followers, setFollowers] = useState<ConnectionUser[]>([]);

  const [filteredList, setFilteredList] = useState<ConnectionUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Confirm Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDisconnectId, setUserDisconnectId] = useState<string | number | null>(null);
  const [userDisconnectName, setUserDisconnectName] = useState<string>('');
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function fetchAllConnections() {
      if (!user?.id) return;

      setLoading(true);
      try {
        // 1. Fetch "Following" (user_id = me)
        const { data: followingData } = await supabase
          .from('connections')
          .select('friend_id, favorites')
          .eq('user_id', user.id)
          .eq('status', 'active');

        // 2. Fetch "Followers" (friend_id = me)
        const { data: followersData } = await supabase
          .from('connections')
          .select('user_id')
          .eq('friend_id', user.id)
          .eq('status', 'active');

        const followingIds = (followingData || []).map((c: any) => c.friend_id);
        const followerIds = (followersData || []).map((c: any) => c.user_id);

        // Favorite status map (only relevant for people I follow)
        const favoritesMap = new Map((followingData || []).map((c: any) => [c.friend_id, c.favorites]));

        // Unique IDs to fetch profiles for
        const allIds = Array.from(new Set([...followingIds, ...followerIds]));

        if (allIds.length === 0) {
          setFollowing([]);
          setFollowers([]);
          setLoading(false);
          return;
        }

        // Fetch Profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, cover_url, bio, profession, location, behavioral_profile, evo_status, mission, help_area, socials, marital_status, gallery')
          .in('id', allIds);

        if (profilesData) {
          const profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));

          const mapToUser = (id: string, isFollowingList: boolean): ConnectionUser => {
            const profile: any = profilesMap.get(id) || {};
            return {
              id: profile.id || id,
              name: profile.full_name || profile.username || 'Unknown',
              username: profile.username || 'unknown',
              avatarUrl: profile.avatar_url || DEFAULT_AVATAR_URL,
              coverUrl: profile.cover_url,
              bio: profile.bio,
              profession: profile.profession,
              location: profile.location,
              behavioralProfile: profile.behavioral_profile,
              evoStatus: profile.evo_status,
              isFavorite: isFollowingList ? (favoritesMap.get(id) || false) : false,

              // Defaults
              isLiked: false, likes: 0, comments: 0,
              mission: profile.mission, helpArea: profile.help_area,
              socials: profile.socials, maritalStatus: profile.marital_status,
              gallery: profile.gallery
            } as ConnectionUser;
          };

          setFollowing(followingIds.map(id => mapToUser(id, true)));
          setFollowers(followerIds.map(id => mapToUser(id, false)));
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllConnections();
  }, [user]);

  // Effect to filter list based on active tab and search
  useEffect(() => {
    let sourceList = activeTab === 'following' ? following : followers;

    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      sourceList = sourceList.filter(u =>
        u.name.toLowerCase().includes(lower) ||
        u.username.toLowerCase().includes(lower)
      );
    }

    setFilteredList(sourceList);
    setCurrentPage(1); // Reset to first page when tab or search changes
  }, [activeTab, following, followers, searchTerm]);

  const handleRemoveClick = (e: React.MouseEvent, userTarget: User) => {
    e.stopPropagation();
    setUserDisconnectId(userTarget.id);
    setUserDisconnectName(userTarget.name);
    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!userDisconnectId) return;
    setIsLoadingAction(true);

    try {
      if (activeTab === 'following') {
        // Unfollow: Delete connection where user_id = me, friend_id = target
        const { error } = await supabase
          .from('connections')
          .delete()
          .match({ user_id: user.id, friend_id: userDisconnectId });

        if (!error) {
          setFollowing(prev => prev.filter(c => c.id !== userDisconnectId));
        }
      } else {
        // Remove Follower: Delete connection where user_id = target, friend_id = me
        const { error } = await supabase
          .from('connections')
          .delete()
          .match({ user_id: userDisconnectId, friend_id: user.id });

        if (!error) {
          setFollowers(prev => prev.filter(c => c.id !== userDisconnectId));
        }
      }
    } catch (err) {
      console.error('Error executing action:', err);
    } finally {
      setIsLoadingAction(false);
      setIsModalOpen(false);
      setUserDisconnectId(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-xl text-primary-dark dark:text-evo-purple shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Conexões</h1>
            <p className="text-gray-text dark:text-slate-400 mt-1">
              <span className="block font-medium text-slate-700 dark:text-slate-300 mb-1">🤝 Aqui estão as pessoas que te inspiram e que caminham com você.</span>
              <span className="block text-sm font-normal text-slate-500 dark:text-slate-400">Conexões no EVOAPP são sobre troca, apoio e crescimento mútuo.</span>
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar na lista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 px-4 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('following')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'following'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          Seguindo ({following.length})
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'followers'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
        >
          Seguidores ({followers.length})
        </button>
      </div>

      {/* Tab Description */}
      <div className="text-sm text-slate-500 dark:text-slate-400">
        {activeTab === 'following'
          ? "Pessoas que você escolheu acompanhar."
          : "Pessoas interessadas em caminhar com você."}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-text">Carregando...</p>
        </div>
      ) : filteredList.length > 0 ? (
        <div className="space-y-4">
          {(() => {
            const itemsPerPage = 5;
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);
            const totalPages = Math.ceil(filteredList.length / itemsPerPage);

            const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

            return (
              <>
                {currentItems.map(conn => (
                  <div
                    key={conn.id}
                    className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row items-center gap-4 transition-all hover:shadow-md"
                  >
                    {/* Avatar */}
                    <div
                      className="cursor-pointer shrink-0"
                      onClick={() => onViewProfile && onViewProfile(conn)}
                    >
                      <img
                        src={conn.avatarUrl}
                        alt={conn.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-grow text-center sm:text-left min-w-0">
                      <h3
                        className="font-bold text-lg text-slate-900 dark:text-slate-100 hover:text-primary cursor-pointer truncate"
                        onClick={() => onViewProfile && onViewProfile(conn)}
                      >
                        {conn.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 truncate">@{conn.username}</p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {(conn.location?.city || conn.location?.state) && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {conn.location.city ? `${conn.location.city}${conn.location.state ? `/${conn.location.state}` : ''}` : conn.location.state}
                          </span>
                        )}
                        {conn.behavioralProfile && (
                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {conn.behavioralProfile}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => onViewProfile && onViewProfile(conn)}
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-evo-purple to-evo-orange text-white font-semibold text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5"
                      >
                        Ver Perfil
                      </button>
                      <button
                        onClick={(e) => handleRemoveClick(e, conn)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors"
                        title={activeTab === 'following' ? "Deixar de seguir" : "Remover seguidor"}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {filteredList.length > itemsPerPage && (
                  <div className="flex justify-center items-center space-x-2 mt-6 pt-4">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Anterior
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 text-sm rounded-lg border ${currentPage === number
                          ? 'bg-evo-purple text-white border-evo-purple'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Próxima
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      ) : (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center text-gray-text">
          <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <UsersIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {activeTab === 'following'
              ? (searchTerm ? 'Ninguém encontrado' : 'Você ainda não segue ninguém')
              : (searchTerm ? 'Ninguém encontrado' : 'Você ainda não tem seguidores')}
          </h3>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        title={activeTab === 'following' ? "Deixar de Seguir" : "Remover Seguidor"}
        message={
          activeTab === 'following'
            ? `Tem certeza que deseja deixar de seguir ${userDisconnectName}?`
            : `Tem certeza que deseja remover ${userDisconnectName} dos seus seguidores?`
        }
        confirmLabel={activeTab === 'following' ? "Deixar de Seguir" : "Remover"}
        type="danger"
        isLoading={isLoadingAction}
      />
    </div>
  );
};

export default ConnectionsPage;

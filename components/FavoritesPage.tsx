
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { StarIcon, UserIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { DEFAULT_AVATAR_URL } from '../constants';
import ConfirmModal from './ConfirmModal';

interface FavoritesPageProps {
  allUsers?: User[];
  favoritedUserIds: (number | string)[];
  onToggleFavorite: (userId: number | string) => void;
  onViewProfile?: (user: User) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ favoritedUserIds, onToggleFavorite, onViewProfile }) => {
  const [favorites, setFavorites] = useState<User[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Confirm Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      // If no IDs, just clear and return (avoids unnecessary DB call)
      if (favoritedUserIds.length === 0) {
        setFavorites([]);
        setFilteredFavorites([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            username,
            full_name,
            avatar_url,
            cover_url,
            bio,
            profession,
            behavioral_profile,
            location,
            evo_status,
            mission,
            help_area,
            socials,
            marital_status,
            gallery
          `)
          .in('id', favoritedUserIds);

        if (error) {
          console.error('Error fetching favorites profiles:', error);
        } else if (data) {
          const mappedUsers: User[] = data.map((profile: any) => ({
            id: profile.id,
            name: profile.full_name || profile.username || 'Sem Nome',
            username: profile.username || 'unknown',
            avatarUrl: profile.avatar_url || DEFAULT_AVATAR_URL,
            coverUrl: profile.cover_url || '',
            bio: profile.bio,
            profession: profile.profession,
            behavioralProfile: profile.behavioral_profile,
            location: profile.location,
            evoStatus: profile.evo_status,
            mission: profile.mission,
            helpArea: profile.help_area,
            socials: profile.socials,
            maritalStatus: profile.marital_status,
            gallery: profile.gallery,
            isLiked: false,
            likes: 0,
            comments: 0
          }));
          setFavorites(mappedUsers);
          setFilteredFavorites(mappedUsers);
        }
      } catch (err) {
        console.error('Unexpected error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [favoritedUserIds]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFavorites(favorites);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = favorites.filter(fav =>
        fav.name.toLowerCase().includes(lowerTerm) ||
        fav.username.toLowerCase().includes(lowerTerm) ||
        (fav.location?.city && fav.location.city.toLowerCase().includes(lowerTerm)) ||
        (fav.location?.state && fav.location.state.toLowerCase().includes(lowerTerm))
      );
      setFilteredFavorites(filtered);
    }
    setCurrentPage(1); // Reset page on search
  }, [searchTerm, favorites]);

  const handleRemoveClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setUserToRemove(user);
    setIsModalOpen(true);
  };

  const handleConfirmRemove = () => {
    if (userToRemove) {
      onToggleFavorite(userToRemove.id);
      // MainLayout will update IDs -> triggers useEffect -> removes from list
    }
    setIsModalOpen(false);
    setUserToRemove(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header & Search */}
      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-xl text-primary-dark dark:text-evo-purple">
            <StarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Favoritos ({favorites.length})</h1>
            <p className="font-bold text-slate-900 dark:text-slate-100 mt-1">⭐ Seu feed, do seu jeito</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Aqui você escolhe quem deseja acompanhar de perto.
              Apenas conteúdos dos seus favoritos aparecem no seu feed.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Buscar favorito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 px-4 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Explanatory Block */}
      <div className="text-center px-4">
        <p className="text-sm text-gray-400 dark:text-slate-500">🤍 Conectar é caminhar junto.</p>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">⭐ Favoritar é escolher quem você quer ouvir com mais frequência.</p>
      </div>

      {/* Favorites List */}
      {loading ? (
        <div className="text-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-text">Carregando favoritos...</p>
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className="space-y-4">
          {(() => {
            const itemsPerPage = 5;
            const indexOfLastItem = currentPage * itemsPerPage;
            const indexOfFirstItem = indexOfLastItem - itemsPerPage;
            const currentItems = filteredFavorites.slice(indexOfFirstItem, indexOfLastItem);
            const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);

            const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

            return (
              <>
                {currentItems.map(user => (
                  <div
                    key={user.id}
                    className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col sm:flex-row items-center gap-4 transition-all hover:shadow-md"
                  >
                    {/* Avatar */}
                    <div
                      className="relative cursor-pointer shrink-0"
                      onClick={() => onViewProfile && onViewProfile(user)}
                    >
                      {user.avatarUrl && user.avatarUrl !== DEFAULT_AVATAR_URL ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700 shadow-sm bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                          <UserIcon className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-grow text-center sm:text-left min-w-0">
                      <h3
                        className="font-bold text-lg text-slate-900 dark:text-slate-100 hover:text-primary cursor-pointer truncate"
                        onClick={() => onViewProfile && onViewProfile(user)}
                      >
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 truncate">@{user.username}</p>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {(user.location?.city || user.location?.state) && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {user.location.city ? `${user.location.city}${user.location.state ? `/${user.location.state}` : ''}` : user.location.state}
                          </span>
                        )}

                        {user.behavioralProfile && (
                          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                            {user.behavioralProfile}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => onViewProfile && onViewProfile(user)}
                        className="px-6 py-2 rounded-full bg-gradient-to-r from-evo-purple to-evo-orange text-white font-semibold text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5"
                      >
                        Ver Perfil
                      </button>
                      <button
                        onClick={(e) => handleRemoveClick(e, user)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-full transition-colors"
                        title="Remover dos favoritos"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                {filteredFavorites.length > itemsPerPage && (
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
            <StarIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            {searchTerm ? 'Nenhum favorito encontrado' : 'Você ainda não tem favoritos'}
          </h3>
          <p className="max-w-md mx-auto">
            {searchTerm
              ? `Não encontramos ninguém com "${searchTerm}". Tente outro termo.`
              : 'Explore a comunidade e adicione perfis aos seus favoritos para acessá-los facilmente!'}
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remover Favorito"
        message={`Tem certeza que deseja remover ${userToRemove?.name} dos seus favoritos?`}
        confirmLabel="Remover"
        type="danger"
      />
    </div>
  );
};

export default FavoritesPage;

import React, { useState, useEffect } from 'react';

import { UserIcon, UserPlusIcon } from './icons';
import { User } from '../types';
import { DEFAULT_AVATAR_URL } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { useModal } from '../contexts/ModalContext';
import BottleWidget from './BottleWidget';

interface SidebarRightProps {
  currentUser: User;
  favoritedUserIds: (number | string)[];
  onToggleFavorite: (userId: number | string) => void;
  onViewProfile?: (user: User) => void;
}

const SidebarRight: React.FC<SidebarRightProps> = ({ currentUser, onViewProfile }) => {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const { showAlert } = useModal();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Use passed currentUser instead of fetching again if possible, 
        // but we need to ensure we have the ID. currentUser is guaranteed by MainLayout.

        // However, for consistency with original logic which re-fetched or logic, let's keep it simple.
        // We can use currentUser.id directly.

        let query = supabase
          .from('profiles')
          .select('*')
          .limit(20); // Increase limit to find relevant users

        let myProfile: any = null;

        if (currentUser) {
          // 0. Fetch my full profile for relevance scoring (if not already fully populated in currentUser)
          // We can try to use currentUser directly if it has location/help_area
          myProfile = currentUser;

          // 1. Get IDs of people I already follow
          const { data: followingData } = await supabase
            .from('connections')
            .select('friend_id')
            .eq('user_id', currentUser.id)
            .eq('status', 'active');

          const followingIds = (followingData || []).map((c: any) => c.friend_id);

          // 2. Filter out myself, Master Admin, and people I already follow
          query = query.neq('id', currentUser.id);
          query = query.neq('full_name', 'Perfil Master');
          query = query.neq('full_name', 'Administador Master');
          query = query.neq('full_name', 'Administrador Master');

          if (followingIds.length > 0) {
            query = query.not('id', 'in', `(${followingIds.join(',')})`);
          }
        }

        const { data, error } = await query;

        if (data) {
          let mappedUsers: User[] = data.map((profile: any) => ({
            id: profile.id,
            name: profile.full_name || 'Sem Nome',
            username: profile.username || '',
            avatarUrl: profile.avatar_url || DEFAULT_AVATAR_URL,
            coverUrl: profile.cover_url || '',
            bio: profile.bio,
            profession: profile.profession || 'Membro da Comunidade',
            location: profile.location,
            evoStatus: profile.evo_status,
            behavioralProfile: profile.behavioral_profile,
            helpArea: profile.help_area,
            classYear: profile.class_year,
            socials: profile.socials,
            mission: profile.mission,
            maritalStatus: profile.marital_status,
            gallery: profile.gallery,
            role: 'user',
            status: 'active'
          }));

          // 3. Relevance Scoring
          if (myProfile) {
            mappedUsers = mappedUsers.map(u => {
              let score = 0;
              // Location Relevance (+2)
              const myCity = myProfile.location?.city;
              const theirCity = u.location?.city;
              if (myCity && theirCity && myCity.toLowerCase() === theirCity.toLowerCase()) {
                score += 2;
              }

              // Help Area Relevance (+3)
              const myHelp = myProfile.helpArea || myProfile.help_area;
              const theirHelp = u.helpArea;
              if (myHelp && theirHelp && myHelp === theirHelp) {
                score += 3;
              }

              return { ...u, _score: score };
            });

            // Sort by score desc, then random/id
            mappedUsers.sort((a: any, b: any) => (b._score || 0) - (a._score || 0));
          }

          // 4. Take top 5
          setSuggestions(mappedUsers.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [currentUser]); // Re-run if currentUser changes

  return (
    <div className="space-y-6">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-4 shadow-sm">
        <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100">Quem Conectar</h3>
        <div className="space-y-5">
          {suggestions.length > 0 ? (
            suggestions.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div
                  className="flex items-center space-x-3 cursor-pointer group"
                  onClick={() => onViewProfile && onViewProfile(user)}
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:opacity-80 transition-opacity">
                      <UserIcon className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-none group-hover:text-primary transition-colors">{user.name}</p>
                  </div>
                </div>

                <button
                  onClick={() => onViewProfile && onViewProfile(user)}
                  className="p-2 text-evo-purple bg-evo-purple/10 hover:bg-evo-purple/20 rounded-full transition-colors"
                  title="Conectar"
                >
                  <UserPlusIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center">Nenhuma sugestão no momento.</p>
          )}
        </div>
      </div>

      {/* Mensagem na Garrafa Component */}
      <BottleWidget currentUser={currentUser} />
    </div >
  );
};

export default SidebarRight;

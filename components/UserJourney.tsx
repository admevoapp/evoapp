import React, { useState, useEffect } from 'react';
import { User, Page } from '../types';
import { supabase } from '../lib/supabaseClient';
import SendBottleModal from './SendBottleModal';
import {
  UserIcon,
  UserGroupIcon,
  StarIcon,
  PencilIcon,
  BottleIcon,
  CheckCircleIcon,
  ChevronRightIcon
} from './icons';

interface UserJourneyProps {
  currentUser: User;
  onNavigate: (page: Page) => void;
}

const UserJourney: React.FC<UserJourneyProps> = ({ currentUser, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [hasPosted, setHasPosted] = useState(false);
  const [hasSentBottle, setHasSentBottle] = useState(false);
  const [isBottleModalOpen, setIsBottleModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasConnected, setHasConnected] = useState(false);
  const [hasFavorited, setHasFavorited] = useState(false);
  useEffect(() => {
    const checkDismissed = localStorage.getItem(`hideUserJourney_${currentUser.id}`);
    if (checkDismissed === 'true') {
      setIsDismissed(true);
    }
    fetchJourneyData();
  }, [currentUser.id]);

  const fetchJourneyData = async () => {
    try {
      const [postsRes, bottlesRes, connectionsRes, favoritesRes] = await Promise.all([
        supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUser.id),
        supabase
          .from('bottle_messages')
          .select('id', { count: 'exact', head: true })
          .eq('sender_id', currentUser.id),
        supabase
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .or(`user_id.eq.${currentUser.id},friend_id.eq.${currentUser.id}`)
          .eq('status', 'active'),
        supabase
          .from('connections')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', currentUser.id)
          .eq('status', 'active')
          .eq('favorites', true)
      ]);

      setHasPosted((postsRes.count || 0) > 0);
      setHasSentBottle((bottlesRes.count || 0) > 0);
      setHasConnected((connectionsRes.count || 0) > 0);
      setHasFavorited((favoritesRes.count || 0) > 0);
    } catch (error) {
      console.error('Error fetching journey data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when modal closes just in case they sent a bottle
  useEffect(() => {
    if (!isBottleModalOpen && !hasSentBottle) {
      fetchJourneyData();
    }
  }, [isBottleModalOpen]);

  const isProfileComplete =
    !!currentUser.name &&
    !!currentUser.profession &&
    !!currentUser.helpArea &&
    !!currentUser.behavioralProfile &&
    !!(currentUser.location?.city || currentUser.location?.fullAddress);

  const tasks = [
    {
      id: 1,
      title: 'Complete seu perfil',
      description: 'Ajude as pessoas a conhecerem quem você é.',
      icon: UserIcon,
      isCompleted: isProfileComplete,
      actionText: 'Completar Perfil',
      onAction: () => onNavigate('settings'),
    },
    {
      id: 2,
      title: 'Conecte-se com alguém',
      description: 'Comece uma nova conexão dentro da comunidade.',
      icon: UserGroupIcon,
      isCompleted: hasConnected,
      actionText: 'Procurar Pessoas',
      onAction: () => onNavigate('search'),
    },
    {
      id: 3,
      title: 'Escolha quem você quer acompanhar',
      description: 'Na EVO, você vê no feed as publicações das pessoas que favoritar.',
      icon: StarIcon,
      isCompleted: hasFavorited,
      actionText: 'Explorar',
      onAction: () => onNavigate('search'),
    },
    {
      id: 4,
      title: 'Compartilhe sua primeira reflexão',
      description: 'Divida um aprendizado, experiência ou sentimento.',
      icon: PencilIcon,
      isCompleted: hasPosted,
      actionText: 'Criar Post',
      onAction: () => {
        window.scrollTo({ top: 300, behavior: 'smooth' }); // Scrolls a little to show create post field in Feed
      },
    },
    {
      id: 5,
      title: 'Envie uma mensagem na garrafa',
      description: 'Alguém pode precisar ouvir algo que você tem para dizer.',
      icon: BottleIcon,
      isCompleted: hasSentBottle,
      actionText: 'Escrever',
      onAction: () => setIsBottleModalOpen(true),
    }
  ];

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercent = Math.round((completedCount / totalTasks) * 100);
  const isAllCompleted = completedCount === totalTasks;

  if (isDismissed) return null;

  return (
    <>
      <div className="w-full bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden mb-6 animate-fade-in relative">
        {/* Glow backdrop on the header/progress area */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-evo-blue/10 via-evo-purple/10 to-evo-orange/10 pointer-events-none opacity-50"></div>

        <div className="p-6 relative">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange bg-clip-text text-transparent">
              Sua jornada na EvoCommunity
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Cada passo aproxima você de conexões reais.
            </p>
          </div>

          {/* Progress Bar Area */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Progresso: {completedCount} de {totalTasks} concluído{completedCount !== 1 ? 's' : ''}
              </span>
              <span className="text-sm font-bold text-evo-purple">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {!isAllCompleted ? (
            <div className="space-y-4">
              {tasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div
                    key={task.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${task.isCompleted
                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                        : 'bg-white dark:bg-[#1C1C1E] border-slate-100 dark:border-white/5 hover:border-evo-purple/30 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-start space-x-4 mb-3 sm:mb-0 w-full sm:w-auto">
                      <div className={`p-2 rounded-full shrink-0 ${task.isCompleted
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400'
                        }`}>
                        {task.isCompleted ? (
                          <CheckCircleIcon className="w-6 h-6" />
                        ) : (
                          <Icon className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h4 className={`font-bold ${task.isCompleted ? 'text-slate-800 dark:text-slate-200 line-through opacity-70' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </h4>
                        <p className={`text-sm ${task.isCompleted ? 'text-slate-500 opacity-70' : 'text-slate-500 dark:text-slate-400'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {!task.isCompleted ? (
                      <button
                        onClick={task.onAction}
                        className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 group whitespace-nowrap"
                      >
                        <span>{task.actionText}</span>
                        <ChevronRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors" />
                      </button>
                    ) : (
                      <div className="shrink-0 flex items-center space-x-1 text-green-600 dark:text-green-400 font-medium text-sm w-full sm:w-auto justify-end sm:justify-center">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Concluído</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center animate-fade-in flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/30">
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Parabéns. Você já está vivendo a comunidade.
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                Você completou todas as etapas iniciais e está pronto para criar conexões reais e compartilhar suas experiências na EvoCommunity.
              </p>
              <button
                onClick={() => {
                  localStorage.setItem(`hideUserJourney_${currentUser.id}`, 'true');
                  setIsDismissed(true);
                }}
                className="bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold py-3 px-8 rounded-full shadow-lg hover:opacity-90 transition-all hover:-translate-y-1"
              >
                Continuar explorando a comunidade
              </button>
            </div>
          )}
        </div>
      </div>

      {isBottleModalOpen && (
        <SendBottleModal
          isOpen={isBottleModalOpen}
          onClose={() => setIsBottleModalOpen(false)}
          currentUser={currentUser}
        />
      )}
    </>
  );
};

export default UserJourney;

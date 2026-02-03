import React, { useEffect, useState } from 'react';
import { User, Event } from '../types';
import { supabase } from '../lib/supabaseClient';
import {
    SunIcon, MoonIcon, CalendarIcon, UsersIcon,
    SparklesIcon, ShoppingBagIcon, BookOpenIcon,
    ChatBubbleIcon, ArrowRightIcon, LocationMarkerIcon,
    BrainIcon
} from './icons';

interface DashboardWidgetsProps {
    currentUser: User;
    onNavigate: (page: string) => void;
}

export const GreetingHeader: React.FC<{ user: User }> = ({ user }) => {
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bom dia');
        else if (hour < 18) setGreeting('Boa tarde');
        else setGreeting('Boa noite');
    }, []);

    return (
        <div className="flex justify-between items-end mb-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {greeting}, <span className="text-evo-purple">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Pronto para evoluir hoje?
                </p>
            </div>
            <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>
        </div>
    );
};

export const StatsOverview: React.FC<{ user: User }> = ({ user }) => {
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        events: 0,
        nextEvent: ''
    });

    useEffect(() => {
        const fetchStats = async () => {
            console.log('Fetching dashboard stats...');
            const newStats = { ...stats };

            try {
                // Fetch Users
                const { count: usersCount, error: usersError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                if (usersError) console.error('Error fetching users:', usersError);
                else newStats.users = usersCount || 0;

                // Fetch Posts (Active)
                const { count: postsCount, error: postsError } = await supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true });
                // .eq('status', 'published'); // Assuming 'published' or similar, enabling simple count for now to debug

                if (postsError) console.error('Error fetching posts:', postsError);
                else newStats.posts = postsCount || 0;

                // Fetch Events
                const { count: eventsCount, error: eventsError } = await supabase
                    .from('events')
                    .select('*', { count: 'exact', head: true });

                if (eventsError) console.error('Error fetching events:', eventsError);
                else newStats.events = eventsCount || 0;

                // Fetch Next Event
                const { data: nextEventData, error: nextEventError } = await supabase
                    .from('events')
                    .select('title, sort_date')
                    .gte('sort_date', new Date().toISOString())
                    .order('sort_date', { ascending: true })
                    .limit(1)
                    .single();

                if (nextEventError && nextEventError.code !== 'PGRST116') { // PGRST116 is "no rows found" for single()
                    console.error('Error fetching next event:', nextEventError);
                }

                newStats.nextEvent = nextEventData ? nextEventData.title : 'Nenhum agendado';

                console.log('Stats fetched:', newStats);
                setStats(newStats);

            } catch (error) {
                console.error('Unexpected error in fetchStats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Users Card */}
            <div className="bg-surface-light dark:bg-[#1C1C1E] p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 relative overflow-hidden group hover:border-evo-purple/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Usuários Totais</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.users}</p>
                    </div>
                    <div className="p-2 bg-purple-500/10 rounded-lg text-evo-purple">
                        <UsersIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="flex items-center text-xs text-emerald-500 font-medium mt-2">
                    <span>↑ 12% este mês</span>
                </div>
            </div>

            {/* Posts Card */}
            <div className="bg-surface-light dark:bg-[#1C1C1E] p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Posts Ativos</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.posts}</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <ChatBubbleIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="flex items-center text-xs text-emerald-500 font-medium mt-2">
                    <span>↑ 5.4% este mês</span>
                </div>
            </div>

            {/* Events Card */}
            <div className="bg-surface-light dark:bg-[#1C1C1E] p-5 rounded-2xl border border-slate-200/50 dark:border-white/5 relative overflow-hidden group hover:border-evo-pink/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Eventos</p>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.events}</p>
                    </div>
                    <div className="p-2 bg-pink-500/10 rounded-lg text-evo-pink">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                </div>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium mt-2">
                    <span className="truncate max-w-full">Próximo: {stats.nextEvent}</span>
                </div>
            </div>
        </div>
    );
};

export const QuickActions: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const actions = [
        { label: 'Eventos', icon: <CalendarIcon className="w-6 h-6" />, page: 'events', color: 'bg-blue-500/10 text-blue-500' },
        { label: 'Loja', icon: <ShoppingBagIcon className="w-6 h-6" />, page: 'shop', color: 'bg-emerald-500/10 text-emerald-500' },
        { label: 'Biblioteca', icon: <BookOpenIcon className="w-6 h-6" />, page: 'library', color: 'bg-purple-500/10 text-purple-500' },
        { label: 'Chat', icon: <ChatBubbleIcon className="w-6 h-6" />, page: 'messages', color: 'bg-pink-500/10 text-pink-500' },
    ];

    return (
        <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                Acesso Rápido
            </h3>
            <div className="grid grid-cols-4 gap-4">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => onNavigate(action.page)}
                        className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${action.color}`}>
                            {action.icon}
                        </div>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export const UpcomingEvents: React.FC<{ onNavigate: (page: string, data?: any) => void }> = ({ onNavigate }) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .gte('sort_date', new Date().toISOString())
                    .order('sort_date', { ascending: true })
                    .limit(3);

                if (error) throw error;
                setEvents(data || []);
            } catch (error) {
                console.error('Error fetching dashboard events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <div className="animate-pulse h-32 bg-slate-100 dark:bg-white/5 rounded-2xl mb-8"></div>;
    if (events.length === 0) return null;

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Próximos Eventos</h3>
                <button
                    onClick={() => onNavigate('events')}
                    className="text-sm text-evo-purple hover:text-evo-pink font-medium transition-colors"
                >
                    Ver todos
                </button>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {events.map((event) => (
                    <div
                        key={event.id}
                        onClick={() => onNavigate('event-details', event)}
                        className="flex-none w-64 bg-surface-light dark:bg-[#1C1C1E] rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/10 cursor-pointer group hover:border-evo-purple/50 transition-all"
                    >
                        <div className="h-24 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                            <img
                                src={event.image_url}
                                alt={event.title}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute bottom-2 left-3 z-20">
                                <span className="text-xs font-bold text-white bg-evo-purple/90 px-2 py-0.5 rounded backdrop-blur-sm">
                                    {event.category}
                                </span>
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="flex items-start justify-between mb-1">
                                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                    {event.display_date}
                                </div>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 mb-1 group-hover:text-evo-purple transition-colors">
                                {event.title}
                            </h4>
                            <div className="text-xs text-slate-500 dark:text-slate-500 flex items-center truncate">
                                <LocationMarkerIcon className="w-3 h-3 mr-1" />
                                {event.location}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DailyReflection: React.FC = () => {
    const [reflection, setReflection] = useState("O amor radical começa dentro de você.");

    useEffect(() => {
        const fetchReflection = async () => {
            try {
                const { data } = await supabase
                    .from('motivation_messages')
                    .select('content')
                    .eq('active', true);

                if (data && data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    setReflection(data[randomIndex].content);
                }
            } catch (error) {
                console.error('Error fetching reflection:', error);
            }
        };
        fetchReflection();
    }, []);

    return (
        <div className="bg-surface-light dark:bg-[#1C1C1E] rounded-2xl border border-slate-200/50 dark:border-white/10 p-6 shadow-sm mb-6">
            <div className="flex items-center mb-4 space-x-2">
                <BrainIcon className="w-6 h-6 text-evo-purple" />
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-none">Reflexão do Dia</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">💬 Leve essa reflexão para o feed.</p>
                </div>
            </div>
            <div>
                <div className="relative pl-4 border-l-2 border-evo-purple hover:border-evo-blue transition-colors duration-300">
                    <p className="text-[15px] leading-relaxed font-medium text-slate-600 dark:text-slate-300 italic">
                        "{reflection}"
                    </p>
                </div>
            </div>
        </div>
    );
};

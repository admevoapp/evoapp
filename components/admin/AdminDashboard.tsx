import React, { useState, useEffect } from 'react';
import {
    UsersIcon, ChatBubbleIcon, CalendarIcon, DocumentTextIcon,
    ShoppingBagIcon, DiamondIcon, MegaphoneIcon, CogIcon,
    PresentationChartLineIcon, LightningBoltIcon,
    UserCircleIcon, BookOpenIcon
} from '../icons';
import { supabase } from '../../lib/supabaseClient';

const AdminDashboard: React.FC<{ onNavigate: (module: string) => void }> = ({ onNavigate }) => {
    const [greeting, setGreeting] = useState('');
    const [currentAdminName, setCurrentAdminName] = useState('Admin');
    const [stats, setStats] = useState({
        users: 0,
        posts: 0,
        events: 0,
        sales: 12400 // Mock data for now
    });
    const [nextEvent, setNextEvent] = useState('Nenhum agendado');
    const [chartData, setChartData] = useState<{ label: string, value: number }[]>([]);
    const [recentActivity, setRecentActivity] = useState<{ title: string, time: string, type: 'success' | 'warning' | 'info' | any }[]>([]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Bom dia');
        else if (hour < 18) setGreeting('Boa tarde');
        else setGreeting('Boa noite');

        const fetchData = async () => {
            // Fetch Admin Name
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
                if (data?.full_name) setCurrentAdminName(data.full_name.split(' ')[0]);
            }

            // Fetch Stats & Chart Data
            try {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                sevenDaysAgo.setHours(0, 0, 0, 0);

                // Fetch detailed stats
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
                const { count: eventsCount } = await supabase.from('events').select('*', { count: 'exact', head: true });

                const { data: nextEventData } = await supabase.from('events')
                    .select('title, sort_date')
                    .gte('sort_date', new Date().toISOString())
                    .order('sort_date', { ascending: true })
                    .limit(1)
                    .maybeSingle(); // Fix 406 error if no event

                // Debug: Check available columns in profiles
                const { data: debugProfile, error: debugError } = await supabase
                    .from('profiles')
                    .select('*')
                    .limit(1)
                    .maybeSingle();

                if (debugProfile) {
                    console.log('Available profile columns:', Object.keys(debugProfile));
                } else if (debugError) {
                    console.error('Debug fetch error:', debugError);
                }

                // Chart Data: Fetch specifically with error checking
                // Use explicit column selection to ensure it exists or fails clearly
                const { data: newUsers, error: newUsersError } = await supabase
                    .from('profiles')
                    .select('created_at')
                    .gte('created_at', sevenDaysAgo.toISOString());

                if (newUsersError) {
                    console.error('Error fetching new users chart data:', newUsersError);
                }

                // Activity Feed
                const { data: recentUsers } = await supabase
                    .from('profiles')
                    .select('full_name, created_at')
                    .order('created_at', { ascending: false })
                    .limit(3);

                const { data: recentEvents } = await supabase
                    .from('events')
                    .select('title, created_at')
                    .order('created_at', { ascending: false })
                    .limit(3);

                const { data: recentReports } = await supabase
                    .from('reports')
                    .select('reason, created_at')
                    .order('created_at', { ascending: false })
                    .limit(3);

                setStats(prev => ({
                    ...prev,
                    users: usersCount || 0,
                    posts: postsCount || 0,
                    events: eventsCount || 0
                }));

                if (nextEventData) setNextEvent(nextEventData.title);

                // Process Chart Data (Last 7 Days)
                const days = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - (6 - i));
                    const label = d.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3).toUpperCase();
                    const checkDateStr = d.toDateString(); // "Thu Jan 29 2026"

                    // Robust date matching
                    const count = newUsers?.filter(u => {
                        if (!u.created_at) return false;
                        const uDate = new Date(u.created_at);
                        return uDate.toDateString() === checkDateStr;
                    }).length || 0;

                    days.push({ label, value: count });
                }
                setChartData(days);

                // Process Recent Activity
                const activities: any[] = [];
                if (recentUsers) {
                    recentUsers.forEach(u => activities.push({
                        title: `Novo usuário: ${u.full_name?.split(' ')[0] || 'Novo Membro'}`,
                        time: new Date(u.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                        timestamp: new Date(u.created_at),
                        type: 'success'
                    }));
                }
                if (recentEvents) {
                    recentEvents.forEach(e => activities.push({
                        title: `Evento Criado: ${e.title}`,
                        time: e.created_at ? new Date(e.created_at).toLocaleDateString() : 'Recente',
                        timestamp: e.created_at ? new Date(e.created_at) : new Date(),
                        type: 'info'
                    }));
                }
                if (recentReports) {
                    recentReports.forEach(r => activities.push({
                        title: `Nova Denúncia: ${r.reason}`,
                        time: r.created_at ? new Date(r.created_at).toLocaleDateString() : 'Recente',
                        timestamp: r.created_at ? new Date(r.created_at) : new Date(),
                        type: 'warning'
                    }));
                }

                // Sort by timestamp desc and take top 5
                activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
                setRecentActivity(activities.slice(0, 6));

            } catch (error) {
                console.error('Error fetching admin dashboard stats:', error);
            }
        };
        fetchData();
    }, []);

    const ActivityItem = ({ title, time, type }: { title: string, time: string, type: 'success' | 'warning' | 'info' }) => (
        <div className="flex items-start space-x-3 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-default">
            <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
            <div>
                <p className="text-slate-200 text-sm font-medium">{title}</p>
                <p className="text-slate-500 text-xs mt-0.5">{time}</p>
            </div>
        </div>
    );

    // Dynamic Bar Chart
    const SimpleLineChart = () => {
        const maxValue = Math.max(...chartData.map(d => d.value), 4); // Min scale of 4 
        return (
            <div className="w-full h-48 flex items-end justify-between space-x-2 px-2 pt-8">
                {chartData.map((d, i) => {
                    const heightPercent = (d.value / maxValue) * 100;
                    return (
                        <div key={i} className="w-full bg-white/5 rounded-t-sm hover:bg-evo-purple/50 transition-colors relative group" style={{ height: `${Math.max(heightPercent, 2)}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 z-10">
                                {d.value} novos
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">

            {/* Greeting Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {greeting}, <span className="text-evo-purple">{currentAdminName}</span>
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Visão geral do ecossistema EVO.
                    </p>
                </div>
                <div className="hidden md:block">
                    <p className="text-sm font-medium text-slate-500">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
            </div>

            {/* Stats Grid - Adapted to new style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-evo-purple/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <UsersIcon className="w-16 h-16 text-evo-purple" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400 font-medium">Usuários Totais</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats.users}</p>
                        <span className="text-xs text-green-500 font-medium mt-2 block">↑ 12% este mês</span>
                    </div>
                </div>
                <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-evo-purple/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ChatBubbleIcon className="w-16 h-16 text-evo-pink" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400 font-medium">Posts Ativos</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats.posts}</p>
                        <span className="text-xs text-green-500 font-medium mt-2 block">↑ 5.4% este mês</span>
                    </div>
                </div>
                <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-evo-purple/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CalendarIcon className="w-16 h-16 text-evo-orange" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400 font-medium">Eventos</p>
                        <p className="text-2xl font-bold text-white mt-1">{stats.events}</p>
                        <span className="text-xs text-slate-500 font-medium mt-2 block">Próximo: {nextEvent}</span>
                    </div>
                </div>
                <div className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-evo-purple/50 transition-colors">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingBagIcon className="w-16 h-16 text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm text-slate-400 font-medium">Vendas (Mês)</p>
                        <p className="text-2xl font-bold text-white mt-1">R$ 12.4k</p>
                        <span className="text-xs text-green-500 font-medium mt-2 block">↑ 18% vs mês anterior</span>
                    </div>
                </div>
            </div>

            {/* Quick Actions - New Style */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    Acesso Rápido Admin
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Novo Aviso', icon: <MegaphoneIcon className="w-6 h-6" />, page: 'central', color: 'bg-blue-500/10 text-blue-500' },
                        { label: 'Criar Evento', icon: <CalendarIcon className="w-6 h-6" />, page: 'events', color: 'bg-orange-500/10 text-orange-500' },
                        { label: 'Gerenciar ARPs', icon: <UserCircleIcon className="w-6 h-6" />, page: 'users', color: 'bg-purple-500/10 text-purple-500' },
                        { label: 'Upload Arq.', icon: <DocumentTextIcon className="w-6 h-6" />, page: 'library', color: 'bg-pink-500/10 text-pink-500' },
                        { label: 'Pedidos', icon: <ShoppingBagIcon className="w-6 h-6" />, page: 'shop', color: 'bg-emerald-500/10 text-emerald-500' },
                        { label: 'Configurações', icon: <CogIcon className="w-6 h-6" />, page: 'settings', color: 'bg-slate-500/10 text-slate-400' },
                    ].map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => onNavigate(action.page)}
                            className="flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors group bg-[#1C1C1E]"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${action.color}`}>
                                {action.icon}
                            </div>
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

                {/* Chart Section */}
                <div className="lg:col-span-2 bg-[#1C1C1E] p-6 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center">
                            <PresentationChartLineIcon className="w-5 h-5 mr-2 text-evo-purple" />
                            Novos Cadastros (7 dias)
                        </h3>
                        <select className="bg-black/20 border border-white/10 text-slate-400 text-xs rounded-lg px-2 py-1 outline-none">
                            <option>Últimos 7 dias</option>
                        </select>
                    </div>
                    <SimpleLineChart />
                    <div className="flex justify-between mt-4 text-xs text-slate-500 font-semibold px-2">
                        {chartData.map((d, i) => (
                            <div key={i} className="w-full text-center">{d.label}</div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/5 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <LightningBoltIcon className="w-5 h-5 mr-2 text-yellow-500" />
                        Atividade Recente
                    </h3>
                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, idx) => (
                                <ActivityItem key={idx} title={activity.title} time={activity.time} type={activity.type} />
                            ))
                        ) : (
                            <div className="text-center text-slate-500 py-8 text-sm">Nenhuma atividade recente.</div>
                        )}
                    </div>
                    <button
                        onClick={() => onNavigate('activity-log')}
                        className="w-full mt-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Ver Histórico Completo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

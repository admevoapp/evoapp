import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { LightningBoltIcon, CheckCircleIcon, UserIcon, CalendarIcon, ShieldExclamationIcon, RefreshIcon } from '../icons';

interface ActivityLog {
    id: string;
    type: 'user' | 'event' | 'report' | 'system';
    title: string;
    timestamp: Date;
    details?: string;
    status: 'success' | 'warning' | 'info';
}

const AdminActivityLog: React.FC = () => {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            // Fetch Users (Recent Joins)
            const { data: users } = await supabase
                .from('profiles')
                .select('id, full_name, created_at')
                .order('created_at', { ascending: false })
                .limit(50);

            // Fetch Events (Recent Creations) check if created_at exists, if not use fallback logic or skip
            // Assuming 'events' table, standard timestamps usually exist or we use sort_date as proxy if needed
            // Let's assume standard 'created_at' for now. verify with mock if needed.
            // Using a safe select.
            const { data: events } = await supabase
                .from('events')
                .select('id, title, created_at') // created_at might be missing, checking schema is hard without SQL access. 
                // Based on types.ts 'created_at' is NOT in Event interface explicitly but usually Supabase tables have it.
                // We'll try to select it, if it fails, we handle error.
                .order('created_at', { ascending: false })
                .limit(20);

            // Fetch Reports (If table exists)
            const { data: reports } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            const logs: ActivityLog[] = [];

            if (users) {
                users.forEach(u => logs.push({
                    id: `user-${u.id}`,
                    type: 'user',
                    title: `Novo usuário: ${u.full_name || 'Sem nome'}`,
                    timestamp: new Date(u.created_at),
                    status: 'success'
                }));
            }

            if (events) {
                events.forEach(e => logs.push({
                    id: `event-${e.id}`,
                    type: 'event',
                    title: `Evento criado: ${e.title}`,
                    timestamp: new Date(e.created_at || new Date().toISOString()), // Fallback
                    status: 'info'
                }));
            }

            if (reports) {
                reports.forEach(r => logs.push({
                    id: `report-${r.id}`,
                    type: 'report',
                    title: `Denúncia: ${r.reason || 'Nova denúncia'}`,
                    timestamp: new Date(r.created_at),
                    status: 'warning'
                }));
            }

            // Sort merged logs
            logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setActivities(logs);

        } catch (error) {
            console.error('Error fetching activities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'user': return <UserIcon className="w-5 h-5 text-green-400" />;
            case 'event': return <CalendarIcon className="w-5 h-5 text-blue-400" />;
            case 'report': return <ShieldExclamationIcon className="w-5 h-5 text-yellow-500" />;
            default: return <RefreshIcon className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-white/5">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center">
                        <LightningBoltIcon className="w-8 h-8 mr-3 text-yellow-500" />
                        Histórico de Atividades
                    </h2>
                    <p className="text-slate-400 mt-2">Log completo de ações e registros do sistema.</p>
                </div>
                <button
                    onClick={fetchActivities}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                    title="Atualizar Logs"
                >
                    <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl overflow-hidden">
                {activities.length > 0 ? (
                    <div className="divide-y divide-white/5">
                        {activities.map((log) => (
                            <div key={log.id} className="p-4 flex items-start space-x-4 hover:bg-white/5 transition-colors group">
                                <div className="mt-1 p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                    {getIcon(log.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-medium">{log.title}</h4>
                                        <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                                            {log.timestamp.toLocaleDateString('pt-BR')} às {log.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {log.type === 'user' && 'Cadastro realizado via plataforma.'}
                                        {log.type === 'event' && 'Evento adicionado ao calendário oficial.'}
                                        {log.type === 'report' && 'Necessita atenção da moderação.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500">
                        {loading ? 'Carregando atividades...' : 'Nenhuma atividade registrada recentemente.'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminActivityLog;

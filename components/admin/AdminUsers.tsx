import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import {
    SearchIcon, BanIcon, CheckCircleIcon, UserCircleIcon,
    ShieldCheckIcon, PauseIcon, ClockIcon, PlusIcon,
    LightningBoltIcon, TrashIcon, BriefcaseIcon, ShieldExclamationIcon,
    FilterIcon, StarIcon, CheckBadgeIcon, MailIcon, LogoutIcon, UserIcon, PlayIcon,
    ArrowLeftIcon, ArrowRightIcon
} from '../icons';
import { DEFAULT_AVATAR_URL } from '../../constants';
import { supabase } from '../../lib/supabaseClient';
import { useModal } from '../../contexts/ModalContext';

// Extend the User type locally for the mock interface needs
interface ExtendedUser extends User {
    joinedDate: string;
    lastAccess: string;
    reportsCount: number;
    isPremium: boolean;
}

// Mock data removed in favor of real data fetching
const ITEMS_PER_PAGE = 5;

const AdminUsers: React.FC<{ onViewProfile?: (user: any) => void }> = ({ onViewProfile }) => {
    const { showAlert, showConfirm } = useModal();
    const [users, setUsers] = useState<ExtendedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'blocked'>('all');
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'premium' | 'moderator' | 'admin' | 'master' | 'partner'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTab, setModalTab] = useState<'summary' | 'status' | 'engagement' | 'reports' | 'history'>('summary');
    const [isSaving, setIsSaving] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // First fetch users
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;

            console.log('Fetching detailed stats for users...');

            // Fetch counts manually as subqueries might be limited depending on permissions/schema
            // We'll map them for each user. Ideally this should be a view or a joined query if relations allow.
            // For performance on large sets, direct relation count is better: .select('*, posts(count), connections(count)')
            // Let's try the direct relation first.
            const { data: joinedData, error: joinError } = await supabase
                .from('profiles')
                .select(`
                    *,
                    posts:posts(count),
                    connections:connections!connections_user_id_fkey(count)
                `);

            // Since 'reports' might not be standard, we skip for now or use mock for that specific field if table missing
            // But let's check basic fetching first.

            const sourceData = joinError ? profiles : joinedData; // Fallback if relations fail

            const mappedUsers: ExtendedUser[] = (sourceData || []).map((u: any) => ({
                id: u.id,
                name: u.full_name || 'Usuário Sem Nome',
                username: u.username || 'user',
                avatarUrl: u.avatar_url || DEFAULT_AVATAR_URL,
                profession: u.profession,
                location: u.location || {},
                app_role: u.app_role || 'user',
                status: u.status || 'active',
                joinedDate: new Date(u.created_at || u.updated_at).toLocaleDateString(),
                lastAccess: 'Recente',
                reportsCount: 0, // Placeholder as we don't have reports table confirmed
                isPremium: u.evo_status?.pelopes || false,
                evoStatus: u.evo_status,
                socials: u.socials,
                bio: u.bio,
                postsCount: u.posts?.[0]?.count ?? 0,
                token_version: u.token_version,
                status_reason: u.status_reason,
                connections: u.connections ?? [] // Connections count is difficult if it's a count object, logic usually differs: u.connections is list or {count}.
            } as ExtendedUser));

            // fix connections count if structure is [{count: 5}]
            const finalUsers = mappedUsers.map((u: any, idx: number) => {
                const rawUser = sourceData ? sourceData[idx] : null;
                const postsCount = rawUser && rawUser.posts && rawUser.posts[0] ? rawUser.posts[0].count : 0;
                // For connections, it might be bidirectional. Let's assume just a number for now or 0.
                const connCount = rawUser && rawUser.connections && rawUser.connections[0] ? rawUser.connections[0].count : 0;

                return {
                    ...u,
                    postsCount,
                    // Use the count directly if possible, but matching User type which expects array usually
                    // If we change User type globally it impacts everywhere.
                    // For now, let's just use the count in a specific property if ExtendedUser allowed it.
                    // But ExtendedUser inherits User.
                    // Let's stick to the array hack for compatibility with `.length` check in UI.
                    connections: Array(connCount).fill(0)
                };
            });

            setUsers(finalUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
            await showAlert('Erro', 'Falha ao carregar lista de usuários.', { type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenUser = (user: ExtendedUser) => {
        setSelectedUser(user);
        setModalTab('summary');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleFilterChange = () => {
        // Reset page when filters change - handled by effect below? 
        // Or cleaner: make filteredUsers a memo and use useEffect to reset page when filters change.
    };

    // Filtering Logic
    const filteredUsers = users.filter(u => {
        const nameMatch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const userMatch = (u.username || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || userMatch;
        const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
        const matchesRole = roleFilter === 'all' || u.app_role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, roleFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleSaveUser = async (updatedFields: Partial<ExtendedUser>) => {
        if (!selectedUser) return;
        setIsSaving(true);
        try {
            const dbFields: any = {};
            if (updatedFields.app_role) dbFields.app_role = updatedFields.app_role;
            if (updatedFields.status) dbFields.status = updatedFields.status;

            const { error } = await supabase
                .from('profiles')
                .update(dbFields)
                .eq('id', selectedUser.id);

            if (error) throw error;

            // Update local state
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...updatedFields } : u));
            setSelectedUser({ ...selectedUser, ...updatedFields });
            await showAlert('Sucesso', 'Alterações salvas com sucesso!', { type: 'success', icon: <CheckCircleIcon className="w-10 h-10 text-green-500" /> });
        } catch (err) {
            console.error('Error saving user:', err);
            await showAlert('Erro', 'Erro ao salvar alterações.', { type: 'danger' });
        } finally {
            setIsSaving(false);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'master': return 'bg-[#ca04ff] text-white';
            case 'admin': return 'bg-[#a203cc] text-white';
            case 'moderator': return 'bg-[#00f8f5] text-slate-900';
            case 'partner': return 'bg-[#ff4a24] text-white';
            default: return 'bg-slate-700 text-slate-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'suspended': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'blocked': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    // --- Modal Content Components ---

    const SummaryTab = ({ user }: { user: ExtendedUser }) => (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <img src={user.avatarUrl} alt={user.name} className="w-20 h-20 rounded-full border-2 border-[#ca04ff]" />
                <div>
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <p className="text-slate-400">@{user.username}</p>
                    <p className="text-sm text-slate-500">{user.location?.city || 'Localização não definida'} • {user.profession || 'Sem profissão'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Papel na Comunidade</label>
                    <select
                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#ca04ff] outline-none appearance-none"
                        defaultValue={user.app_role}
                        onChange={(e) => handleSaveUser({ app_role: e.target.value as any })}
                    >
                        <option value="user">Usuário Padrão</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#121212] p-4 rounded-xl border border-white/5 space-y-4">
                <h4 className="font-bold text-white mb-2 flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 mr-2 text-[#00f8f5]" />
                    Permissões Especiais
                </h4>
                <p className="text-xs text-slate-500">As permissões são atribuídas automaticamente com base no papel selecionado acima.</p>
            </div>

            <button
                disabled={isSaving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#00f8f5] via-[#ca04ff] to-[#ff4a24] text-white font-bold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {isSaving ? 'Salvando...' : 'Alterações Automáticas'}
            </button>
        </div>
    );

    const StatusTab = ({ user }: { user: ExtendedUser }) => {
        const [reason, setReason] = useState(user.status_reason || '');

        const handleSaveReason = async () => {
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({ status_reason: reason })
                    .eq('id', user.id);

                if (error) throw error;

                // Update local state immediately
                setUsers(users.map(u => u.id === user.id ? { ...u, status_reason: reason } : u));
                if (selectedUser && selectedUser.id === user.id) {
                    setSelectedUser({ ...selectedUser, status_reason: reason });
                }

                await showAlert('Sucesso', 'Motivo atualizado com sucesso!', {
                    icon: <CheckCircleIcon className="w-10 h-10 text-green-500" />
                });
            } catch (e) {
                console.error(e);
                await showAlert('Erro', 'Falha ao salvar motivo.');
            }
        };

        return (
            <div className="space-y-6">
                <div className="bg-[#121212] p-6 rounded-xl border border-white/10">
                    <h4 className="font-bold text-white mb-4">Status da Conta</h4>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <input type="radio" name="status" className="form-radio text-green-500 focus:ring-green-500 h-5 w-5" checked={user.status === 'active'} onChange={() => handleSaveUser({ status: 'active' })} />
                            <span className="text-green-400 font-semibold">Ativo</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <input type="radio" name="status" className="form-radio text-yellow-500 focus:ring-yellow-500 h-5 w-5" checked={user.status === 'suspended'} onChange={() => handleSaveUser({ status: 'suspended' })} />
                            <div>
                                <span className="text-yellow-400 font-semibold block">Suspenso</span>
                                <span className="text-xs text-slate-500">Usuário não poderá postar ou comentar temporariamente.</span>
                            </div>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
                            <input type="radio" name="status" className="form-radio text-red-500 focus:ring-red-500 h-5 w-5" checked={user.status === 'blocked'} onChange={() => handleSaveUser({ status: 'blocked' })} />
                            <div>
                                <span className="text-red-400 font-semibold block">Banido</span>
                                <span className="text-xs text-slate-500">Acesso revogado permanentemente.</span>
                            </div>
                        </label>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm text-slate-400 mb-2">Motivo / Justificativa</label>
                        <textarea
                            className="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-white/30 outline-none resize-none"
                            rows={3}
                            placeholder="Descreva o motivo da alteração de status..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <div className="mt-2 flex justify-end">
                            <button
                                onClick={handleSaveReason}
                                className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-semibold border border-purple-500/20"
                            >
                                Salvar Motivo
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={async () => {
                            const userEmail = (user as any).email;
                            if (!userEmail) {
                                await showAlert('Erro', 'E-mail do usuário não disponível no perfil.');
                                return;
                            }
                            const confirmed = await showConfirm('Resetar Senha', `Enviar e-mail de redefinição para ${userEmail}?`);
                            if (confirmed) {
                                const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
                                    redirectTo: window.location.origin + '/reset-password',
                                });
                                if (error) await showAlert('Erro', 'Falha ao enviar e-mail.');
                                else await showAlert('Sucesso', 'E-mail de redefinição enviado!');
                            }
                        }}
                        className="px-4 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-white/5 flex items-center justify-center space-x-2"
                    >
                        <MailIcon className="w-5 h-5" />
                        <span>Resetar Senha</span>
                    </button>
                    <button
                        onClick={async () => {
                            const confirmed = await showConfirm(
                                'Forçar Logout',
                                `Deseja derrubar a sessão de ${user.name}? O usuário será desconectado imediatamente.`,
                                { icon: <LogoutIcon className="w-8 h-8 text-red-500" />, confirmLabel: 'Sim, Desconectar', type: 'warning' }
                            );
                            if (confirmed) {
                                try {
                                    const newVersion = Math.floor(Date.now() / 1000);

                                    const { error } = await supabase
                                        .from('profiles')
                                        .update({ token_version: newVersion })
                                        .eq('id', user.id);

                                    if (error) throw error;
                                    await showAlert('Sucesso', 'Sinal de logout enviado. O usuário será desconectado em breve.');
                                } catch (e) {
                                    console.error(e);
                                    await showAlert('Erro', 'Falha ao forçar logout.');
                                }
                            }
                        }}
                        className="px-4 py-3 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-white/5 flex items-center justify-center space-x-2"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        <span>Forçar Logout</span>
                    </button>
                </div>
            </div>
        );
    };

    const EngagementTab = ({ user }: { user: ExtendedUser }) => {
        const [stats, setStats] = useState({
            followers: 0,
            following: 0,
            posts: user.postsCount || 0
        });

        useEffect(() => {
            const fetchStats = async () => {
                try {
                    // Use RPC to get accurate counts (matching ProfilePage logic)
                    const { data: profileStats, error } = await supabase.rpc('get_profile_stats', {
                        target_user_id: user.id
                    });

                    // Fetch real posts count
                    const { count: postsCount } = await supabase
                        .from('posts')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id);

                    if (error) throw error;

                    if (profileStats) {
                        setStats(prev => ({
                            ...prev,
                            followers: profileStats.followers || 0,
                            following: profileStats.following || 0,
                            posts: postsCount || 0
                        }));
                    }
                } catch (e) {
                    console.error('Error fetching engagement stats:', e);
                }
            };
            fetchStats();
        }, [user.id]);

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-[#121212] p-4 rounded-xl border border-white/10 text-center">
                        <span className="block text-2xl font-bold text-[#00f8f5]">{stats.followers}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Seguidores</span>
                    </div>
                    <div className="bg-[#121212] p-4 rounded-xl border border-white/10 text-center">
                        <span className="block text-2xl font-bold text-[#ca04ff]">{stats.following}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Seguindo</span>
                    </div>
                    <div className="bg-[#121212] p-4 rounded-xl border border-white/10 text-center">
                        <span className="block text-2xl font-bold text-[#ff4a24]">{stats.posts}</span>
                        <span className="text-xs text-slate-500 uppercase tracking-wider">Posts</span>
                    </div>
                </div>
            </div>
        );
    };



    const ReportsTab = ({ user }: { user: ExtendedUser }) => {
        const [reports, setReports] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchReports = async () => {
                setLoading(true);
                // Attempt to fetch reports if table exists
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .eq('reported_id', user.id)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setReports(data);
                }
                setLoading(false);
            };
            fetchReports();
        }, [user.id]);

        return (
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Carregando denúncias...</div>
                ) : reports.length > 0 ? (
                    reports.map((report, i) => (
                        <div key={i} className="bg-[#121212] p-4 rounded-xl border border-red-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-1">
                                    <ShieldExclamationIcon className="w-5 h-5 text-red-500" />
                                    <span className="font-bold text-white">{report.reason || 'Conteúdo Impróprio'}</span>
                                </div>
                                <p className="text-sm text-slate-400">ID: {report.id} • {new Date(report.created_at).toLocaleDateString()}</p>
                                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.status === 'resolved' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                    {report.status === 'resolved' ? 'Resolvido' : 'Em Análise'}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs">Resolver</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500/50" />
                        <p>Nenhuma denúncia encontrada para este usuário.</p>
                    </div>
                )}
            </div>
        );
    };

    const HistoryTab = () => {
        // Fallback to simple join date if no logs
        return (
            <div className="space-y-0 relative border-l border-white/10 ml-2">
                <div className="mb-6 ml-6 relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-[#1C1C1E]"></div>
                    <h5 className="text-white font-medium text-sm">Entrou na plataforma</h5>
                    <p className="text-xs text-slate-500">{selectedUser?.joinedDate}</p>
                </div>
                {/* Mock logs for visual consistency if no real logs */}
                {selectedUser?.postsCount > 0 && (
                    <div className="mb-6 ml-6 relative">
                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-[#1C1C1E]"></div>
                        <h5 className="text-white font-medium text-sm">Realizou {selectedUser.postsCount} postagens</h5>
                        <p className="text-xs text-slate-500">Atividade Recente</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h2 className="text-3xl font-bold text-white">Gerenciar Usuários</h2>
                    <p className="text-slate-400 mt-2">Controle de acesso, permissões e status da comunidade.</p>
                </div>

                {/* Search and Filters Block */}
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group flex-grow md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-[#ca04ff] transition-colors">
                            <SearchIcon className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nome, @arroba ou e-mail"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1C1C1E] text-white border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#ca04ff] transition-colors placeholder-slate-600"
                        />
                    </div>
                </div>
            </div>

            {/* Simple Add User Button for now, avoiding master check on non-existent `currentUser` variable from constants */}
            {/* Future: Add proper role check here if needed using context or prop */}


            {/* Filters Bar */}
            <div className="space-y-4">
                {/* Status Filter */}
                <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
                    {['all', 'active', 'suspended', 'blocked'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status as any)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all whitespace-nowrap
                        ${statusFilter === status
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30 hover:text-white'}`}
                        >
                            {status === 'all' ? 'Todos' : status === 'active' ? 'Ativos' : status === 'suspended' ? 'Suspensos' : 'Banidos'}
                        </button>
                    ))}
                </div>

                {/* Role Filter */}
                <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar items-center">
                    <FilterIcon className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                    {['all', 'user', 'admin', 'master'].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap
                        ${roleFilter === role
                                    ? 'bg-[#ca04ff] text-white shadow-lg shadow-[#ca04ff]/20'
                                    : 'bg-[#1C1C1E] text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
                        >
                            {role === 'all' ? 'Todos' : role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users List */}
            <div className="grid grid-cols-1 gap-4">
                {paginatedUsers.map(user => (
                    <div key={user.id} className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group flex flex-col lg:flex-row items-start lg:items-center gap-6 shadow-sm">
                        {/* Left: User Info */}
                        <div className="flex items-center space-x-4 min-w-[250px]">
                            <div className="relative">
                                <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-bold text-white text-lg">{user.name}</h3>
                                    {user.app_role !== 'user' && (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(user.app_role || 'user')}`}>
                                            {user.app_role}
                                        </span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm">@{user.username}</p>
                                <div className="flex items-center text-xs text-slate-500 mt-1">
                                    <BriefcaseIcon className="w-3 h-3 mr-1" />
                                    {user.profession || 'Sem profissão'}
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-wrap items-center justify-start lg:justify-end w-full lg:w-auto gap-2 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">

                            <button
                                onClick={() => handleOpenUser(user)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            >
                                <CheckBadgeIcon className="w-4 h-4" />
                                <span className="text-xs font-bold">Gerenciar</span>
                            </button>

                            <button
                                onClick={() => onViewProfile ? onViewProfile(user) : showAlert('Aviso', 'N/A')}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-[#00f8f5]/10 hover:text-[#00f8f5] text-slate-300 transition-colors"
                            >
                                <UserCircleIcon className="w-4 h-4" />
                                <span className="text-xs font-bold">Perfil</span>
                            </button>

                            {/* Suspend / Re-activate */}
                            {user.status === 'suspended' ? (
                                <button
                                    onClick={async () => {
                                        const confirmed = await showConfirm('Reativar', `Reativar ${user.name}?`, { type: 'success' });
                                        if (confirmed) {
                                            const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', user.id);
                                            if (!error) {
                                                setUsers(users.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
                                                showAlert('Sucesso', 'Reativado!');
                                            }
                                        }
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-green-500/10 hover:text-green-500 transition-colors"
                                >
                                    <PlayIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">Reativar</span>
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        const confirmed = await showConfirm('Suspender', `Suspender ${user.name}?`, { type: 'warning' });
                                        if (confirmed) {
                                            const { error } = await supabase.from('profiles').update({ status: 'suspended' }).eq('id', user.id);
                                            if (!error) {
                                                setUsers(users.map(u => u.id === user.id ? { ...u, status: 'suspended' } : u));
                                                showAlert('Suspenso', 'Usuário suspenso.');
                                            }
                                        }
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-yellow-500/10 hover:text-yellow-500 text-slate-300 transition-colors"
                                >
                                    <PauseIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">Suspender</span>
                                </button>
                            )}

                            {/* Ban / Unban */}
                            {user.status === 'blocked' ? (
                                <button
                                    onClick={async () => {
                                        const confirmed = await showConfirm('Desbloquear', `Desbloquear ${user.name}?`, { type: 'success' });
                                        if (confirmed) {
                                            const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', user.id);
                                            if (!error) {
                                                setUsers(users.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
                                                showAlert('Desbloqueado', 'Usuário desbloqueado.');
                                            }
                                        }
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-green-500/10 hover:text-green-500 transition-colors"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">Desbloquear</span>
                                </button>
                            ) : (
                                <button
                                    onClick={async () => {
                                        const confirmed = await showConfirm('Banir', `Banir ${user.name} permanentemente?`, { type: 'danger' });
                                        if (confirmed) {
                                            const { error } = await supabase.from('profiles').update({ status: 'blocked' }).eq('id', user.id);
                                            if (!error) {
                                                setUsers(users.map(u => u.id === user.id ? { ...u, status: 'blocked' } : u));
                                                showAlert('Banido', 'Usuário banido.');
                                            }
                                        }
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-500/10 hover:text-red-500 text-slate-300 transition-colors"
                                >
                                    <BanIcon className="w-4 h-4" />
                                    <span className="text-xs font-bold">Banir</span>
                                </button>
                            )}

                            {/* Delete - New Feature */}
                            <button
                                onClick={async () => {
                                    const confirmed = await showConfirm(
                                        'Excluir Conta',
                                        `Tem certeza ABSOLUTA? Isso excluirá a conta de ${user.name} e todos os dados relacionados permanentemente. Não pode ser desfeito.`,
                                        { type: 'danger', confirmLabel: 'SIM, EXCLUIR', icon: <TrashIcon className="w-8 h-8 text-red-600" /> }
                                    );
                                    if (confirmed) {
                                        try {
                                            // 1. Attempt RPC (Preferred)
                                            const { error: rpcError } = await supabase.rpc('delete_user_account', {
                                                target_user_id: user.id
                                            });

                                            if (rpcError) {
                                                console.warn('RPC deletion failed:', rpcError);

                                                // If error is FK violation or explicit permission error, do NOT fallback.
                                                // 23503 = foreign_key_violation
                                                // 42883 = undefined_function (If function is missing, we fallback)
                                                if (rpcError.code !== '42883') {
                                                    throw new Error(`Erro RPC: ${rpcError.message} (Código: ${rpcError.code})`);
                                                }

                                                // 2. Fallback: Client-side delete
                                                // Using select() to verify if a row was actually deleted (handle silent RLS failure)
                                                const { error: profileError, data: deletedData } = await supabase
                                                    .from('profiles')
                                                    .delete()
                                                    .eq('id', user.id)
                                                    .select();

                                                if (profileError) throw profileError;

                                                // If no rows returned, RLS likely blocked the deletion
                                                if (!deletedData || deletedData.length === 0) {
                                                    throw new Error("Falha na exclusão: Permissão negada (RLS) ou usuário já excluído.");
                                                }
                                            }

                                            setUsers(users.filter(u => u.id !== user.id));
                                            showAlert('Excluído', 'Conta excluída com sucesso.', {
                                                type: 'success'
                                            });
                                        } catch (e: any) {
                                            console.error(e);
                                            // Show the REAL error message to the user
                                            showAlert('Erro ao Excluir', e.message || 'Erro desconhecido.', {
                                                type: 'danger'
                                            });
                                        }
                                    }
                                }}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-red-900/30 text-red-700 hover:bg-red-900/20 hover:text-red-500 transition-colors ml-2"
                                title="Excluir Conta Definitivamente"
                            >
                                <TrashIcon className="w-4 h-4" />
                                <span className="text-xs font-bold">Excluir</span>
                            </button>

                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <p className="text-sm text-slate-400">
                        Mostrando <span className="font-medium text-white">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> a <span className="font-medium text-white">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> de <span className="font-medium text-white">{filteredUsers.length}</span> usuários
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-white/10 bg-[#1C1C1E] text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Logic to show window of pages could be added here, but simple for now
                                // If pages > 5, we might want smarter logic.
                                // Let's keep it simple: if lots of pages, just showing current numeric is okay, but user requested 5 items per page so pages might be many.
                                // Let's just show standard Prev [1] [2] ... [N] Next or similar.
                                // For MVP, let's just do Prev / Next and "Page X of Y" or simple numbers.
                                // Let's iterate simple numbers around current page.

                                let p = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage > 3) p = currentPage - 2 + i;
                                    if (p > totalPages) p = p - (p - totalPages); // clamp? No, simpler logic needed for valid range.
                                }

                                // Simplified approach:
                                return null;
                            })}

                            {/* Simple Page Numbers logic */}
                            {(() => {
                                const pages = [];
                                const maxVisible = 5;
                                let start = Math.max(1, currentPage - 2);
                                let end = Math.min(totalPages, start + maxVisible - 1);

                                if (end - start + 1 < maxVisible) {
                                    start = Math.max(1, end - maxVisible + 1);
                                }

                                for (let p = start; p <= end; p++) {
                                    pages.push(
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === p
                                                ? 'bg-[#ca04ff] text-white'
                                                : 'bg-[#1C1C1E] border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                }
                                return pages;
                            })()}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-white/10 bg-[#1C1C1E] text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ArrowRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* User Management Modal */}
            {isModalOpen && selectedUser && (
                <div className="fixed inset-0 z-[60] flex items-start justify-center pt-10 p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-[#1C1C1E] w-full max-w-4xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#121212]">
                            <h2 className="text-2xl font-bold text-white">Gerenciar Usuário</h2>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-white transition-colors">✕</button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                            {/* Sidebar Navigation */}
                            <div className="w-full md:w-64 bg-[#121212] border-r border-white/10 p-4 space-y-2 overflow-y-auto">
                                {[
                                    { id: 'summary', label: 'Resumo', icon: <UserCircleIcon className="w-5 h-5" /> },
                                    { id: 'status', label: 'Status & Segurança', icon: <ShieldCheckIcon className="w-5 h-5" /> },
                                    { id: 'engagement', label: 'Engajamento', icon: <StarIcon className="w-5 h-5" /> },
                                    { id: 'reports', label: 'Denúncias', icon: <ShieldExclamationIcon className="w-5 h-5" /> },
                                    { id: 'history', label: 'Histórico', icon: <ClockIcon className="w-5 h-5" /> },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setModalTab(tab.id as any)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                                    ${modalTab === tab.id
                                                ? 'bg-gradient-to-r from-[#00f8f5]/10 to-[#ca04ff]/10 text-white border border-white/10'
                                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
                                    >
                                        <div className={modalTab === tab.id ? 'text-[#00f8f5]' : ''}>{tab.icon}</div>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 p-6 overflow-y-auto bg-[#1C1C1E]">
                                {modalTab === 'summary' && <SummaryTab user={selectedUser} />}
                                {modalTab === 'status' && <StatusTab user={selectedUser} />}
                                {modalTab === 'engagement' && <EngagementTab user={selectedUser} />}
                                {modalTab === 'reports' && <ReportsTab user={selectedUser} />}
                                {modalTab === 'history' && <HistoryTab />}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;

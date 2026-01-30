import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useModal } from '../../contexts/ModalContext';
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    SearchIcon,
    EyeIcon,
    TrashIcon,
    ExternalLinkIcon
} from '../icons';

interface Report {
    id: number;
    reporter_id: string | null;
    is_anonymous: boolean;
    reason: string;
    target: string;
    description: string;
    evidence_url: string | null;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    created_at: string;
    reporter?: {
        full_name: string;
        username: string;
        avatar_url: string;
    };
}

const AdminReports: React.FC = () => {
    const { showConfirm, showAlert } = useModal();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('reports')
                .select(`
          *,
          reporter:profiles!reporter_id(full_name, username, avatar_url)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('reports')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setReports(reports.map(r => r.id === id ? { ...r, status: newStatus as any } : r));
            if (selectedReport && selectedReport.id === id) {
                setSelectedReport({ ...selectedReport, status: newStatus as any });
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const deleteReport = async (id: number) => {
        const confirmed = await showConfirm(
            'Excluir Denúncia',
            'Tem certeza que deseja excluir esta denúncia? Esta ação não pode ser desfeita.',
            { type: 'danger', confirmLabel: 'Sim, Excluir', icon: <TrashIcon className="w-8 h-8 text-red-500" /> }
        );

        if (!confirmed) return;

        try {
            const { error, count } = await supabase
                .from('reports')
                .delete({ count: 'exact' })
                .eq('id', id);

            if (error) throw error;

            // If RLS blocks deletion, count will be 0
            if (count === 0) {
                throw new Error("Permissão negada ou denúncia já excluída.");
            }

            setReports(reports.filter(r => r.id !== id));
            if (selectedReport?.id === id) setSelectedReport(null);

            await showAlert('Sucesso', 'Denúncia excluída com sucesso.', { type: 'success' });
        } catch (error) {
            console.error('Error deleting report:', error);
            await showAlert('Erro', 'Falha ao excluir denúncia.', { type: 'danger' });
        }
    };

    const filteredReports = reports.filter(report => {
        if (filterStatus !== 'all' && report.status !== filterStatus) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'investigating': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'dismissed': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-400';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendente';
            case 'investigating': return 'Em Análise';
            case 'resolved': return 'Resolvido';
            case 'dismissed': return 'Arquivado';
            default: return status;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Denúncias</h1>
                <div className="flex space-x-2">
                    <select
                        value={filterStatus}
                        onChange={(e) => {
                            setFilterStatus(e.target.value);
                            setSelectedReport(null);
                        }}
                        className="bg-[#1C1C1E] border border-white/10 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-evo-purple"
                    >
                        <option value="all">Todas</option>
                        <option value="pending">Pendentes</option>
                        <option value="investigating">Em Análise</option>
                        <option value="resolved">Resolvidas</option>
                        <option value="dismissed">Arquivadas</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-1 bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-12rem)]">
                    <div className="p-4 border-b border-white/10">
                        <h2 className="font-semibold text-white">Recentes</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="p-4 text-center text-slate-500">Carregando...</div>
                        ) : filteredReports.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">Nenhuma denúncia encontrada.</div>
                        ) : (
                            filteredReports.map(report => (
                                <div
                                    key={report.id}
                                    onClick={() => setSelectedReport(report)}
                                    className={`p-4 rounded-xl cursor-pointer transition-colors ${selectedReport?.id === report.id ? 'bg-evo-purple/10 border-evo-purple/30 border' : 'bg-white/5 border border-transparent hover:bg-white/10'}`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(report.status)}`}>
                                            {getStatusLabel(report.status)}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-white mb-1">{report.reason}</h3>
                                    <p className="text-sm text-slate-400 line-clamp-2">{report.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2">
                    {selectedReport ? (
                        <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 h-full min-h-[500px]">
                            <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/10">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h2 className="text-2xl font-bold text-white">{selectedReport.reason}</h2>
                                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(selectedReport.status)}`}>
                                            {getStatusLabel(selectedReport.status)}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm">
                                        ID: #{selectedReport.id} • Enviado em {new Date(selectedReport.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => deleteReport(selectedReport.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Excluir Denúncia"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Reporter Info */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Quem Denunciou</h3>
                                    {selectedReport.is_anonymous ? (
                                        <div className="flex items-center space-x-3 text-slate-400">
                                            <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                                                <EyeIcon className="w-5 h-5" />
                                            </div>
                                            <span>Denúncia Anônima</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={selectedReport.reporter?.avatar_url || 'https://via.placeholder.com/40'}
                                                alt={selectedReport.reporter?.username}
                                                className="w-10 h-10 rounded-full bg-slate-700"
                                            />
                                            <div>
                                                <p className="text-white font-medium">{selectedReport.reporter?.full_name || 'Usuário'}</p>
                                                <p className="text-slate-400 text-sm">@{selectedReport.reporter?.username}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Detalhes</h3>

                                    {selectedReport.target && (
                                        <div className="mb-4">
                                            <p className="text-xs text-slate-500 mb-1">Alvo / Link</p>
                                            <div className="flex items-center space-x-2 text-evo-purple bg-evo-purple/10 px-3 py-2 rounded-lg">
                                                <ExternalLinkIcon className="w-4 h-4" />
                                                <a href={selectedReport.target} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                                    {selectedReport.target}
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Descrição</p>
                                        <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Evidence */}
                                {selectedReport.evidence_url && (
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Evidências</h3>
                                        <div className="rounded-lg overflow-hidden border border-white/10">
                                            <a href={selectedReport.evidence_url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={selectedReport.evidence_url}
                                                    alt="Evidência"
                                                    className="w-full h-auto max-h-96 object-contain bg-black/50"
                                                />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-slate-300 mb-4">Ações de Moderação</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => updateStatus(selectedReport.id, 'investigating')}
                                            disabled={selectedReport.status === 'investigating'}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedReport.status === 'investigating' ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            Marcar como Em Análise
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedReport.id, 'resolved')}
                                            disabled={selectedReport.status === 'resolved'}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedReport.status === 'resolved' ? 'bg-green-500/20 text-green-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                                        >
                                            Marcar como Resolvido
                                        </button>
                                        <button
                                            onClick={() => updateStatus(selectedReport.id, 'dismissed')}
                                            disabled={selectedReport.status === 'dismissed'}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedReport.status === 'dismissed' ? 'bg-slate-500/20 text-slate-400 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-600'}`}
                                        >
                                            Arquivar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-2xl">
                            <p>Selecione uma denúncia para ver os detalhes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminReports;

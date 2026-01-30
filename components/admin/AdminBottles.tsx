import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User } from '../../types';
import { TrashIcon, SearchIcon, BottleIcon, UserIcon, RefreshIcon } from '../icons';
import { useModal } from '../../contexts/ModalContext';
import { DEFAULT_AVATAR_URL } from '../../constants';

interface AdminBottlesProps {
    currentUser?: User;
}

interface BottleMessageAdmin {
    id: string;
    content: string;
    sender_id: string;
    receiver_id: string | null;
    created_at: string;
    is_read: boolean;
    sender?: {
        full_name: string;
        username: string;
        avatar_url: string;
    };
    receiver?: {
        full_name: string;
        username: string;
        avatar_url: string;
    };
}

const AdminBottles: React.FC<AdminBottlesProps> = () => {
    const [messages, setMessages] = useState<BottleMessageAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const { showConfirm, showAlert } = useModal();

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bottle_messages')
                .select(`
          *,
          sender:profiles!bottle_messages_sender_id_fkey(full_name, username, avatar_url),
          receiver:profiles!bottle_messages_receiver_id_fkey(full_name, username, avatar_url)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching bottles:', error);
            showAlert('Erro', 'Erro ao carregar mensagens.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm(
            'Excluir Mensagem',
            'Tem certeza que deseja excluir esta mensagem? Ela sumirá para sempre do oceano.',
            { icon: <TrashIcon className="w-8 h-8 text-red-500" /> }
        );

        if (confirmed) {
            setIsDeleting(id);
            try {
                const { error } = await supabase
                    .from('bottle_messages')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                setMessages(prev => prev.filter(m => m.id !== id));
                showAlert('Sucesso', 'Mensagem excluída.');
            } catch (error) {
                console.error('Error deleting bottle:', error);
                showAlert('Erro', 'Não foi possível excluir a mensagem.');
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const filteredMessages = messages.filter(msg =>
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 shadow-lg">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        <BottleIcon className="w-8 h-8 mr-3 text-evo-purple" />
                        Gerenciamento de Garrafas
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Monitore e modere as mensagens anônimas da comunidade.
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar mensagem ou remetente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#121212] border border-white/10 rounded-xl px-4 py-2.5 sm:w-64 text-sm text-white focus:outline-none focus:border-evo-purple pl-10 transition-all"
                        />
                        <SearchIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    </div>
                    <button
                        onClick={fetchMessages}
                        className="p-2.5 bg-[#121212] border border-white/10 rounded-xl text-slate-400 hover:text-white hover:border-white/30 transition-all"
                        title="Atualizar"
                    >
                        <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                                <th className="px-6 py-4">Remetente (Quem enviou)</th>
                                <th className="px-6 py-4">Mensagem</th>
                                <th className="px-6 py-4">Destinatário (Quem pescou)</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="w-6 h-6 border-2 border-evo-purple border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                        Carregando o oceano...
                                    </td>
                                </tr>
                            ) : filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Nenhuma garrafa encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <tr key={msg.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center space-x-3">
                                                {msg.sender?.avatar_url ? (
                                                    <img src={msg.sender.avatar_url} alt={msg.sender.full_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 ring-2 ring-white/10">
                                                        <UserIcon className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-white text-sm">{msg.sender?.full_name || 'Desconhecido'}</p>
                                                    <p className="text-xs text-slate-500">@{msg.sender?.username || 'user'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <div className="p-3 bg-black/20 rounded-lg border border-white/5 italic text-slate-300 text-sm max-w-md">
                                                "{msg.content}"
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            {msg.receiver ? (
                                                <div className="flex items-center space-x-2 opacity-75">
                                                    <img src={msg.receiver.avatar_url || DEFAULT_AVATAR_URL} className="w-6 h-6 rounded-full" />
                                                    <span className="text-xs text-slate-400">{msg.receiver.username}</span>
                                                    {msg.is_read && <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded ml-2">Lida</span>}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                                                    🌊 À deriva no mar
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(msg.created_at).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <button
                                                onClick={() => handleDelete(msg.id)}
                                                disabled={isDeleting === msg.id}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Excluir Mensagem"
                                            >
                                                {isDeleting === msg.id ? (
                                                    <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                                                ) : (
                                                    <TrashIcon className="w-5 h-5" />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/10 text-xs text-slate-500 flex justify-between">
                    <span>Mostrando {filteredMessages.length} de {messages.length} garrafas</span>
                    <span>O remetente é anônimo para o usuário, mas visível aqui para moderação.</span>
                </div>
            </div>
        </div>
    );
};

export default AdminBottles;

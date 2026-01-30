import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { TrashIcon, PlusIcon, SparklesIcon, BrainIcon, CheckCircleIcon, BanIcon, PencilIcon } from '../icons';
import { useModal } from '../../contexts/ModalContext';

interface Reflection {
    id: number;
    content: string;
    active: boolean;
    created_at: string;
}

const AdminReflections: React.FC = () => {
    const [reflections, setReflections] = useState<Reflection[]>([]);
    const [newReflection, setNewReflection] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const { showConfirm, showAlert } = useModal();

    useEffect(() => {
        fetchReflections();
    }, []);

    const fetchReflections = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('motivation_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReflections(data || []);
        } catch (error) {
            console.error('Error fetching reflections:', error);
            showAlert('Erro', 'Erro ao carregar reflexões.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReflection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReflection.trim()) return;
        setSubmitLoading(true);

        try {
            if (editingId) {
                // Update existing
                const { error } = await supabase
                    .from('motivation_messages')
                    .update({ content: newReflection })
                    .eq('id', editingId);

                if (error) throw error;
                showAlert('Sucesso', 'Reflexão atualizada com sucesso!');
            } else {
                // Insert new
                const { error } = await supabase
                    .from('motivation_messages')
                    .insert([{ content: newReflection, active: true }]);

                if (error) throw error;
                showAlert('Sucesso', 'Reflexão adicionada com sucesso!');
            }

            setNewReflection('');
            setEditingId(null);
            setShowForm(false);
            fetchReflections();
        } catch (error) {
            console.error('Error saving reflection:', error);
            showAlert('Erro', 'Erro ao salvar reflexão.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteReflection = async (id: number) => {
        const confirmed = await showConfirm(
            'Excluir Reflexão',
            'Tem certeza que deseja excluir esta reflexão?'
        );

        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('motivation_messages')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchReflections();
            } catch (error) {
                console.error('Error deleting reflection:', error);
                showAlert('Erro', 'Erro ao excluir reflexão.');
            }
        }
    };

    const handleEdit = (reflection: Reflection) => {
        setNewReflection(reflection.content);
        setEditingId(reflection.id);
        setShowForm(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Reflexões do Dia</h2>
                    <p className="text-slate-400 mt-2">Gerencie as mensagens de motivação exibidas no feed.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setNewReflection('');
                            setShowForm(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Nova Reflexão</span>
                    </button>
                )}
            </header>

            {/* Add/Edit Reflection Form */}
            {showForm && (
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 animate-fade-in max-w-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Reflexão' : 'Nova Reflexão'}</h3>
                    <form onSubmit={handleSaveReflection} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Mensagem</label>
                            <textarea
                                value={newReflection}
                                onChange={(e) => setNewReflection(e.target.value)}
                                placeholder="Digite a mensagem de reflexão..."
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                rows={3}
                            />
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setNewReflection('');
                                }}
                                className="px-6 py-2 rounded-xl text-slate-300 hover:bg-white/5"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!newReflection.trim() || submitLoading}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {submitLoading ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Adicionar')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Reflections */}
            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Carregando...</div>
                ) : reflections.length === 0 ? (
                    <div className="text-center py-12 bg-[#1C1C1E] rounded-2xl border border-white/10">
                        <p className="text-slate-500">Nenhuma reflexão cadastrada.</p>
                    </div>
                ) : (
                    reflections.map((reflection) => (
                        <div
                            key={reflection.id}
                            className={`bg-[#1C1C1E] p-6 rounded-2xl border ${reflection.active ? 'border-evo-purple/50' : 'border-white/10'} flex items-center justify-between group transition-all`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-lg ${reflection.active ? 'bg-evo-purple/10 text-evo-purple' : 'bg-white/5 text-slate-500'}`}>
                                    <BrainIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className={`font-medium text-lg italic ${reflection.active ? 'text-white' : 'text-slate-500'}`}>
                                        "{reflection.content}"
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {new Date(reflection.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleEdit(reflection)}
                                    title="Editar"
                                    className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteReflection(reflection.id)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Excluir"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminReflections;

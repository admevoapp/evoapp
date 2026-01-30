
import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    TrashIcon,
    MegaphoneIcon,
    DocumentTextIcon,
    CalendarIcon,
    FolderIcon,
    MicrophoneIcon,
    LocationMarkerIcon,
    EyeIcon,
    EyeOffIcon,
    PencilIcon,
    UploadIcon,
    CheckCircleIcon,
    XMarkIcon,
    ExclamationCircleIcon
} from '../icons';
import { useModal } from '../../contexts/ModalContext';
import { supabase } from '../../lib/supabaseClient';

interface CentralItem {
    id: number;
    title: string;
    category: 'Aviso' | 'Comunicado' | 'Agenda' | 'Material' | 'Mensagem' | 'Encontro';
    description?: string;
    content?: string;
    date_display?: string;
    type?: string;
    url?: string;
    file_size?: string;
    created_at: string;
    active: boolean;
}

const AdminCentral: React.FC = () => {
    const [items, setItems] = useState<CentralItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formState, setFormState] = useState({
        title: '',
        category: 'Aviso' as const,
        description: '',
        date_display: '',
        type: 'text',
        url: '',
        file_size: ''
    });

    const { showConfirm, showAlert } = useModal();

    const fetchItems = async () => {
        try {
            setLoading(true);
            // Fetch ALL items, including inactive ones
            const { data, error } = await supabase
                .from('central_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching admin central items:', error);
            showAlert('Erro', 'Falha ao carregar itens.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setFormState({ title: '', category: 'Aviso', description: '', date_display: '', type: 'text', url: '', file_size: '' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEditClick = (item: CentralItem) => {
        setFormState({
            title: item.title,
            category: item.category as any,
            description: item.description || item.content || '',
            date_display: item.date_display || '',
            type: item.type || 'text',
            url: item.url || '',
            file_size: item.file_size || ''
        });
        setEditingId(item.id);
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm(
            'Excluir Item?',
            'Esta ação irá remover permanentemente o item do banco de dados.',
            { icon: <TrashIcon className="w-12 h-12 text-red-500 mb-2" /> }
        );
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('central_items')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                setItems(items.filter(i => i.id !== id));
            } catch (error) {
                console.error('Error deleting item:', error);
                showAlert('Erro', 'Falha ao excluir item.', { icon: <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" /> });
            }
        }
    };

    const handleToggleActive = async (item: CentralItem) => {
        try {
            const newStatus = !item.active;
            const updatedItems = items.map(i => i.id === item.id ? { ...i, active: newStatus } : i);
            setItems(updatedItems);

            const { error } = await supabase
                .from('central_items')
                .update({ active: newStatus })
                .eq('id', item.id);

            if (error) throw error;
        } catch (error) {
            console.error('Error toggling active:', error);
            showAlert('Erro', 'Falha ao atualizar status.', { icon: <ExclamationCircleIcon className="w-16 h-16 text-red-500 mb-4" /> });
            fetchItems();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = fileName;

        setUploading(true);

        try {
            const { error: uploadError } = await supabase.storage
                .from('central_files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Format file size (e.g., 2.5 MB)
            const sizeInBytes = file.size;
            let formattedSize = '';
            if (sizeInBytes < 1024 * 1024) {
                formattedSize = `${(sizeInBytes / 1024).toFixed(1)} KB`;
            } else {
                formattedSize = `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
            }

            const { data } = supabase.storage
                .from('central_files')
                .getPublicUrl(filePath);

            setFormState({ ...formState, url: data.publicUrl, file_size: formattedSize });
        } catch (error: any) {
            console.error('Error uploading file:', error);
            showAlert('Erro', `Falha ao enviar arquivo: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                title: formState.title,
                category: formState.category,
                description: formState.description,
                content: formState.description,
                date_display: formState.date_display || null,
                type: formState.type,
                url: formState.url || null,
                file_size: formState.file_size || null
            };

            if (editingId) {
                const { error } = await supabase
                    .from('central_items')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                await showAlert('Sucesso', 'Item atualizado com sucesso.', { icon: <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />, confirmLabel: 'OK' });
            } else {
                const { error } = await supabase
                    .from('central_items')
                    .insert({ ...payload, active: true });
                if (error) throw error;
                await showAlert('Sucesso', 'Item publicado na Central Evo.', { icon: <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />, confirmLabel: 'OK' });
            }

            resetForm();
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
            showAlert('Erro', 'Falha ao salvar item.');
        }
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'Aviso': return <MegaphoneIcon className="w-6 h-6" />;
            case 'Comunicado': return <DocumentTextIcon className="w-6 h-6" />;
            case 'Agenda': return <CalendarIcon className="w-6 h-6" />;
            case 'Material': return <FolderIcon className="w-6 h-6" />;
            case 'Mensagem': return <MicrophoneIcon className="w-6 h-6" />;
            case 'Encontro': return <LocationMarkerIcon className="w-6 h-6" />;
            default: return <MegaphoneIcon className="w-6 h-6" />;
        }
    };

    const getColor = (category: string) => {
        switch (category) {
            case 'Aviso': return 'bg-blue-500/20 text-blue-400';
            case 'Comunicado': return 'bg-purple-500/20 text-purple-400';
            case 'Agenda': return 'bg-orange-500/20 text-orange-400';
            case 'Material': return 'bg-green-500/20 text-green-400';
            case 'Mensagem': return 'bg-pink-500/20 text-pink-400';
            case 'Encontro': return 'bg-yellow-500/20 text-yellow-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Central EVO</h2>
                    <p className="text-slate-400 mt-2">Gerencie avisos, agenda e comunicados oficiais.</p>
                </div>
                {!isFormOpen && (
                    <button onClick={() => { resetForm(); setIsFormOpen(true); }} className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Item</span>
                    </button>
                )}
            </header>

            {isFormOpen && (
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 max-w-2xl animate-fade-in">
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Item' : 'Adicionar à Central'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Título"
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-purple outline-none"
                                value={formState.title}
                                onChange={e => setFormState({ ...formState, title: e.target.value })}
                                required
                            />
                            <select
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-purple outline-none"
                                value={formState.category}
                                onChange={e => setFormState({ ...formState, category: e.target.value as any })}
                            >
                                <option value="Aviso">Aviso Oficial</option>
                                <option value="Comunicado">Comunicado</option>
                                <option value="Agenda">Agenda</option>
                                <option value="Material">Material</option>
                                <option value="Mensagem">Mensagem</option>
                                <option value="Encontro">Encontro Presencial</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Data Exibição (Opcional)"
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-purple outline-none"
                                value={formState.date_display}
                                onChange={e => setFormState({ ...formState, date_display: e.target.value })}
                            />
                            <select
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-purple outline-none"
                                value={formState.type}
                                onChange={e => setFormState({ ...formState, type: e.target.value })}
                            >
                                <option value="text">Texto Simples</option>
                                <option value="pdf">PDF (Arquivo)</option>
                                <option value="zip">ZIP (Arquivo)</option>
                                <option value="video">Vídeo</option>
                                <option value="audio">Áudio</option>
                            </select>

                            {['pdf', 'zip', 'video', 'audio'].includes(formState.type) ? (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept={
                                            formState.type === 'pdf' ? ".pdf" :
                                                formState.type === 'zip' ? ".zip,.rar,.7z" :
                                                    formState.type === 'video' ? "video/*" : "audio/*,.mp3,.wav,.ogg"
                                        }
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className={`w-full flex items-center justify-center space-x-2 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-slate-400 cursor-pointer hover:bg-white/5 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                                    >
                                        <UploadIcon className="w-5 h-5" />
                                        <span className="truncate">
                                            {uploading ? 'Enviando...' : (formState.url ? 'Arquivo Enviado' : `Upload ${formState.type.toUpperCase()}`)}
                                        </span>
                                    </label>
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    placeholder="URL (Link/Arquivo)"
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-purple outline-none"
                                    value={formState.url}
                                    onChange={e => setFormState({ ...formState, url: e.target.value })}
                                />
                            )}
                        </div>

                        <textarea
                            placeholder="Conteúdo / Descrição detalhada"
                            rows={3}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-purple outline-none"
                            value={formState.description}
                            onChange={e => setFormState({ ...formState, description: e.target.value })}
                        ></textarea>

                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-400">Cancelar</button>
                            <button
                                type="submit"
                                className="px-6 py-2 rounded-xl bg-evo-purple text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={uploading}
                            >
                                {editingId ? 'Salvar Alterações' : 'Publicar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-slate-500">Carregando itens...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 bg-[#1C1C1E] rounded-xl border border-white/5">Nenhum item encontrado.</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className={`bg-[#1C1C1E] p-4 rounded-2xl border ${item.active ? 'border-white/10' : 'border-red-500/20 opacity-75'} flex items-center justify-between group hover:border-white/20 transition-all`}>
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-xl ${getColor(item.category)} relative`}>
                                    {getIcon(item.category)}
                                    {!item.active && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-[#1C1C1E]"></div>
                                    )}
                                </div>
                                <div>
                                    <h4 className={`font-bold ${item.active ? 'text-white' : 'text-slate-400 line-through'}`}>{item.title}</h4>
                                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                                        <span>{item.category}</span>
                                        <span>•</span>
                                        <span>{item.date_display || new Date(item.created_at).toLocaleDateString()}</span>
                                        {item.type !== 'text' && (
                                            <>
                                                <span>•</span>
                                                <span className="uppercase text-xs border border-white/10 px-1 rounded">{item.type}</span>
                                            </>
                                        )}
                                        {!item.active && <span className="text-red-500 font-bold ml-2 text-xs uppercase px-2 py-0.5 bg-red-500/10 rounded">Inativo</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleToggleActive(item)}
                                    className={`p-2 rounded-lg transition-colors ${item.active ? 'text-slate-500 hover:text-white bg-white/5 hover:bg-white/10' : 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20'}`}
                                    title={item.active ? "Ocultar (Inativar)" : "Mostrar (Ativar)"}
                                >
                                    {item.active ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                                </button>

                                <button
                                    onClick={() => handleEditClick(item)}
                                    className="p-2 text-slate-500 hover:text-evo-purple bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-slate-500 hover:text-red-500 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Excluir Permanentemente"
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

export default AdminCentral;

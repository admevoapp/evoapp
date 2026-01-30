
import React, { useState, useEffect, useRef } from 'react';
import { LibraryItem } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { PlusIcon, TrashIcon, DocumentTextIcon, PhotoIcon, VideoCameraIcon, LinkIcon, PencilIcon } from '../icons';
import { useModal } from '../../contexts/ModalContext';

const AdminLibrary: React.FC = () => {
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModaOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<LibraryItem>>({ type: 'pdf' });
    const { showConfirm } = useModal();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('library_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching library items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Remover item?', 'Tem certeza que deseja remover este item?');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('library_items')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                setItems(items.filter(i => i.id !== id));
            } catch (error) {
                console.error('Error deleting item:', error);
                alert('Erro ao deletar item');
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                const { error } = await supabase
                    .from('library_items')
                    .update({
                        title: formData.title,
                        type: formData.type,
                        url: formData.url,
                        category: formData.category
                    })
                    .eq('id', editingId);

                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from('library_items')
                    .insert([{
                        title: formData.title,
                        type: formData.type,
                        url: formData.url,
                        category: formData.category
                    }]);

                if (error) throw error;
            }

            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ type: 'pdf' });
            fetchItems();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Erro ao salvar item');
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('library')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('library')
                .getPublicUrl(fileName);

            if (data) {
                setFormData({
                    ...formData,
                    url: data.publicUrl,
                    title: formData.title || file.name
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Erro ao fazer upload do arquivo.');
        } finally {
            setUploading(false);
        }
    };

    const openEditModal = (item: LibraryItem) => {
        setEditingId(item.id);
        setFormData(item);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ type: 'pdf' });
        setIsModalOpen(true);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <DocumentTextIcon className="w-6 h-6 text-red-400" />;
            case 'image': return <PhotoIcon className="w-6 h-6 text-blue-400" />;
            case 'video': return <VideoCameraIcon className="w-6 h-6 text-purple-400" />;
            default: return <LinkIcon className="w-6 h-6 text-green-400" />;
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Biblioteca</h2>
                    <p className="text-slate-400 mt-2">Central de arquivos e materiais.</p>
                </div>
                <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    <span>Adicionar Item</span>
                </button>
            </header>

            {isModaOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 w-full max-w-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Material' : 'Adicionar Material'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Título do Arquivo"
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white"
                                value={formData.title || ''}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <select
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="image">Imagem</option>
                                    <option value="video">Vídeo</option>
                                    <option value="link">Link</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Categoria"
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white"
                                    value={formData.category || ''}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    required
                                />
                            </div>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${uploading ? 'border-evo-purple bg-evo-purple/10' : 'border-white/10 hover:border-white/30 text-slate-400'}`}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                {uploading ? (
                                    <p className="text-evo-purple animate-pulse">Enviando arquivo...</p>
                                ) : (
                                    <p>{formData.url ? 'Arquivo selecionado (Clique para alterar)' : 'Clique para selecionar o arquivo ou cole a URL abaixo'}</p>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="URL do arquivo/link"
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white"
                                value={formData.url || ''}
                                onChange={e => setFormData({ ...formData, url: e.target.value })}
                                required
                            />

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                                <button type="submit" disabled={uploading} className={`px-6 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold shadow-lg shadow-purple-500/20 transition-all duration-300 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {editingId ? 'Salvar' : 'Adicionar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-white">Carregando...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.length === 0 ? (
                        <p className="text-slate-500 col-span-3">Nenhum item na biblioteca.</p>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/10 flex items-center justify-between group hover:border-white/20 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-white/5 rounded-xl">
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold">{item.title}</h4>
                                        <p className="text-xs text-slate-500 uppercase tracking-wide">{item.category}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(item)} className="p-2 text-slate-400 hover:text-white">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminLibrary;

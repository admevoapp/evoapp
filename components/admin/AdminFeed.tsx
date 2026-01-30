import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { PlusIcon, TrashIcon, PencilIcon, BanIcon, CheckCircleIcon, MegaphoneIcon } from '../icons';
import { useModal } from '../../contexts/ModalContext';
import { readFile } from '../../utils/imageUtils';
import ImageCropperModal from '../ImageCropperModal';

interface FeedPost {
    id: number;
    title: string;
    content: string;
    image_url: string;
    button_text?: string;
    button_link?: string;
    is_active: boolean;
    created_at: string;
}

const AdminFeed: React.FC = () => {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newPost, setNewPost] = useState<Partial<FeedPost>>({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Image Cropper State
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showConfirm, showAlert } = useModal();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('admin_feed_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (error) {
            console.error('Error fetching admin feed posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Remover Post?', 'Tem certeza que deseja remover este post?');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('admin_feed_posts')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                setPosts(posts.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting post:', error);
                await showAlert('Erro', 'Erro ao excluir post');
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setUploadedImageSrc(imageDataUrl);
            setCropModalOpen(true);
            e.target.value = '';
        }
    };

    const handleEdit = (post: FeedPost) => {
        setEditingId(post.id);
        setNewPost({
            title: post.title,
            content: post.content,
            image_url: post.image_url,
            button_text: post.button_text,
            button_link: post.button_link,
            is_active: post.is_active
        });
        setShowForm(true);
    };

    const handleActivate = async (post: FeedPost) => {
        try {
            const willBeActive = !post.is_active;

            if (willBeActive) {
                // Deactivate all others first
                await supabase
                    .from('admin_feed_posts')
                    .update({ is_active: false })
                    .neq('id', post.id); // Optimization: Update all except this one (which we will set true next) - actually safer to set all false then this true, or just this one logic.

                // Actually, supabase doesn't support "update all where id != X" efficiently without multiple queries easily in one go if RLS is strict, but here we are admin.
                // Let's just set all to false first would be safest logic-wise, but we can also just rely on the fact we will refresh.

                const { error: deactivateError } = await supabase
                    .from('admin_feed_posts')
                    .update({ is_active: false })
                    .neq('id', 0); // Hack to select all? neq id 0 works if ids are > 0. Or just NOT in.

                if (deactivateError) throw deactivateError;
            }

            const { error } = await supabase
                .from('admin_feed_posts')
                .update({ is_active: willBeActive })
                .eq('id', post.id);

            if (error) throw error;

            // Refresh all to reflect changes (others might have been deactivated)
            fetchPosts();

        } catch (error) {
            console.error('Error updating post status:', error);
            await showAlert('Erro', 'Erro ao atualizar status do post');
        }
    };

    const handleCropSave = async (croppedBlob: Blob) => {
        setCropModalOpen(false);
        setUploadingImage(true);

        try {
            const fileName = `feed/${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('profiles') // using public bucket we know works
                .upload(fileName, croppedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(fileName);

            setNewPost(prev => ({ ...prev, image_url: publicUrl }));
        } catch (error: any) {
            console.error('Error uploading image:', error);
            await showAlert('Erro', `Erro ao fazer upload da imagem: ${error.message}`);
        } finally {
            setUploadingImage(false);
            setUploadedImageSrc(null);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            if (!newPost.title || !newPost.content) {
                await showAlert('Atenção', 'Preencha título e conteúdo');
                return;
            }

            const postData = {
                title: newPost.title,
                content: newPost.content,
                image_url: newPost.image_url,
                button_text: newPost.button_text,
                button_link: newPost.button_link,
                is_active: newPost.is_active || false
            };

            // If activating this one, deactivate others first
            if (postData.is_active) {
                await supabase
                    .from('admin_feed_posts')
                    .update({ is_active: false })
                    .neq('id', 0);
            }

            let error;

            if (editingId) {
                const response = await supabase
                    .from('admin_feed_posts')
                    .update(postData)
                    .eq('id', editingId);
                error = response.error;
            } else {
                const response = await supabase
                    .from('admin_feed_posts')
                    .insert([postData]);
                error = response.error;
            }

            if (error) throw error;

            setShowForm(false);
            setNewPost({});
            setEditingId(null);
            fetchPosts();

        } catch (error: any) {
            console.error('Error saving post:', error);
            await showAlert('Erro ao Salvar', error.message || JSON.stringify(error) || 'Erro desconhecido');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Feed Principal</h2>
                    <p className="text-slate-400 mt-2">Gerencie os alertas e novidades da tela inicial.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setNewPost({});
                            setShowForm(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Post</span>
                    </button>
                )}
            </header>

            {showForm && (
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 animate-fade-in max-w-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Post' : 'Novo Post'}</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
                            <input
                                type="text"
                                value={newPost.title || ''}
                                onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Conteúdo</label>
                            <textarea
                                value={newPost.content || ''}
                                onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                rows={4}
                                required
                            />
                        </div>

                        {/* Imagem */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Imagem (Opcional)</label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium flex items-center"
                                    >
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Selecionar Imagem
                                    </button>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="image/*"
                                />
                                {uploadingImage && <div className="text-sm text-evo-purple animate-pulse">Enviando imagem...</div>}
                                {newPost.image_url && (
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-white/10">
                                        <img src={newPost.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setNewPost({ ...newPost, image_url: '' })}
                                            className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Texto do Botão (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Saiba Mais"
                                    value={newPost.button_text || ''}
                                    onChange={e => setNewPost({ ...newPost, button_text: e.target.value })}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Link do Botão (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    value={newPost.button_link || ''}
                                    onChange={e => setNewPost({ ...newPost, button_link: e.target.value })}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 pt-2">
                            <input
                                type="checkbox"
                                id="activeCheck"
                                checked={newPost.is_active || false}
                                onChange={(e) => setNewPost({ ...newPost, is_active: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-600 text-evo-purple focus:ring-evo-purple bg-[#121212]"
                            />
                            <label htmlFor="activeCheck" className="text-slate-300 text-sm">Publicar Imediatamente (Desativará outros posts)</label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-slate-300 hover:bg-white/5">Cancelar</button>
                            <button
                                type="submit"
                                disabled={submitLoading || uploadingImage}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {submitLoading ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Criar Post')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Carregando posts...</div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-[#1C1C1E] rounded-2xl border border-white/10">
                            Nenhum post encontrado.
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className={`bg-[#1C1C1E] p-6 rounded-2xl border ${post.is_active ? 'border-evo-purple/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'border-white/10'} flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 relative overflow-hidden`}>
                                {post.is_active && (
                                    <div className="absolute top-0 right-0 bg-evo-purple text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-xl">
                                        Ativo
                                    </div>
                                )}

                                {post.image_url ? (
                                    <img src={post.image_url} alt={post.title} className="w-full sm:w-48 h-32 object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full sm:w-48 h-32 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                                        <MegaphoneIcon className="w-8 h-8" />
                                    </div>
                                )}

                                <div className="flex-1 w-full text-center sm:text-left">
                                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{post.content}</p>
                                    {post.button_text && (
                                        <div className="mt-2 text-xs text-evo-blue">
                                            Botão: {post.button_text} ({post.button_link})
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleActivate(post)}
                                        title={post.is_active ? "Pausar" : "Ativar agora (Pausa outros)"}
                                        className={`p-2 rounded-lg transition-colors ${post.is_active ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
                                    >
                                        {post.is_active ? <CheckCircleIcon className="w-5 h-5" /> : <BanIcon className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(post)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-evo-blue"
                                        title="Editar"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-500"
                                        title="Excluir"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {cropModalOpen && uploadedImageSrc && (
                <ImageCropperModal
                    isOpen={cropModalOpen}
                    imageSrc={uploadedImageSrc}
                    onClose={() => { setCropModalOpen(false); setUploadedImageSrc(null); }}
                    onSave={handleCropSave}
                    cropShape="rect"
                    aspectRatio={700 / 400} // 700x400
                    title="Ajustar Imagem (700x400)"
                />
            )}
        </div>
    );
};

export default AdminFeed;

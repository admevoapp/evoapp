
import React, { useState } from 'react';
import { Post } from '../../types';
import { mockPosts, currentUser } from '../../constants';
import { TrashIcon, PencilIcon, PlusIcon, UploadIcon, CheckCircleIcon } from '../icons';
import { useModal } from '../../contexts/ModalContext';

const AdminPosts: React.FC = () => {
    // Filter initially to show only Pinned posts or posts by Master
    const [posts, setPosts] = useState<Post[]>(
        mockPosts.filter(post => post.isPinned || post.author.role === 'master')
    );

    const [isCreating, setIsCreating] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostImage, setNewPostImage] = useState<string | null>(null);
    const { showConfirm } = useModal();

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Remover Post?', 'Tem certeza que deseja remover esta publicação do feed?');
        if (confirmed) setPosts(posts.filter(p => p.id !== id));
    };

    const handlePin = (id: number) => {
        setPosts(posts.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const newPost: Post = {
            id: Date.now(),
            author: currentUser, // Master User
            content: newPostContent,
            imageUrl: newPostImage || undefined,
            likes: 0,
            comments: 0,
            timestamp: 'Agora',
            isLiked: false,
            isPinned: true // Auto-pin official posts
        };
        setPosts([newPost, ...posts]);
        setIsCreating(false);
        setNewPostContent('');
        setNewPostImage(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setNewPostImage(ev.target?.result as string);
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Feed Principal</h2>
                    <p className="text-slate-400 mt-2">Gerencie as publicações oficiais e fixadas da comunidade.</p>
                </div>
                <button onClick={() => setIsCreating(!isCreating)} className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                    <PlusIcon className="w-5 h-5" />
                    <span>Novo Post Oficial</span>
                </button>
            </header>

            {isCreating && (
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-evo-purple/30 animate-fade-in shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-evo-blue to-evo-purple"></div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <CheckCircleIcon className="w-5 h-5 mr-2 text-evo-purple" />
                        Criar Publicação Oficial (Master)
                    </h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <textarea
                            value={newPostContent}
                            onChange={e => setNewPostContent(e.target.value)}
                            placeholder="Escreva uma mensagem oficial para a comunidade..."
                            rows={4}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-evo-purple resize-none placeholder-slate-500"
                            required
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <input type="file" onChange={handleImageChange} className="hidden" id="post-image" />
                                    <label htmlFor="post-image" className="flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 text-slate-300 transition-colors border border-white/5">
                                        <UploadIcon className="w-5 h-5" />
                                        <span>{newPostImage ? 'Imagem Selecionada' : 'Adicionar Mídia'}</span>
                                    </label>
                                </div>
                                {newPostImage && <img src={newPostImage} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-white/10" />}
                            </div>
                            <button type="submit" className="px-8 py-2 rounded-xl bg-white text-slate-900 font-bold shadow-lg hover:bg-slate-200 transition-colors">Publicar Agora</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                <h3 className="text-white font-bold text-lg border-b border-white/10 pb-2">Timeline Oficial (Master)</h3>
                {posts.length > 0 ? (
                    posts.map(post => (
                        <div key={post.id} className={`bg-[#1C1C1E] p-6 rounded-2xl border ${post.isPinned ? 'border-evo-purple shadow-[0_0_15px_rgba(202,4,255,0.15)]' : 'border-white/10'} flex flex-col space-y-4 transition-all hover:bg-[#252527]`}>
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <img src={post.author.avatarUrl} className={`w-10 h-10 rounded-full object-cover ${post.author.role === 'master' ? 'ring-2 ring-evo-purple' : ''}`} alt={post.author.name} />
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h4 className="text-white font-semibold">{post.author.name}</h4>
                                            {post.author.role === 'master' && (
                                                <span className="bg-evo-purple text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Master</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500">{post.timestamp}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePin(post.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1 ${post.isPinned ? 'bg-evo-purple text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                        title={post.isPinned ? 'Desafixar' : 'Fixar no topo'}
                                    >
                                        <span>{post.isPinned ? 'Fixado' : 'Fixar'}</span>
                                    </button>
                                    <button onClick={() => handleDelete(post.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Excluir Post">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{post.content}</p>
                            {post.imageUrl && <img src={post.imageUrl} alt="Post" className="rounded-xl max-h-80 object-cover w-full border border-white/5" />}

                            <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2 border-t border-white/5">
                                <span>{post.likes} curtidas</span>
                                <span>{post.comments} comentários</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500 bg-[#1C1C1E] rounded-2xl border border-white/5">
                        <p>Nenhum post fixado ou oficial no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPosts;

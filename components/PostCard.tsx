import React, { useState, useRef, useEffect } from 'react';
import { Post, User, Comment } from '../types';
import { HeartIcon, ChatBubbleIcon, ShareIcon, PaperAirplaneIcon, TrashIcon, PencilIcon, EllipsisHorizontalIcon, ExclamationTriangleIcon, PinIcon, LinkIcon } from './icons';
import { mockUsers, DEFAULT_AVATAR_URL } from '../constants';
import { supabase } from '../lib/supabaseClient';
import { useModal } from '../contexts/ModalContext';

interface PostCardProps {
    post: Post;
    currentUser: User;
    onLikeToggle: (postId: number) => void;
    onViewProfile?: (user: User) => void;
    onDeletePost?: (postId: number) => void;
    onEditPost?: (postId: number, newContent: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onLikeToggle, onViewProfile, onDeletePost, onEditPost }) => {
    const { author, content, imageUrl, likes, comments, timestamp, isLiked, isPinned } = post;

    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [commentsList, setCommentsList] = useState<Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    // Estados para edição e menu
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(content);
    const menuRef = useRef<HTMLDivElement>(null);

    // Verifica se o usuário atual é o autor do post
    const isAuthorOrAdmin = String(currentUser.id) === String(author.id);

    // Fechar menu ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Fetch comments when opened
    useEffect(() => {
        if (showComments) {
            fetchComments();
        }
    }, [showComments]);

    const fetchComments = async () => {
        setIsLoadingComments(true);
        try {
            const { data, error } = await supabase
                .from('comments')
                .select(`
    id,
    text,
    created_at,
    user: profiles(id, full_name, username, avatar_url)
            `)
                .eq('post_id', post.id)
                .order('created_at', { ascending: true });

            if (error) throw error;

            if (data) {
                const mappedComments: Comment[] = data.map((c: any) => ({
                    id: c.id,
                    post_id: post.id,
                    user_id: c.user.id,
                    text: c.text,
                    created_at: new Date(c.created_at).toLocaleString('pt-BR'),
                    user: {
                        id: c.user.id,
                        name: c.user.full_name || 'Usuário',
                        username: c.user.username || 'user',
                        avatarUrl: c.user.avatar_url || DEFAULT_AVATAR_URL,
                    } as User
                }));
                setCommentsList(mappedComments);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const { showAlert, showConfirm } = useModal();

    const handleShare = async () => {
        // Garante que a URL seja válida (http/https) para a API de compartilhamento
        let shareUrl = window.location.href;
        try {
            const urlObj = new URL(shareUrl);
            if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
                throw new Error('Protocolo inválido');
            }
        } catch (e) {
            shareUrl = `https://comunidade.evoapp.com/post/${post.id}`;
        }

        const shareData = {
            title: `Post de ${author.name} no EVOAPP`,
            text: content,
            url: shareUrl
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else if (navigator.share) {
                await navigator.share(shareData);
            } else {
                throw new Error('Web Share API não suportada');
            }
        } catch (err) {
            console.warn('Compartilhamento nativo falhou, usando clipboard:', err);
            try {
                await navigator.clipboard.writeText(shareUrl);
                await showAlert('Link Copiado!', 'Link copiado para a área de transferência!', { icon: <LinkIcon className="w-8 h-8 text-blue-500" /> });
            } catch (clipboardErr) {
                console.error('Falha ao copiar para o clipboard:', clipboardErr);
                // await showAlert('Erro', 'Não foi possível compartilhar ou copiar o link.');
            }
        }
    };

    const handleReport = async () => {
        const confirmed = await showConfirm(
            'Denunciar Publicação',
            'Deseja denunciar esta publicação por conteúdo impróprio ou violação das diretrizes?',
            { icon: <ExclamationTriangleIcon className="w-8 h-8 text-red-500" /> }
        );

        if (confirmed) {
            await showAlert('Denúncia Enviada', 'Denúncia enviada para a equipe de moderação. Obrigado por ajudar a manter a comunidade segura.', { type: 'success' });
            setShowMenu(false);
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim()) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { data, error } = await supabase
                .from('comments')
                .insert({
                    post_id: post.id,
                    user_id: user.id,
                    text: commentText
                })
                .select('*')
                .single();

            if (error) throw error;

            await fetchComments();
            setCommentText('');

        } catch (error) {
            console.error("Error adding comment:", error);
            await showAlert('Erro', 'Erro ao enviar comentário.');
        }
    };

    const handleEditSubmit = () => {
        if (editedContent.trim() && onEditPost) {
            onEditPost(post.id, editedContent);
            setIsEditing(false);
            setShowMenu(false);
        }
    };

    const ActionButton: React.FC<{ icon: React.ReactNode; label: string | number; onClick?: () => void; active?: boolean }> = ({ icon, label, onClick, active }) => (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 text-sm font-medium transition-colors duration-200 group ${active ? 'text-secondary' : 'text-gray-text dark:text-slate-400 hover:text-primary-dark'}`}
        >
            <div className={`p-2 rounded-full group-hover:bg-primary-light dark:group-hover:bg-primary/20 ${active ? 'text-secondary group-hover:text-secondary-dark' : ''}`}>
                {icon}
            </div>
            <span>{label}</span>
        </button>
    );

    return (
        <div className={`bg-surface-light dark:bg-surface-dark border ${isPinned ? 'border-evo-purple shadow-[0_0_10px_rgba(202,4,255,0.1)]' : 'border-slate-200/50 dark:border-slate-700/50'} rounded-2xl shadow-sm overflow-hidden relative group/card transition-all`}>
            <div className="p-5">
                {isPinned && (
                    <div className="flex items-center space-x-2 mb-3 text-evo-purple text-xs font-bold uppercase tracking-wider">
                        <PinIcon className="w-3 h-3" />
                        <span>Post Oficial Fixado</span>
                    </div>
                )}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                        <img
                            src={author.avatarUrl}
                            alt={author.name}
                            className="w-12 h-12 rounded-full mr-4 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onViewProfile && onViewProfile(author)}
                        />
                        <div>
                            <p
                                className="font-bold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-primary transition-colors flex items-center"
                                onClick={() => onViewProfile && onViewProfile(author)}
                            >
                                {author.name}
                                {isPinned && <span className="ml-2 text-[10px] bg-evo-purple text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Fixado</span>}
                            </p>
                            <p className="text-sm text-gray-text dark:text-slate-400">@{author.username} · {timestamp}</p>
                        </div>
                    </div>

                    {/* Menu de Ações (Apenas Autor/Admin) */}
                    {isAuthorOrAdmin && (
                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 text-gray-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <EllipsisHorizontalIcon className="w-6 h-6" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-10 overflow-hidden animate-fade-in-down">
                                    <button
                                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                        <span>Editar</span>
                                    </button>
                                    {onDeletePost && (
                                        <button
                                            onClick={() => { onDeletePost(post.id); setShowMenu(false); }}
                                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            <span>Excluir</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Conteúdo do Post (Visualização ou Edição) */}
                {isEditing ? (
                    <div className="mb-4">
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#121212] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-evo-purple focus:border-transparent resize-y min-h-[100px]"
                        />
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                onClick={() => { setIsEditing(false); setEditedContent(content); }}
                                className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleEditSubmit}
                                className="px-3 py-1.5 text-sm font-medium text-white bg-evo-purple hover:bg-primary-dark rounded-lg transition-colors shadow-sm"
                            >
                                Salvar
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap mb-4">{content}</p>
                )}
            </div>

            {imageUrl && (
                <img src={imageUrl} alt="Post content" className="w-full h-auto" />
            )}

            <div className="px-5 py-1 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center text-gray-text">
                <ActionButton
                    icon={<HeartIcon className="w-5 h-5" filled={isLiked} />}
                    label={likes}
                    onClick={() => onLikeToggle(post.id)}
                    active={isLiked}
                />
                <ActionButton
                    icon={<ChatBubbleIcon className="w-5 h-5" />}
                    label={commentsList.length > 0 ? commentsList.length : comments}
                    onClick={() => setShowComments(!showComments)}
                    active={showComments}
                />
                <ActionButton
                    icon={<ShareIcon className="w-5 h-5" />}
                    label="Compartilhar"
                    onClick={handleShare}
                />
            </div>

            {/* Seção de Comentários */}
            {showComments && (
                <div className="bg-slate-50 dark:bg-[#151515] border-t border-slate-200/50 dark:border-slate-700/50 p-4 animate-fade-in">
                    {/* Lista de Comentários */}
                    <div className="space-y-4 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {isLoadingComments && commentsList.length === 0 ? (
                            <div className="text-center py-4">
                                <svg className="animate-spin h-5 w-5 mx-auto text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        ) : (
                            <>
                                {commentsList.map(comment => (
                                    <div key={comment.id} className="flex space-x-3">
                                        <img
                                            src={comment.user?.avatarUrl}
                                            alt={comment.user?.name}
                                            className="w-8 h-8 rounded-full cursor-pointer"
                                            onClick={() => comment.user && onViewProfile && onViewProfile(comment.user)}
                                        />
                                        <div className="flex-1 bg-white dark:bg-surface-dark p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm">
                                            <div className="flex justify-between items-center mb-1">
                                                <span
                                                    className="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:underline"
                                                    onClick={() => comment.user && onViewProfile && onViewProfile(comment.user)}
                                                >
                                                    {comment.user?.name || 'Usuário'}
                                                </span>
                                                <span className="text-xs text-slate-500">{comment.timestamp || comment.created_at}</span>
                                            </div>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{comment.text}</p>
                                        </div>
                                    </div>
                                ))}
                                {commentsList.length === 0 && !isLoadingComments && (
                                    <p className="text-center text-sm text-slate-500 py-2">Seja o primeiro a comentar!</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* Input de Novo Comentário */}
                    <form onSubmit={handleAddComment} className="flex items-center space-x-2">
                        <img src={currentUser.avatarUrl} alt="Você" className="w-8 h-8 rounded-full" />
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Escreva um comentário..."
                                className="w-full pl-4 pr-10 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-dark text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-evo-purple focus:border-transparent transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!commentText.trim()}
                                className="absolute right-1.5 top-1.5 p-1.5 bg-evo-purple text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <PaperAirplaneIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;

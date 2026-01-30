import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, DiamondIcon, PlayCircleIcon, AcademicCapIcon, PencilIcon, UploadIcon, MicrophoneIcon, SparklesIcon, EyeIcon, EyeOffIcon } from '../icons';
import { useModal } from '../../contexts/ModalContext';
import { supabase } from '../../lib/supabaseClient';
import { PremiumContent } from '../../types';
import ImageCropper from './ImageCropper';

const AdminPremium: React.FC = () => {
    const [contents, setContents] = useState<PremiumContent[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { showConfirm, showAlert } = useModal();
    const [uploading, setUploading] = useState(false);

    // Cropper State
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [croppingType, setCroppingType] = useState<'thumbnail' | 'avatar'>('thumbnail');

    const [formData, setFormData] = useState<Partial<PremiumContent>>({
        title: '',
        author: '',
        role: '',
        type: 'Masterclass',
        duration: '',
        thumbnail: '',
        category: '',
        description: '',
        level: 'Iniciante',
        video_url: '',
        is_new: false,
        active: true,
        instructor_avatar: '',
        has_certificate: false
    });

    useEffect(() => {
        fetchContents();
    }, []);

    const fetchContents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('premium_content')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContents(data || []);
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'avatar') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCroppingImage(reader.result as string);
                setCroppingType(type);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
            // Clear input value to allow re-selecting same file if needed
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        setShowCropper(false);
        if (!croppedImageBlob) return;

        try {
            setUploading(true);
            const fileExt = 'jpg';
            const fileName = `${croppingType}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('premium-covers')
                .upload(fileName, croppedImageBlob, {
                    contentType: 'image/jpeg'
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('premium-covers').getPublicUrl(fileName);

            if (croppingType === 'avatar') {
                setFormData(prev => ({ ...prev, instructor_avatar: data.publicUrl }));
            } else {
                setFormData(prev => ({ ...prev, thumbnail: data.publicUrl }));
            }

            showAlert('Sucesso', 'Imagem cortada e carregada com sucesso!', { type: 'success' });
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('Erro', 'Erro ao fazer upload da imagem.', { type: 'danger' });
        } finally {
            setUploading(false);
            setCroppingImage(null);
        }
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        setCroppingImage(null);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.author || !formData.type) {
            return showAlert('Atenção', 'Preencha os campos obrigatórios.', { type: 'warning' });
        }

        try {
            const contentData = {
                ...formData,
                title: formData.title!,
                author: formData.author!,
                type: formData.type!,
                active: formData.active !== undefined ? formData.active : true
            };

            let error;
            if (editingId) {
                const { error: updateError } = await supabase
                    .from('premium_content')
                    .update(contentData)
                    .eq('id', editingId);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('premium_content')
                    .insert([contentData]);
                error = insertError;
            }

            if (error) throw error;

            showAlert('Sucesso', `Conteúdo ${editingId ? 'atualizado' : 'criado'} com sucesso!`, { type: 'success' });
            setIsAdding(false);
            setEditingId(null);
            setFormData({
                title: '',
                author: '',
                role: '',
                type: 'Masterclass',
                duration: '',
                thumbnail: '',
                category: '',
                description: '',
                level: 'Iniciante',
                video_url: '',
                is_new: false,
                active: true,
                instructor_avatar: '',
                has_certificate: false
            });
            fetchContents();
        } catch (error) {
            console.error('Error saving content:', error);
            showAlert('Erro', 'Erro ao salvar conteúdo.', { type: 'danger' });
        }
    };

    const handleEdit = (content: PremiumContent) => {
        setFormData({
            ...content,
            active: content.active ?? true
        });
        setEditingId(content.id);
        setIsAdding(true);
    };

    const toggleActive = async (content: PremiumContent) => {
        try {
            const newStatus = !content.active;
            const { error } = await supabase
                .from('premium_content')
                .update({ active: newStatus })
                .eq('id', content.id);

            if (error) throw error;

            // Optimistic update
            setContents(contents.map(c => c.id === content.id ? { ...c, active: newStatus } : c));
        } catch (error) {
            console.error('Error updating status:', error);
            showAlert('Erro', 'Erro ao atualizar status.', { type: 'danger' });
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Remover conteúdo?', 'Tem certeza que deseja remover este conteúdo?', { type: 'danger' });
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('premium_content')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                fetchContents();
                showAlert('Sucesso', 'Conteúdo removido.', { type: 'success' });
            } catch (error) {
                console.error('Error deleting content:', error);
                showAlert('Erro', 'Erro ao remover conteúdo.', { type: 'danger' });
            }
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Masterclass': return <PlayCircleIcon className="w-6 h-6" />;
            case 'Curso': return <AcademicCapIcon className="w-6 h-6" />;
            case 'Meditação': return <SparklesIcon className="w-6 h-6" />;
            case 'Audio': return <MicrophoneIcon className="w-6 h-6" />;
            default: return <DiamondIcon className="w-6 h-6" />;
        }
    };

    return (
        <div className="space-y-8 animate-fade-in mb-20 relative">
            {showCropper && croppingImage && (
                <ImageCropper
                    imageSrc={croppingImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCancelCrop}
                    aspect={croppingType === 'avatar' ? 1 : 16 / 9}
                />
            )}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">EVO+ Premium</h2>
                    <p className="text-slate-400 mt-2">Gerencie masterclasses, cursos e conteúdos exclusivos.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            title: '',
                            author: '',
                            role: '',
                            type: 'Masterclass',
                            duration: '',
                            thumbnail: '',
                            category: '',
                            description: '',
                            level: 'Iniciante',
                            video_url: '',
                            is_new: false,
                            active: true,
                            instructor_avatar: '',
                            has_certificate: false
                        });
                        setEditingId(null);
                        setIsAdding(true);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Novo Conteúdo</span>
                </button>
            </header>

            {isAdding && (
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 max-w-3xl">
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Conteúdo' : 'Novo Conteúdo'}</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Título do Conteúdo"
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                        />

                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Avatar Upload */}
                            <div className="shrink-0 group relative mx-auto md:mx-0">
                                <div className="w-24 h-24 rounded-full bg-[#121212] border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden hover:border-evo-orange/50 transition-colors cursor-pointer">
                                    {formData.instructor_avatar ? (
                                        <img src={formData.instructor_avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2">
                                            <UploadIcon className="w-6 h-6 text-slate-500 mx-auto" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => onFileChange(e, 'avatar')}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        title="Upload foto do instrutor (200x200)"
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500 text-center block mt-1">Foto 200px</span>
                            </div>

                            {/* Inputs */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    placeholder="Autor / Instrutor"
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none h-[50px]"
                                />
                                <input
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    placeholder="Cargo / Função"
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none h-[50px]"
                                />
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none h-[50px]"
                                >
                                    <option value="Masterclass">Masterclass</option>
                                    <option value="Curso">Curso</option>
                                    <option value="Meditação">Meditação</option>
                                    <option value="Audio">Audio</option>
                                    <option value="Mentoria">Mentoria</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                placeholder="Duração (ex: 45min)"
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                            />
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                placeholder="Categoria"
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                            />
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleInputChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                            >
                                <option value="Iniciante">Iniciante</option>
                                <option value="Intermediário">Intermediário</option>
                                <option value="Avançado">Avançado</option>
                            </select>
                        </div>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Descrição completa..."
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none min-h-[100px]"
                        />

                        <input
                            type="text"
                            name="video_url"
                            value={formData.video_url}
                            onChange={handleInputChange}
                            placeholder="URL do Vídeo (Youtube, Vimeo...)"
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                        />

                        <div className="flex items-center space-x-3 py-2">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_new"
                                    checked={formData.is_new}
                                    onChange={handleCheckboxChange}
                                    className="form-checkbox text-evo-purple rounded bg-white/10 border-white/10"
                                />
                                <span className="text-slate-300">Marcar como "Novo"</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleCheckboxChange}
                                    className="form-checkbox text-evo-purple rounded bg-white/10 border-white/10"
                                />
                                <span className="text-slate-300">Ativo</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="has_certificate"
                                    checked={formData.has_certificate}
                                    onChange={handleCheckboxChange}
                                    className="form-checkbox text-evo-purple rounded bg-white/10 border-white/10"
                                />
                                <span className="text-slate-300">Com Certificado</span>
                            </label>
                        </div>

                        <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center text-slate-400 cursor-pointer hover:border-evo-orange/50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onFileChange(e, 'thumbnail')}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {uploading ? (
                                <span>Enviando...</span>
                            ) : formData.thumbnail ? (
                                <div className="flex flex-col items-center">
                                    <img src={formData.thumbnail} alt="Preview" className="h-20 w-32 object-cover rounded mb-2" />
                                    <span className="text-xs text-green-500">Capa carregada!</span>
                                </div>
                            ) : (
                                <>
                                    <UploadIcon className="w-8 h-8 mx-auto mb-2" />
                                    <span>Upload da Capa (Thumbnail)</span>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400">Cancelar</button>
                            <button onClick={handleSubmit} className="px-6 py-2 rounded-xl bg-evo-orange text-white font-bold hover:bg-evo-orange/90 transition-colors">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center text-slate-500 py-10">
                    <div className="animate-spin w-8 h-8 border-4 border-evo-purple border-t-transparent rounded-full mx-auto mb-4"></div>
                    Carregando conteúdos...
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {contents.map((content) => (
                        <div key={content.id} className={`bg-[#1C1C1E] p-4 rounded-2xl border ${!content.active ? 'border-red-500/20 opacity-75' : 'border-white/10'} flex items-center justify-between group transition-all`}>
                            <div className="flex items-center space-x-4">
                                <div className="w-24 h-16 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 overflow-hidden relative shrink-0">
                                    {content.thumbnail ? (
                                        <img src={content.thumbnail} alt={content.title} className={`w-full h-full object-cover ${!content.active ? 'grayscale' : ''}`} />
                                    ) : (
                                        getTypeIcon(content.type)
                                    )}
                                    {!content.active && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <EyeOffIcon className="w-5 h-5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                        {content.title}
                                        {!content.active && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded">Oculto</span>}
                                    </h4>
                                    <p className="text-sm text-slate-400">{content.type} • {content.author} • {content.duration}</p>
                                    {content.is_new && (
                                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-evo-purple/20 text-evo-purple mt-1 inline-block">
                                            NOVO
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => toggleActive(content)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title={content.active ? "Ocultar" : "Exibir"}
                                >
                                    {content.active ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => handleEdit(content)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-evo-blue transition-colors"
                                    title="Editar"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(content.id)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Excluir"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {contents.length === 0 && (
                        <div className="text-center py-10 text-slate-500 bg-[#1C1C1E] rounded-2xl border border-white/5">
                            Nenhum conteúdo encontrado.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPremium;

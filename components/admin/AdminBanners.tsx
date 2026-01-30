
import React, { useState, useEffect } from 'react';
import { Banner } from '../../types';
import { bannerService } from '../../services/bannerService';
import { PlusIcon, TrashIcon, PencilIcon, UploadIcon, CheckCircleIcon, BanIcon, LoadingSpinner } from '../icons';
import { useModal } from '../../contexts/ModalContext';
import ImageCropper from './ImageCropper';

const AdminBanners: React.FC = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({});
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const { showConfirm } = useModal();

    useEffect(() => {
        loadBanners();
    }, []);

    const loadBanners = async () => {
        try {
            setLoading(true);
            const data = await bannerService.fetchBanners();
            setBanners(data);
        } catch (error) {
            console.error('Error loading banners:', error);
            // Could add toast notification here
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            let savedBanner: Banner;

            if (currentBanner.id) {
                // Update existing
                savedBanner = await bannerService.updateBanner(
                    currentBanner as Banner,
                    selectedImage || undefined
                );
                setBanners(banners.map(b => b.id === savedBanner.id ? savedBanner : b));
            } else {
                // Create new
                // Default active to true if not set
                const bannerToCreate = {
                    ...currentBanner,
                    active: currentBanner.active ?? true
                } as Banner;

                savedBanner = await bannerService.createBanner(
                    bannerToCreate,
                    selectedImage || undefined
                );
                setBanners([savedBanner, ...banners]);
            }

            setIsEditing(false);
            resetForm();
        } catch (error) {
            console.error('Error saving banner:', error);
            alert('Erro ao salvar banner. Verifique o console.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Remover Banner?', 'Tem certeza que deseja remover este banner?');
        if (confirmed) {
            try {
                // Optimistic update
                const previousBanners = [...banners];
                setBanners(banners.filter(b => b.id !== id));

                await bannerService.deleteBanner(id);
            } catch (error) {
                console.error('Error deleting banner:', error);
                // Revert on error (could be improved by fetching fresh data)
                loadBanners();
            }
        }
    };

    const handleEdit = (banner: Banner) => {
        setCurrentBanner({ ...banner });
        setPreviewUrl(banner.imageUrl);
        setSelectedImage(null);
        setIsEditing(true);
    };

    const handleToggleActive = async (banner: Banner) => {
        try {
            // Optimistic update
            const updatedBanners = banners.map(b =>
                b.id === banner.id ? { ...b, active: !b.active } : b
            );
            setBanners(updatedBanners);

            await bannerService.toggleBannerStatus(banner.id, !banner.active);
        } catch (error) {
            console.error('Error toggling banner:', error);
            loadBanners(); // Revert
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Read file for cropping
            const reader = new FileReader();
            reader.onload = (ev) => {
                setCroppingImage(ev.target?.result as string);
                setShowCropper(true);
                // Reset input so same file can be selected again if needed
                e.target.value = '';
            }
            reader.readAsDataURL(file);
        }
    }

    const handleCropComplete = (croppedBlob: Blob) => {
        // Convert blob to file
        const file = new File([croppedBlob], `banner-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(croppedBlob));
        setShowCropper(false);
        setCroppingImage(null);
    }

    const resetForm = () => {
        setCurrentBanner({});
        setSelectedImage(null);
        setPreviewUrl(null);
        setCroppingImage(null);
        setShowCropper(false);
    }

    if (loading && !isEditing && banners.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner className="w-8 h-8 text-evo-purple" />
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="space-y-6 animate-fade-in relative">
                {showCropper && croppingImage && (
                    <ImageCropper
                        imageSrc={croppingImage}
                        onCropComplete={handleCropComplete}
                        onCancel={() => { setShowCropper(false); setCroppingImage(null); }}
                        aspect={1200 / 400} // 3:1 aspect ratio
                    />
                )}

                <h2 className="text-3xl font-bold text-white">{currentBanner.id ? 'Editar Banner' : 'Novo Banner'}</h2>
                <form onSubmit={handleSave} className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 space-y-6 max-w-2xl">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
                        <input
                            type="text"
                            value={currentBanner.title || ''}
                            onChange={e => setCurrentBanner({ ...currentBanner, title: e.target.value })}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Descrição Curta</label>
                        <input
                            type="text"
                            value={currentBanner.description || ''}
                            onChange={e => setCurrentBanner({ ...currentBanner, description: e.target.value })}
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Imagem</label>
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-evo-purple/50 transition-colors cursor-pointer relative">
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                            ) : (
                                <div className="text-slate-400 flex flex-col items-center">
                                    <UploadIcon className="w-8 h-8 mb-2" />
                                    <span>Clique para fazer upload</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => { setIsEditing(false); resetForm(); }}
                            className="px-6 py-2 rounded-xl text-slate-300 hover:bg-white/5"
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center"
                            disabled={saving}
                        >
                            {saving ? <LoadingSpinner className="w-5 h-5 mr-2" /> : null}
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Banners</h2>
                    <p className="text-slate-400 mt-2">Gerencie os destaques da página principal.</p>
                </div>
                <button onClick={() => { resetForm(); setIsEditing(true); }} className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    <span>Novo Banner</span>
                </button>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {banners.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-[#1C1C1E] rounded-2xl border border-white/10">
                        Nenhum banner encontrado. Crie o primeiro!
                    </div>
                ) : (
                    banners.map(banner => (
                        <div key={banner.id} className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <img src={banner.imageUrl} alt={banner.title} className="w-full sm:w-48 h-32 object-cover rounded-xl" />
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                                <p className="text-slate-400 text-sm mt-1">{banner.description}</p>
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-3 ${banner.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {banner.active ? 'Publicado' : 'Inativo'}
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleToggleActive(banner)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white" title={banner.active ? 'Ocultar' : 'Publicar'}>
                                    {banner.active ? <BanIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                                </button>
                                <button onClick={() => handleEdit(banner)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-evo-blue">
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(banner.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-500">
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

export default AdminBanners;
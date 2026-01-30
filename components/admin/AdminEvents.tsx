
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Event } from '../../types';
import { PlusIcon, TrashIcon, CalendarIcon, PencilIcon, BanIcon, CheckCircleIcon } from '../icons';
import { useModal } from '../../contexts/ModalContext';
import { resizeImage, readFile } from '../../utils/imageUtils';
import ImageCropperModal from '../ImageCropperModal';

const AdminEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newEvent, setNewEvent] = useState<Partial<Event>>({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Image Cropper State
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showConfirm } = useModal();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('sort_date', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Remover Evento?', 'Tem certeza que deseja remover permanentemente este evento?');
        if (confirmed) {
            try {
                const { error } = await supabase
                    .from('events')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                // Update local state
                setEvents(events.filter(e => e.id !== id));
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Erro ao excluir evento');
            }
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setUploadedImageSrc(imageDataUrl);
            setCropModalOpen(true);
            e.target.value = ''; // Reset input
        }
    };

    const handleEdit = (event: Event) => {
        setEditingId(event.id);
        setNewEvent({
            title: event.title,
            description: event.description,
            display_date: event.display_date,
            display_time: event.display_time,
            location: event.location,
            category: event.category,
            image_url: event.image_url,
            link: event.link,
            sort_date: event.sort_date,
            archived: event.archived
        });
        setShowForm(true);
    };

    const handlePause = async (event: Event) => {
        try {
            const updatedStatus = !event.archived;
            const { error } = await supabase
                .from('events')
                .update({ archived: updatedStatus })
                .eq('id', event.id);

            if (error) throw error;

            setEvents(events.map(e =>
                e.id === event.id ? { ...e, archived: updatedStatus } : e
            ));
        } catch (error) {
            console.error('Error updating event status:', error);
            alert('Erro ao atualizar status do evento');
        }
    };

    const handleCropSave = async (croppedBlob: Blob) => {
        setCropModalOpen(false);
        setUploadingImage(true);

        try {
            // We use 'profiles' bucket as it is known to exist. Storing in 'events' folder.
            const fileName = `events/${Date.now()}.jpg`;

            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(fileName, croppedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(fileName);

            setNewEvent(prev => ({ ...prev, image_url: publicUrl }));
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Erro ao fazer upload da imagem: ${error.message || 'Verifique o console'}`);
        } finally {
            setUploadingImage(false);
            setUploadedImageSrc(null);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        try {
            // Basic validation
            if (!newEvent.title || !newEvent.display_date || !newEvent.category) {
                alert('Preencha os campos obrigatórios');
                return;
            }

            // Create sort_date from display_date (assuming standard format or user input)
            // For now we will rely on a simple timestamp or current date if parsing fails, 
            // but ideally we should have a separate date picker for sorting.
            // Let's try to parse the date input if it is in YYYY-MM-DD
            let sortDate = newEvent.sort_date || new Date().toISOString();

            // Should add a hidden or explicit input for actual sort date in the future.
            // For now, let's use current time as default sort date if not specified.

            const eventData = {
                title: newEvent.title,
                description: newEvent.description,
                display_date: newEvent.display_date,
                display_time: newEvent.display_time,
                location: newEvent.location,
                category: newEvent.category,
                image_url: newEvent.image_url || 'https://picsum.photos/800/400',
                link: newEvent.link,
                sort_date: sortDate,
                archived: newEvent.archived || false
            };

            let data, error;

            if (editingId) {
                // Update existing event
                const response = await supabase
                    .from('events')
                    .update(eventData)
                    .eq('id', editingId)
                    .select()
                    .single();
                data = response.data;
                error = response.error;
            } else {
                // Create new event
                const response = await supabase
                    .from('events')
                    .insert([eventData])
                    .select()
                    .single();
                data = response.data;
                error = response.error;
            }

            if (error) throw error;

            if (data) {
                if (editingId) {
                    setEvents(events.map(e => e.id === editingId ? data : e));
                } else {
                    setEvents([...events, data]);
                }
                setShowForm(false);
                setNewEvent({});
                setEditingId(null);
            }
        } catch (error) {
            console.error('Error saving event:', error);
            alert('Erro ao salvar evento');
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">Eventos</h2>
                    <p className="text-slate-400 mt-2">Crie e gerencie a agenda da comunidade.</p>
                </div>
                {!showForm && (
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setNewEvent({});
                            setShowForm(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Novo Evento</span>
                    </button>
                )}
            </header>

            {showForm && (
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 animate-fade-in max-w-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Evento' : 'Novo Evento'}</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Título</label>
                            <input
                                type="text"
                                value={newEvent.title || ''}
                                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                            <textarea
                                value={newEvent.description || ''}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                rows={3}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Data de Exibição (ex: 15 Mar)</label>
                                <input
                                    type="text"
                                    placeholder="DD MMM, AAAA"
                                    value={newEvent.display_date || ''}
                                    onChange={e => setNewEvent({ ...newEvent, display_date: e.target.value })}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Horário (ex: 14h - 18h)</label>
                                <input
                                    type="text"
                                    placeholder="00:00 - 00:00"
                                    value={newEvent.display_time || ''}
                                    onChange={e => setNewEvent({ ...newEvent, display_time: e.target.value })}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Local</label>
                            <input
                                type="text"
                                value={newEvent.location || ''}
                                onChange={e => setNewEvent({ ...newEvent, location: e.target.value })}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Imagem (Recomendado 800x400)</label>

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
                                    <span className="text-xs text-slate-400">ou cole a URL abaixo</span>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    accept="image/*"
                                />

                                {uploadingImage && <div className="text-sm text-evo-purple animate-pulse">Enviando imagem...</div>}

                                <input
                                    type="text"
                                    placeholder="URL da imagem (https://...)"
                                    value={newEvent.image_url || ''}
                                    onChange={e => setNewEvent({ ...newEvent, image_url: e.target.value })}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                />

                                {newEvent.image_url && (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-white/10">
                                        <img src={newEvent.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Categoria</label>
                            <input
                                type="text"
                                value={newEvent.category || ''}
                                onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Link Externo</label>
                            <input
                                type="text"
                                value={newEvent.link || ''}
                                onChange={e => setNewEvent({ ...newEvent, link: e.target.value })}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 rounded-xl text-slate-300 hover:bg-white/5">Cancelar</button>
                            <button
                                type="submit"
                                disabled={submitLoading || uploadingImage}
                                className="px-6 py-2 rounded-xl bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                            >
                                {submitLoading ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Criar Evento')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {!showForm && (
                <div className="grid grid-cols-1 gap-6">
                    {loading ? (
                        <div className="text-center py-8 text-slate-400">Carregando eventos...</div>
                    ) : events.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-[#1C1C1E] rounded-2xl border border-white/10">
                            Nenhum evento encontrado. Crie o primeiro!
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="bg-[#1C1C1E] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                                {event.image_url ? (
                                    <img src={event.image_url} alt={event.title} className="w-full sm:w-48 h-32 object-cover rounded-xl" />
                                ) : (
                                    <div className="w-full sm:w-48 h-32 bg-white/5 rounded-xl flex items-center justify-center text-slate-500">
                                        <CalendarIcon className="w-8 h-8" />
                                    </div>
                                )}

                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white">{event.title}</h3>
                                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400 mt-2">
                                        <span>{event.display_date}</span>
                                        <span>•</span>
                                        <span>{event.display_time}</span>
                                        <span>•</span>
                                        <span>{event.location}</span>
                                    </div>
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-3 ${!event.archived ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {!event.archived ? 'Publicado' : 'Pausado'}
                                    </div>
                                    {event.category && (
                                        <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-white/5 text-xs text-slate-300">
                                            {event.category}
                                        </span>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePause(event)}
                                        title={event.archived ? "Publicar Evento" : "Pausar Evento"}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                                    >
                                        {event.archived ? <CheckCircleIcon className="w-5 h-5" /> : <BanIcon className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-evo-blue"
                                        title="Editar"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(event.id)}
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
                    aspectRatio={2} // 800x400 = 2:1
                    title="Ajustar Imagem do Evento"
                />
            )}
        </div>
    );
};

export default AdminEvents;

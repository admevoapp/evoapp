
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { User } from '../types';
import { UserIcon, WarningIcon, CheckIcon, XMarkIcon, TrashIcon, ShieldCheckIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { useModal } from '../contexts/ModalContext';
import ImageCropperModal from './ImageCropperModal';
import UpdatePasswordModal from './UpdatePasswordModal';
import { readFile, resizeImage } from '../utils/imageUtils';

interface SettingsPageProps {
    user: User;
    onUpdateUser: (updatedUser: User) => void;
}

// Standardized Input Styles
const baseInputStyles = "block w-full rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-200 placeholder-gray-400 focus:border-[#A171FF] focus:outline-none focus:ring-4 focus:ring-[#A171FF]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

// Helper components for form elements
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="space-y-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 first-of-type:border-t-0 first-of-type:pt-0">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <div className="space-y-4">{children}</div>
    </section>
);

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; gridClass?: string; icon?: React.ReactNode; rightIcon?: React.ReactNode }> =
    ({ label, name, value, onChange, type = 'text', gridClass = 'col-span-12 sm:col-span-6', icon, rightIcon }) => (
        <div className={gridClass}>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{label}</label>
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A171FF]">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    id={name}
                    value={value || ''}
                    onChange={onChange}
                    className={`${baseInputStyles} h-[48px] ${icon ? 'pl-10' : 'px-4'} ${rightIcon ? 'pr-10' : ''}`}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {rightIcon}
                    </div>
                )}
            </div>
        </div>
    );

const TextareaField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; rows?: number; maxLength?: number }> =
    ({ label, name, value, onChange, rows = 3, maxLength }) => (
        <div className="col-span-12">
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{label}</label>
            <textarea
                name={name}
                id={name}
                rows={rows}
                value={value || ''}
                onChange={onChange}
                maxLength={maxLength}
                className={`${baseInputStyles} p-4 resize-y`}
            ></textarea>
            {maxLength && <p className="text-right text-xs text-gray-text dark:text-slate-400 mt-1 mr-1">{value?.length || 0}/{maxLength}</p>}
        </div>
    );

const SelectField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; placeholder?: string; gridClass?: string }> =
    ({ label, name, value, onChange, options, placeholder = "Selecione uma opção", gridClass = "col-span-12" }) => (
        <div className={gridClass}>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">{label}</label>
            <div className="relative">
                <select
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className={`${baseInputStyles} h-[48px] px-4 appearance-none cursor-pointer`}
                >
                    <option value="" className="bg-white dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-200">{placeholder}</option>
                    {options.map(option => (
                        <option key={option} value={option} className="bg-white dark:bg-[#0D0D0D] text-slate-700 dark:text-slate-200">
                            {option}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500 dark:text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </div>
    );

const CheckboxField: React.FC<{ label: string; name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> =
    ({ label, name, checked, onChange }) => (
        <div className="flex items-center">
            <div className="relative flex items-center">
                <input
                    id={name}
                    name={name}
                    type="checkbox"
                    checked={checked || false}
                    onChange={onChange}
                    className="appearance-none h-5 w-5 border-[1.5px] border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-[#0D0D0D] checked:bg-[#A171FF] checked:border-[#A171FF] focus:outline-none focus:ring-2 focus:ring-[#A171FF]/20 transition-all duration-200 cursor-pointer"
                />
                <svg className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white pointer-events-none transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <label htmlFor={name} className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">{label}</label>
        </div>
    );

const StatusModal: React.FC<{
    isOpen: boolean;
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}> = ({ isOpen, type, message, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === 'success' ? 'bg-evo-purple/10 text-evo-purple' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                    {type === 'success' ? (
                        <CheckIcon className="w-8 h-8" />
                    ) : (
                        <WarningIcon className="w-8 h-8" />
                    )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    {type === 'success' ? 'Sucesso!' : 'Ocorreu um erro'}
                </h3>

                <p className="text-slate-600 dark:text-slate-300 mb-6 font-medium">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className={`px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg shadow-current/20 hover:-translate-y-0.5 transition-all w-full ${type === 'success' ? 'bg-gradient-to-r from-evo-purple to-evo-orange shadow-evo-purple/20' : 'bg-red-600 hover:bg-red-700'}`}
                >
                    {type === 'success' ? 'Continuar' : 'Tentar Novamente'}
                </button>
            </div>
        </div>
    );
};

// The actual settings page component
const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateUser }) => {
    const [formData, setFormData] = useState<User>(user);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Username Verification State
    const [originalUsername, setOriginalUsername] = useState<string>('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

    // Debounce check for username
    useEffect(() => {
        const checkUsername = async () => {
            const usernameToCheck = formData.username?.trim();

            if (!usernameToCheck || usernameToCheck === originalUsername) {
                setUsernameStatus('idle');
                return;
            }

            if (usernameToCheck.length < 3) {
                setUsernameStatus('unavailable'); // Basic length validation
                return;
            }

            setUsernameStatus('checking');

            try {
                // The query logic here is slightly reversed: we want to know if it EXISTS
                // If data is returned, it unavailable. If error is "PGRST116" (no rows), it is available.
                // .maybeSingle() is better than .single() to avoid error on no rows
                const { data, error } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('username', usernameToCheck)
                    .maybeSingle();

                if (data) {
                    setUsernameStatus('unavailable');
                } else {
                    setUsernameStatus('available');
                }
            } catch (error) {
                console.error('Error checking username:', error);
                setUsernameStatus('idle'); // Fallback
            }
        };

        const timeoutId = setTimeout(() => {
            if (formData.username && formData.username !== originalUsername) {
                checkUsername();
            } else {
                setUsernameStatus('idle');
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [formData.username, originalUsername]);

    // Image Upload State
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
    const [cropTarget, setCropTarget] = useState<'avatar' | 'cover' | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'cover') => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setUploadedImageSrc(imageDataUrl);
            setCropTarget(target);
            setCropModalOpen(true);
            // Reset input so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handleCropSave = async (croppedBlob: Blob) => {
        if (!cropTarget) return;

        setCropModalOpen(false);
        setSaving(true); // Show loading state while uploading

        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error("Usuário não autenticado");

            const fileName = `${authUser.id}/${cropTarget}_${Date.now()}.jpg`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(fileName, croppedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(fileName);

            // Update form data state
            setFormData(prev => ({
                ...prev,
                [cropTarget === 'avatar' ? 'avatarUrl' : 'coverUrl']: publicUrl
            }));

            setMessage({ type: 'success', text: 'Imagem enviada com sucesso! Clique em Salvar para persistir seu perfil.' });

        } catch (error: any) {
            console.error('Error uploading image:', error);
            setMessage({ type: 'error', text: `Erro: ${(error as any).message || 'Falha no upload'}` });
        } finally {
            setSaving(false);
            setUploadedImageSrc(null);
            setCropTarget(null);
        }
    };

    // Gallery Upload State
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        // Reset input
        e.target.value = '';

        if ((formData.gallery?.length || 0) >= 3) {
            setMessage({ type: 'error', text: 'Você só pode adicionar até 3 fotos na galeria.' });
            return;
        }

        setSaving(true);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error("Usuário não autenticado");

            // Resize image
            const resizedBlob = await resizeImage(file, 800, 800);

            const fileName = `${authUser.id}/gallery/${Date.now()}.jpg`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(fileName, resizedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(fileName);

            // Update state
            setFormData(prev => ({
                ...prev,
                gallery: [...(prev.gallery || []), publicUrl]
            }));

            setMessage({ type: 'success', text: 'Foto adicionada à galeria!' });

        } catch (error: any) {
            console.error('Error uploading gallery image:', error);
            setMessage({ type: 'error', text: `Erro: ${(error as any).message || 'Falha no upload'}` });
        } finally {
            setSaving(false);
        }
    };

    const { showConfirm } = useModal();

    const handleRemoveGalleryImage = async (indexToRemove: number) => {
        const confirmed = await showConfirm(
            'Excluir Foto',
            'Tem certeza que deseja excluir esta foto da sua galeria?',
            { icon: <TrashIcon className="w-8 h-8 text-red-500" /> }
        );

        if (confirmed) {
            setFormData(prev => ({
                ...prev,
                gallery: prev.gallery?.filter((_, index) => index !== indexToRemove)
            }));
        }
    };


    // Fetch profile data from Supabase
    useEffect(() => {
        const fetchProfile = async () => {
            // Get current auth user to be sure
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                // If no profile found, we use the default 'user' prop info
                setLoading(false);
                return;
            }

            if (data) {
                // Merge Supabase profile data into our User state
                setFormData(prev => ({
                    ...prev,
                    name: data.full_name || prev.name,
                    username: data.username || '',
                    avatarUrl: data.avatar_url || prev.avatarUrl,
                    coverUrl: data.cover_url || prev.coverUrl,
                    birthDate: data.birth_date,
                    maritalStatus: data.marital_status,
                    profession: data.profession,
                    bio: data.bio,
                    mission: data.mission,
                    classYear: data.class_year,
                    helpArea: data.help_area,
                    behavioralProfile: data.behavioral_profile,
                    location: data.location || {},
                    socials: data.socials || {},
                    evoStatus: data.evo_status || {},
                    gallery: data.gallery || []
                }));
                // Set original username strictly from data
                if (data.username) setOriginalUsername(data.username);
            }
            setLoading(false);
        };

        fetchProfile();
    }, []);

    const [firstName, ...lastNameParts] = formData.name.split(' ');
    const lastName = lastNameParts.join(' ');

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'firstName') {
            setFormData(prev => ({ ...prev, name: `${value} ${lastName}`.trim() }));
        } else { // lastName
            setFormData(prev => ({ ...prev, name: `${firstName} ${value}`.trim() }));
        }
    };

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleNestedChange = useCallback((section: 'location' | 'socials', e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: value
            }
        }));
    }, []);

    const handleCheckboxChange = useCallback((section: 'evoStatus', e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [name]: checked
            }
        }));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error("Usuário não autenticado");

            const updates = {
                id: authUser.id,
                full_name: formData.name,
                username: formData.username,
                avatar_url: formData.avatarUrl,
                cover_url: formData.coverUrl,
                birth_date: formData.birthDate || null,
                marital_status: formData.maritalStatus,
                profession: formData.profession,
                bio: formData.bio,
                mission: formData.mission,
                class_year: formData.classYear,
                help_area: formData.helpArea,
                behavioral_profile: formData.behavioralProfile,
                location: formData.location,
                socials: formData.socials,
                evo_status: formData.evoStatus,
                gallery: formData.gallery,
                updated_at: new Date().toISOString(),
            };

            const { error } = await supabase.from('profiles').upsert(updates);

            if (error) throw error;

            onUpdateUser(formData);
            setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Erro ao salvar perfil: ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const behavioralProfileOptions = [
        '🔵 Analítico', '🔴 Dominante', '🟢 Estável', '🟡 Influente', '🔵🔴 Analítico + Dominante', '🔵🟢 Analítico + Estável', '🔵🟡 Analítico + Influente', '🔴🟢 Dominante + Estável', '🔴🟡 Dominante + Influente', '🔴🔵 Dominante + Analítico', '🟢🟡 Estável + Influente', '🟢🔴 Estável + Dominante', '🟢🔵 Estável + Analítico', '🟡🟢 Influente + Estável', '🟡🔴 Influente + Dominante', '🟡🔵 Influente + Analítico', '🔵🔴🟢 Analítico + Dominante + Estável', '🔵🔴🟡 Analítico + Dominante + Influente', '🔵🟢🔴 Analítico + Estável + Dominante', '🔵🟢🟡 Analítico + Estável + Influente', '🔵🟡🔴 Analítico + Influente + Dominante', '🔵🟡🟢 Analítico + Influente + Estável', '🔴🔵🟢 Dominante + Analítico + Estável', '🔴🔵🟡 Dominante + Analítico + Influente', '🔴🟢🔵 Dominante + Estável + Analítico', '🔴🟢🟡 Dominante + Estável + Influente', '🔴🟡🔵 Dominante + Influente + Analítico', '🔴🟡🟢 Dominante + Influente + Estável', '🟢🔵🔴 Estável + Analítico + Dominante', '🟢🔵🟡 Estável + Analítico + Influente', '🟢🔴🔵 Estável + Dominante + Analítico', '🟢🔴🟡 Estável + Dominante + Influente', '🟢🟡🔵 Estável + Influente + Analítico', '🟢🟡🔴 Estável + Influente + Dominante', '🟡🔵🔴 Influente + Analítico + Dominante', '🟡🔵🟢 Influente + Analítico + Estável', '🟡🔴🔵 Influente + Dominante + Analítico', '🟡🔴🟢 Influente + Dominante + Estável', '🟡🟢🔵 Influente + Estável + Analítico', '🟡🟢🔴 Influente + Estável + Dominante',
    ];

    const maritalStatusOptions = [
        'Solteiro(a)',
        'Casado(a)',
        'Separado(a)',
        'Divorciado(a)',
        'Viúvo(a)',
        'União Estável'
    ];

    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <main className="p-6 md:p-8 space-y-8">
                {/* Updated Header with Icon */}
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-xl text-primary-dark dark:text-evo-purple">
                        <UserIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Editar Perfil</h2>
                        <p className="text-gray-text dark:text-slate-400">Gerencie suas informações pessoais e preferências.</p>
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="space-y-8">
                        {/* Status Message */}
                        {/* Inline status message removed in favor of StatusModal */}

                        <FormSection title="Imagens do Perfil">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                <div className="md:col-span-4 flex flex-col items-center">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 w-full text-left ml-1">Foto de Perfil</label>
                                    <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                        {formData.avatarUrl ? (
                                            <img src={formData.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-700 group-hover:opacity-90 transition-opacity" />
                                        ) : (
                                            <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-700 group-hover:bg-slate-300 dark:group-hover:bg-slate-600 transition-colors">
                                                <UserIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-black/50 rounded-full p-2 text-white">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={avatarInputRef}
                                        onChange={(e) => handleFileSelect(e, 'avatar')}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="mt-3 text-sm font-medium text-[#A171FF] hover:text-[#8b5cf6] transition-colors"
                                    >
                                        Alterar foto
                                    </button>
                                </div>

                                <div className="md:col-span-8">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 ml-1">Foto de Capa</label>
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden group cursor-pointer bg-slate-100 dark:bg-slate-800 border border-gray-300 dark:border-gray-700" onClick={() => coverInputRef.current?.click()}>
                                        {formData.coverUrl && (
                                            <img src={formData.coverUrl} alt="Capa" className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                                        )}
                                        <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${formData.coverUrl ? 'bg-black/30' : ''}`}>
                                            <button type="button" className="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/50 text-white dark:text-gray-200 rounded-full hover:bg-white/30 transition-colors font-medium text-sm flex items-center shadow-sm">
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                Alterar Capa
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={coverInputRef}
                                        onChange={(e) => handleFileSelect(e, 'cover')}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </FormSection>

                        <FormSection title="Informações Básicas">
                            <div className="grid grid-cols-12 gap-6">
                                <InputField label="Nome" name="firstName" value={firstName} onChange={handleNameChange} />
                                <InputField label="Sobrenome" name="lastName" value={lastName} onChange={handleNameChange} />
                                <InputField
                                    label="Nome de Usuário"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    gridClass="col-span-12"
                                    rightIcon={
                                        usernameStatus === 'checking' ? <div className="animate-spin h-5 w-5 border-2 border-slate-300 border-t-evo-purple rounded-full" /> :
                                            usernameStatus === 'available' ? <CheckIcon className="w-6 h-6 text-green-500" /> :
                                                usernameStatus === 'unavailable' ? <XMarkIcon className="w-6 h-6 text-red-500" /> :
                                                    null
                                    }
                                />
                                <InputField label="Data de Nascimento" name="birthDate" value={formData.birthDate || ''} onChange={handleInputChange} type="date" gridClass="col-span-12 sm:col-span-6" />
                                <SelectField
                                    label="Estado Civil"
                                    name="maritalStatus"
                                    value={formData.maritalStatus || ''}
                                    onChange={handleInputChange}
                                    options={maritalStatusOptions}
                                    gridClass="col-span-12 sm:col-span-6"
                                    placeholder="Selecione"
                                />
                                <InputField label="Profissão" name="profession" value={formData.profession || ''} onChange={handleInputChange} gridClass="col-span-12" />
                                <TextareaField label="Bio" name="bio" value={formData.bio || ''} onChange={handleInputChange} maxLength={200} />
                            </div>
                        </FormSection>

                        <FormSection title="Minha Missão">
                            <TextareaField label="Missão" name="mission" value={formData.mission || ''} onChange={handleInputChange} rows={5} />
                        </FormSection>

                        <FormSection title="Informações Evo">
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12">
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Status Evo</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-white dark:bg-[#0D0D0D] p-4 rounded-xl border-[1.5px] border-gray-300 dark:border-gray-700">
                                        <CheckboxField label="Pelopes" name="pelopes" checked={formData.evoStatus?.pelopes || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Academy" name="academy" checked={formData.evoStatus?.academy || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Family" name="family" checked={formData.evoStatus?.family || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Leader" name="leader" checked={formData.evoStatus?.leader || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Team Engineering" name="teamEngineering" checked={formData.evoStatus?.teamEngineering || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Missions" name="missions" checked={formData.evoStatus?.missions || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Missions Leader" name="missionsLeader" checked={formData.evoStatus?.missionsLeader || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Legacy" name="legacy" checked={formData.evoStatus?.legacy || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Eagles" name="eagles" checked={formData.evoStatus?.eagles || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Trainer" name="trainer" checked={formData.evoStatus?.trainer || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Head Trainer" name="headTrainer" checked={formData.evoStatus?.headTrainer || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Partners" name="partners" checked={formData.evoStatus?.partners || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                        <CheckboxField label="Domínios" name="dominios" checked={formData.evoStatus?.dominios || false} onChange={(e) => handleCheckboxChange('evoStatus', e)} />
                                    </div>
                                </div>
                                <InputField label="Turma" name="classYear" value={formData.classYear || ''} onChange={handleInputChange} gridClass="col-span-12 sm:col-span-6" />
                                <InputField label="Área que pode ajudar" name="helpArea" value={formData.helpArea || ''} onChange={handleInputChange} gridClass="col-span-12" />
                            </div>
                        </FormSection>

                        <FormSection title="Perfil Comportamental">
                            <SelectField
                                label="Tipo"
                                name="behavioralProfile"
                                value={formData.behavioralProfile || ''}
                                onChange={handleInputChange}
                                options={behavioralProfileOptions}
                                placeholder="Selecione um perfil"
                            />
                        </FormSection>

                        <FormSection title="Localização">
                            <div className="grid grid-cols-12 gap-6">
                                <InputField label="Endereço Completo" name="fullAddress" value={formData.location?.fullAddress || ''} onChange={(e) => handleNestedChange('location', e)} gridClass="col-span-12" />
                                <InputField label="Bairro" name="neighborhood" value={formData.location?.neighborhood || ''} onChange={(e) => handleNestedChange('location', e)} />
                                <InputField label="CEP" name="zipCode" value={formData.location?.zipCode || ''} onChange={(e) => handleNestedChange('location', e)} />
                                <InputField label="Cidade" name="city" value={formData.location?.city || ''} onChange={(e) => handleNestedChange('location', e)} />
                                <InputField label="Estado" name="state" value={formData.location?.state || ''} onChange={(e) => handleNestedChange('location', e)} />
                                <InputField label="País" name="country" value={formData.location?.country || ''} onChange={(e) => handleNestedChange('location', e)} />
                            </div>
                        </FormSection>

                        <FormSection title="Contato/Rede Sociais">
                            <div className="grid grid-cols-12 gap-6">
                                <InputField label="Instagram" name="instagram" value={formData.socials?.instagram || ''} onChange={(e) => handleNestedChange('socials', e)} gridClass="col-span-12 sm:col-span-4" />
                                <InputField label="WhatsApp" name="whatsapp" value={formData.socials?.whatsapp || ''} onChange={(e) => handleNestedChange('socials', e)} gridClass="col-span-12 sm:col-span-4" />
                                <InputField label="Linkedin" name="linkedin" value={formData.socials?.linkedin || ''} onChange={(e) => handleNestedChange('socials', e)} gridClass="col-span-12 sm:col-span-4" />
                            </div>
                        </FormSection>

                        <FormSection title="Galeria de Fotos">
                            <p className="text-sm text-gray-text dark:text-slate-400 mb-3 ml-1">Adicione até 3 fotos</p>
                            <input
                                type="file"
                                ref={galleryInputRef}
                                onChange={handleGalleryUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="grid grid-cols-3 gap-4">
                                {[0, 1, 2].map(index => {
                                    const hasImage = formData.gallery && formData.gallery[index];
                                    return (
                                        <div
                                            key={index}
                                            className={`relative w-full aspect-square bg-white dark:bg-[#0D0D0D] rounded-xl flex items-center justify-center border-[1.5px] border-dashed border-gray-300 dark:border-gray-700 transition-colors ${!hasImage ? 'hover:border-[#A171FF] cursor-pointer' : ''}`}
                                            onClick={() => !hasImage && galleryInputRef.current?.click()}
                                        >
                                            {hasImage ? (
                                                <div className="relative w-full h-full group">
                                                    <img src={formData.gallery![index]} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveGalleryImage(index);
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full transition-opacity hover:bg-red-600 shadow-md"
                                                        title="Remover foto"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <button type="button" className="text-gray-text dark:text-slate-400 text-center pointer-events-none">
                                                    <svg className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                    <span className="mt-2 block text-xs font-medium">Upload (URL)</span>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </FormSection>

                        <FormSection title="Segurança">
                            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center">
                                        <ShieldCheckIcon className="w-5 h-5 mr-2 text-evo-purple" />
                                        Senha e Autenticação
                                    </h4>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Mantenha sua conta segura atualizando sua senha periodicamente.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(true)}
                                    className="px-5 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-semibold rounded-xl shadow-sm hover:shadow-md hover:border-evo-purple dark:hover:border-evo-purple transition-all"
                                >
                                    Alterar Senha
                                </button>
                            </div>
                        </FormSection>

                        <FormSection title="Zona de Perigo">
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl p-6">
                                <h4 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">Excluir Conta</h4>
                                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">
                                    Ao excluir sua conta, todos os seus dados (perfil, posts, conexões) serão permanentemente removidos. Esta ação não pode ser desfeita.
                                </p>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        const confirmed = await showConfirm(
                                            'Excluir Minha Conta',
                                            'Tem certeza ABSOLUTA? Esta ação é irreversível e apagará todos os seus dados.',
                                            {
                                                type: 'danger',
                                                confirmLabel: 'SIM, EXCLUIR TUDO',
                                                icon: <TrashIcon className="w-8 h-8 text-red-600" />
                                            }
                                        );

                                        if (confirmed) {
                                            setSaving(true);
                                            try {
                                                const { data: { user: authUser } } = await supabase.auth.getUser();
                                                if (!authUser) return;

                                                // 1. Attempt RPC (Preferred)
                                                // Note: Ensure the RPC 'delete_user_account' allows self-deletion (updated script)
                                                const { error: rpcError } = await supabase.rpc('delete_user_account', {
                                                    target_user_id: authUser.id
                                                });

                                                if (rpcError) {
                                                    console.warn('RPC deletion failed:', rpcError);
                                                    if (rpcError.code !== '42883') { // 42883 = undefined_function
                                                        throw new Error(`Erro: ${rpcError.message}`);
                                                    }

                                                    // Fallback for self-deletion usually requires admin rights or strict RLS on 'delete'
                                                    // Standard users usually CANNOT delete their own auth user without RPC.
                                                    // We try profile delete as a cleanup signal if RPC is missing.
                                                    const { error: profileError } = await supabase.from('profiles').delete().eq('id', authUser.id);
                                                    if (profileError) throw profileError;
                                                }

                                                // Logout and redirect
                                                await supabase.auth.signOut();
                                                window.location.href = '/login'; // Force reload/redirect

                                            } catch (error: any) {
                                                console.error('Error deleting account:', error);
                                                setMessage({ type: 'error', text: 'Erro ao excluir conta: ' + (error.message || 'Contate o suporte.') });
                                                setSaving(false);
                                            }
                                        }
                                    }}
                                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center shadow-lg shadow-red-600/20"
                                >
                                    <TrashIcon className="w-5 h-5 mr-2" />
                                    Excluir Conta Permanentemente
                                </button>
                            </div>
                        </FormSection>
                    </div>

                    <div className="mt-8 pt-5 border-t border-slate-200/50 dark:border-slate-700/50 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 bg-gradient-to-r from-evo-purple to-evo-orange text-white font-semibold rounded-xl shadow-md3-3 hover:shadow-md3-6 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Salvando...
                                </>
                            ) : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
                {/* Image Cropper Modal */}
            </main>

            {/* Image Cropper Modal */}
            {
                cropModalOpen && uploadedImageSrc && (
                    <ImageCropperModal
                        isOpen={cropModalOpen}
                        imageSrc={uploadedImageSrc}
                        onClose={() => { setCropModalOpen(false); setUploadedImageSrc(null); }}
                        onSave={handleCropSave}
                        cropShape={cropTarget === 'avatar' ? 'round' : 'rect'}
                        aspectRatio={cropTarget === 'avatar' ? 1 : 3} // 1:1 for avatar, 3:1 for cover (1200x400)
                        title={cropTarget === 'avatar' ? 'Editar Foto de Perfil' : 'Editar Foto de Capa'}
                    />
                )
            }

            {/* Update Password Modal */}
            <UpdatePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />

            {/* Status Modal */}
            <StatusModal
                isOpen={!!message}
                type={message?.type || 'success'}
                message={message?.text || ''}
                onClose={() => setMessage(null)}
            />
        </div >
    );
};

export default SettingsPage;

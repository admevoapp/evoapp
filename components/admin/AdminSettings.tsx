import React, { useState } from 'react';
import { SystemSettings } from '../../types';
import {
    UploadIcon, CogIcon, PhotoIcon, HomeIcon, LinkIcon,
    PhoneIcon, CheckCircleIcon, DocumentTextIcon, GlobeIcon
} from '../icons';
import { useModal } from '../../contexts/ModalContext';

const AdminSettings: React.FC = () => {
    const { showAlert } = useModal();
    const [activeTab, setActiveTab] = useState<'general' | 'visual' | 'landing' | 'contact' | 'legal'>('general');
    const [isSaving, setIsSaving] = useState(false);

    const [settings, setSettings] = useState<SystemSettings>({
        // General
        siteName: 'EVO App',
        siteDescription: 'Plataforma de conexão e evolução.',
        maintenanceMode: false,

        // Visual
        logoUrl: '',
        primaryColor: '#00f8f5',
        secondaryColor: '#ca04ff',

        // Landing
        landingTitle: 'Comunidade evoapp',
        landingSubtitle: 'A plataforma que conecta Amantes Radicais de Pessoas em todo o Brasil e no mundo.',
        footerPhrase: 'Onde o amor encontra propósito e a evolução se torna estilo de vida.',

        // Contact
        supportEmail: 'suporte@evoapp.com',
        whatsapp: '5511999999999',

        // Socials
        socials: {
            instagram: 'https://instagram.com/evoapp',
            facebook: '',
            twitter: '',
            linkedin: '',
            youtube: ''
        },

        // Legal
        termsUrl: '/terms',
        privacyUrl: '/privacy'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else {
            setSettings({ ...settings, [name]: value });
        }
    };

    const handleToggle = (name: keyof SystemSettings) => {
        setSettings(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        await showAlert('Sucesso', 'Configurações salvas com sucesso!', {
            icon: <CheckCircleIcon className="w-10 h-10 text-green-500" />
        });
    };

    const tabs = [
        { id: 'general', label: 'Geral', icon: CogIcon },
        { id: 'visual', label: 'Visual', icon: PhotoIcon },
        { id: 'landing', label: 'Landing Page', icon: HomeIcon },
        { id: 'contact', label: 'Contato & Social', icon: PhoneIcon },
        { id: 'legal', label: 'Legal (LGPD)', icon: DocumentTextIcon },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nome da Plataforma</label>
                            <input
                                type="text"
                                name="siteName"
                                value={settings.siteName}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Descrição SEO</label>
                            <textarea
                                name="siteDescription"
                                rows={3}
                                value={settings.siteDescription}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            />
                            <p className="text-xs text-slate-500 mt-2">Usado par meta-tags e resultados de busca (Google).</p>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#121212] rounded-xl border border-white/10">
                            <div>
                                <h4 className="text-white font-medium">Modo Manutenção</h4>
                                <p className="text-sm text-slate-500">Bloqueia o acesso público temporariamente.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('maintenanceMode')}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-evo-purple' : 'bg-slate-700'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                );
            case 'visual':
                return (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Logo da Plataforma</label>
                            <div className="flex items-center space-x-4">
                                <div className="w-24 h-24 bg-[#121212] rounded-xl flex items-center justify-center border border-white/10 relative group overflow-hidden">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <span className="text-xs text-slate-500">Sem Logo</span>
                                    )}
                                </div>
                                <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-white flex items-center space-x-2 transition-colors border border-white/5">
                                    <UploadIcon className="w-5 h-5" />
                                    <span>Fazer Upload</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Cor Primária</label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        name="primaryColor"
                                        value={settings.primaryColor}
                                        onChange={handleChange}
                                        className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent"
                                    />
                                    <span className="text-slate-400 font-mono">{settings.primaryColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Cor Secundária</label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        name="secondaryColor"
                                        value={settings.secondaryColor}
                                        onChange={handleChange}
                                        className="w-10 h-10 rounded-lg border-none cursor-pointer bg-transparent"
                                    />
                                    <span className="text-slate-400 font-mono">{settings.secondaryColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'landing':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Título Principal (Hero)</label>
                            <input
                                type="text"
                                name="landingTitle"
                                value={settings.landingTitle}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Subtítulo</label>
                            <textarea
                                name="landingSubtitle"
                                rows={3}
                                value={settings.landingSubtitle}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            />
                        </div>
                        <div className="pt-4 border-t border-white/10">
                            <label className="block text-sm font-medium text-slate-300 mb-2">Frase do Rodapé</label>
                            <input
                                type="text"
                                name="footerPhrase"
                                value={settings.footerPhrase}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            />
                        </div>
                    </div>
                );
            case 'contact':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">E-mail de Suporte</label>
                                <input
                                    type="email"
                                    name="supportEmail"
                                    value={settings.supportEmail}
                                    onChange={handleChange}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">WhatsApp Business</label>
                                <input
                                    type="text"
                                    name="whatsapp"
                                    value={settings.whatsapp}
                                    onChange={handleChange}
                                    placeholder="5511999999999"
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <h4 className="text-white font-medium mb-4">Redes Sociais</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 flex justify-center text-slate-400"><i className="fab fa-instagram text-xl"></i></div>
                                    <input
                                        type="text"
                                        name="socials.instagram"
                                        value={settings.socials.instagram}
                                        onChange={handleChange}
                                        placeholder="Instagram URL"
                                        className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-evo-purple"
                                    />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 flex justify-center text-slate-400"><i className="fab fa-youtube text-xl"></i></div>
                                    <input
                                        type="text"
                                        name="socials.youtube"
                                        value={settings.socials.youtube}
                                        onChange={handleChange}
                                        placeholder="YouTube Channel URL"
                                        className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-evo-purple"
                                    />
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 flex justify-center text-slate-400"><i className="fab fa-linkedin text-xl"></i></div>
                                    <input
                                        type="text"
                                        name="socials.linkedin"
                                        value={settings.socials.linkedin}
                                        onChange={handleChange}
                                        placeholder="LinkedIn URL"
                                        className="flex-1 bg-[#121212] border border-white/10 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-evo-purple"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'legal':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start space-x-3">
                            <DocumentTextIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
                            <div>
                                <h4 className="text-blue-400 font-bold text-sm">Documentação Legal</h4>
                                <p className="text-xs text-slate-400 mt-1">Insira os links para as páginas de termos de uso e política de privacidade. O sistema irá gerar os links no rodapé automaticamente.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Termos de Uso (URL)</label>
                            <input
                                type="text"
                                name="termsUrl"
                                value={settings.termsUrl}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Política de Privacidade (URL)</label>
                            <input
                                type="text"
                                name="privacyUrl"
                                value={settings.privacyUrl}
                                onChange={handleChange}
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-evo-purple transition-colors"
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Configurações do Sistema</h2>
                    <p className="text-slate-400 mt-2">Personalize a identidade, textos e integrações da plataforma.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-evo-blue via-evo-purple to-evo-pink text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm disabled:opacity-50"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
                        ${activeTab === tab.id
                                    ? 'bg-[#ca04ff] text-white shadow-lg shadow-[#ca04ff]/20'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 bg-[#1C1C1E] rounded-2xl border border-white/10 p-6 md:p-8 min-h-[500px]">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                        {tabs.find(t => t.id === activeTab)?.label}
                    </h3>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
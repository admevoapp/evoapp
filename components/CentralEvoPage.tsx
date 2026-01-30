
import React, { useState, useEffect } from 'react';
import {
    MegaphoneIcon,
    DocumentTextIcon,
    CalendarIcon,
    FolderIcon,
    MicrophoneIcon,
    LocationMarkerIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    PlayCircleIcon,
    DownloadIcon,
    XMarkIcon,
    ExclamationCircleIcon
} from './icons';
import { supabase } from '../lib/supabaseClient';

interface CentralItem {
    id: number;
    title: string;
    description?: string;
    category: 'Aviso' | 'Comunicado' | 'Agenda' | 'Material' | 'Mensagem' | 'Encontro';
    type?: 'video' | 'audio' | 'pdf' | 'text' | 'zip';
    url?: string;
    content?: string;
    date_display?: string;
    file_size?: string;
    created_at: string;
}

const CentralEvoPage: React.FC = () => {
    const [currentView, setCurrentView] = useState<'home' | 'notices' | 'communications' | 'agenda' | 'materials' | 'messages' | 'meetings'>('home');
    const [selectedItem, setSelectedItem] = useState<CentralItem | null>(null);
    const [items, setItems] = useState<CentralItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [lastViewedMap, setLastViewedMap] = useState<Record<string, string>>({});

    // Helper to filter items by category map
    // Mapped from View ID to Database Category
    const categoryMap: Record<string, string> = {
        'notices': 'Aviso',
        'communications': 'Comunicado',
        'agenda': 'Agenda',
        'materials': 'Material',
        'messages': 'Mensagem',
        'meetings': 'Encontro'
    };

    // Reverse map for easy lookup
    const viewMap: Record<string, string> = Object.entries(categoryMap).reduce((acc, [k, v]) => ({ ...acc, [v]: k }), {});

    const fetchItems = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('central_items')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching central items:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
        // Load timestamps
        const loadedMap: Record<string, string> = {};
        Object.keys(categoryMap).forEach(key => {
            const date = localStorage.getItem(`evo_last_viewed_${key}`);
            if (date) loadedMap[key] = date;
        });
        setLastViewedMap(loadedMap);
    }, []);

    const handleSectionClick = (viewId: string) => {
        const now = new Date().toISOString();
        localStorage.setItem(`evo_last_viewed_${viewId}`, now);
        setLastViewedMap(prev => ({ ...prev, [viewId]: now }));
        setCurrentView(viewId as any);
    };

    // Compute counts dynamically (unread only)
    const getCount = (cat: string) => {
        const viewId = viewMap[cat];
        const lastViewed = lastViewedMap[viewId];

        // If never viewed, show total count. If viewed, show only new items.
        if (!lastViewed) return items.filter(i => i.category === cat).length;

        return items.filter(i => i.category === cat && new Date(i.created_at) > new Date(lastViewed)).length;
    };

    const cards = [
        { id: 'notices', title: 'Avisos Oficiais', icon: <MegaphoneIcon className="w-8 h-8 text-white" />, color: 'bg-evo-blue', count: getCount('Aviso'), description: 'Alertas importantes da administração.' },
        { id: 'communications', title: 'Comunicados EVO', icon: <DocumentTextIcon className="w-8 h-8 text-white" />, color: 'bg-evo-purple', count: getCount('Comunicado'), description: 'Novidades e atualizações sobre a comunidade.' },
        { id: 'agenda', title: 'Agenda EVO', icon: <CalendarIcon className="w-8 h-8 text-white" />, color: 'bg-evo-orange', count: getCount('Agenda'), description: 'Calendário oficial de eventos e imersões.' },
        { id: 'materials', title: 'Materiais', icon: <FolderIcon className="w-8 h-8 text-white" />, color: 'bg-green-500', count: getCount('Material'), description: 'Arquivos, PDFs e documentos de apoio.' },
        { id: 'messages', title: 'Mensagens do Márcio', icon: <MicrophoneIcon className="w-8 h-8 text-white" />, color: 'bg-pink-500', count: getCount('Mensagem'), description: 'Áudios e vídeos exclusivos do nosso mentor.' },
        { id: 'meetings', title: 'Encontros Presenciais', icon: <LocationMarkerIcon className="w-8 h-8 text-white" />, color: 'bg-yellow-500', count: getCount('Encontro'), description: 'Saiba onde a família EVO vai se reunir.' },
    ];

    const getFilteredItems = (view: string) => {
        const cat = categoryMap[view];
        return items.filter(i => i.category === cat);
    };

    const currentItems = currentView !== 'home' ? getFilteredItems(currentView) : [];

    const renderHeader = (title: string, description: string, icon: React.ReactNode, colorClass: string) => (
        <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-6 animate-fade-in">
            <div className="flex items-center space-x-4 mb-2">
                <button onClick={() => setCurrentView('home')} className="mr-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeftIcon className="w-5 h-5 text-slate-500" />
                </button>
                <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20 text-${colorClass.replace('bg-', '')}`}>
                    {icon}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
                    <p className="text-gray-text dark:text-slate-400 text-sm md:text-base">{description}</p>
                </div>
            </div>
        </div>
    );

    const renderList = (items: CentralItem[], emptyMessage: string) => (
        <div className="space-y-4 animate-fade-in">
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-evo-purple mx-auto"></div>
                </div>
            ) : items.length > 0 ? (
                items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="w-full text-left bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:border-evo-purple/50 hover:bg-slate-50 dark:hover:bg-[#1E1E1E] transition-all flex items-start justify-between group"
                    >
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1 group-hover:text-evo-purple transition-colors">{item.title}</h3>
                            {item.description && <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{item.description}</p>}
                            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                <span>{item.date_display || new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                                {item.file_size && (
                                    <>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span>{item.type?.toUpperCase()} • {item.file_size}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-evo-purple group-hover:bg-evo-purple/10 transition-colors">
                            {(item.type === 'pdf' || item.type === 'zip') ? <DownloadIcon className="w-6 h-6" /> :
                                item.type === 'video' ? <PlayCircleIcon className="w-6 h-6" /> :
                                    item.type === 'audio' ? <MicrophoneIcon className="w-6 h-6" /> :
                                        <CheckCircleIcon className="w-6 h-6" />}
                        </div>
                    </button>
                ))
            ) : (
                <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    <p className="text-slate-500">{emptyMessage}</p>
                </div>
            )}
        </div>
    );

    const renderHome = () => (
        <>
            <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-8">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-xl text-primary-dark dark:text-evo-purple">
                        <MegaphoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Central EVO</h1>
                        <p className="text-gray-text dark:text-slate-400">Toda a comunicação oficial da comunidade em um só lugar.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <button
                        key={card.id}
                        onClick={() => handleSectionClick(card.id)}
                        className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group text-left h-full flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${card.color} group-hover:scale-110 transition-transform`}>
                                {card.icon}
                            </div>
                            {card.count > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                    {card.count}
                                </span>
                            )}
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-grow">{card.description}</p>

                        <div className="text-xs font-semibold text-primary group-hover:underline mt-auto">
                            Acessar &rarr;
                        </div>
                    </button>
                ))}
            </div>
        </>
    );

    return (
        <div className="w-full space-y-8 animate-fade-in pb-12">
            {currentView === 'home' && renderHome()}

            {currentView === 'notices' && (
                <>
                    {renderHeader('Avisos Oficiais', 'Fique por dentro das últimas notificações do sistema.', <MegaphoneIcon className="w-6 h-6 text-evo-blue" />, 'bg-evo-blue')}
                    {renderList(currentItems, 'Nenhum aviso no momento.')}
                </>
            )}

            {currentView === 'communications' && (
                <>
                    {renderHeader('Comunicados EVO', 'Notícias e atualizações da nossa comunidade.', <DocumentTextIcon className="w-6 h-6 text-evo-purple" />, 'bg-evo-purple')}
                    {renderList(currentItems, 'Nenhum comunicado recente.')}
                </>
            )}

            {currentView === 'agenda' && (
                <>
                    {renderHeader('Agenda EVO', 'Próximos eventos e datas importantes.', <CalendarIcon className="w-6 h-6 text-evo-orange" />, 'bg-evo-orange')}
                    {renderList(currentItems, 'Agenda vazia por enquanto.')}
                </>
            )}

            {currentView === 'materials' && (
                <>
                    {renderHeader('Materiais', 'Documentos e arquivos para download.', <FolderIcon className="w-6 h-6 text-green-500" />, 'bg-green-500')}
                    {renderList(currentItems, 'Nenhum material disponível.')}
                </>
            )}

            {currentView === 'messages' && (
                <>
                    {renderHeader('Mensagens do Márcio', 'Palavras de sabedoria e direção.', <MicrophoneIcon className="w-6 h-6 text-pink-500" />, 'bg-pink-500')}
                    {renderList(currentItems, 'Nenhuma mensagem disponível.')}
                </>
            )}

            {currentView === 'meetings' && (
                <>
                    {renderHeader('Encontros Presenciais', 'Saiba onde encontrar a família EVO.', <LocationMarkerIcon className="w-6 h-6 text-yellow-500" />, 'bg-yellow-500')}
                    {renderList(currentItems, 'Nenhum encontro agendado próximo a você.')}
                </>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight pr-4">
                                    {selectedItem.title}
                                </h3>
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                                {selectedItem.content || selectedItem.description}
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-4">


                                {selectedItem.url && (selectedItem.type === 'pdf' || selectedItem.type === 'zip') && (
                                    <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-500 font-bold rounded-lg hover:bg-green-500/20 transition-colors">
                                        <DownloadIcon className="w-4 h-4" />
                                        <span>Baixar {selectedItem.type === 'pdf' ? 'PDF' : 'Arquivo'}</span>
                                    </a>
                                )}

                                {selectedItem.url && selectedItem.type === 'video' && (
                                    <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 px-4 py-2 bg-evo-purple/10 text-evo-purple font-bold rounded-lg hover:bg-evo-purple/20 transition-colors">
                                        <PlayCircleIcon className="w-4 h-4" />
                                        <span>Reproduzir Vídeo</span>
                                    </a>
                                )}

                                {selectedItem.url && selectedItem.type === 'audio' && (
                                    <div className="w-full">
                                        <audio controls className="w-full h-10 rounded-lg outline-none">
                                            <source src={selectedItem.url} type="audio/mpeg" />
                                            <source src={selectedItem.url} type="audio/ogg" />
                                            Seu navegador não suporta o elemento de áudio.
                                        </audio>
                                    </div>
                                )}

                                {selectedItem.type === 'text' && (
                                    <button
                                        onClick={() => setSelectedItem(null)}
                                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        Fechar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CentralEvoPage;

import React, { useState, useEffect } from 'react';
import { LibraryItem } from '../types';
import { supabase } from '../lib/supabaseClient';
import { DocumentTextIcon, PhotoIcon, VideoCameraIcon, LinkIcon, SearchIcon, ChevronRightIcon } from './icons';

const LibraryPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');
    const [items, setItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>(['Todas']);

    useEffect(() => {
        // Animation Style
        const styleId = 'page-fade-in-animation';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
        @keyframes fadeInPage {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-page {
          animation: fadeInPage 0.5s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `;
            document.head.appendChild(style);
        }

        // Fetch Items
        const fetchItems = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('library_items')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    setItems(data);
                    // Extract unique categories from data
                    const uniqueCategories = ['Todas', ...Array.from(new Set(data.map((item: LibraryItem) => item.category)))];
                    setCategories(uniqueCategories);
                }

            } catch (error) {
                console.error('Error fetching library items:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <DocumentTextIcon className="w-6 h-6 text-red-500" />;
            case 'image': return <PhotoIcon className="w-6 h-6 text-blue-500" />;
            case 'video': return <VideoCameraIcon className="w-6 h-6 text-purple-500" />;
            default: return <LinkIcon className="w-6 h-6 text-green-500" />;
        }
    };

    const getActionLabel = (type: string) => {
        switch (type) {
            case 'pdf': return 'Baixar';
            case 'image': return 'Visualizar';
            case 'video': return 'Assistir';
            default: return 'Acessar';
        }
    };

    return (
        <div className="w-full animate-fade-in-page pb-12 bg-gray-50 dark:bg-[#121212] min-h-screen">

            {/* Header (Loose/No Card) */}
            <div className="pt-12 pb-10 px-4">
                <div className="max-w-4xl mx-auto text-center">

                    {/* Badge */}
                    <div className="inline-flex items-center px-4 py-1.5 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-slate-200 dark:border-white/10 shadow-sm">
                        <DocumentTextIcon className="w-3.5 h-3.5 mr-2" />
                        <span>Base de Conhecimento</span>
                    </div>

                    {/* Title & Description */}
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                        Biblioteca <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">EVOAPP</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg mb-10">
                        Explore nosso acervo de documentos, mídias e materiais educativos.
                    </p>

                    {/* Controls Row: Search + Filter Dropdown */}
                    <div className="flex flex-col md:flex-row gap-4 items-center max-w-3xl mx-auto">

                        {/* Search Bar */}
                        <div className="relative flex-grow w-full">
                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Pesquisar por título..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-full bg-white dark:bg-black/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-evo-purple/10 focus:border-evo-purple transition-all shadow-sm placeholder:text-slate-400"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div className="w-full md:w-48 flex-shrink-0">
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full appearance-none pl-4 pr-10 py-4 rounded-full bg-white dark:bg-black/20 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-4 focus:ring-evo-purple/10 focus:border-evo-purple transition-all shadow-sm cursor-pointer font-medium"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="max-w-5xl mx-auto px-4 mt-8">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-evo-purple"></div>
                        <p className="text-slate-400 text-sm">Carregando biblioteca...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 pb-2">
                            <span>Arquivo</span>
                            <span className="hidden md:block pr-60">Categoria & Tipo</span>
                            <span className="md:hidden">Ação</span>
                        </div>
                        {filteredItems.map(item => (
                            <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/5 rounded-xl p-4 flex items-center gap-4 hover:border-evo-purple/50 dark:hover:border-evo-purple/50 hover:shadow-md transition-all duration-200"
                            >
                                {/* Icon Box */}
                                <div className="w-12 h-12 flex-shrink-0 bg-slate-50 dark:bg-white/5 rounded-lg flex items-center justify-center border border-slate-100 dark:border-white/5 group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
                                    {getIcon(item.type)}
                                </div>

                                {/* Main Info */}
                                <div className="flex-grow min-w-0">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate pr-4 group-hover:text-evo-purple transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="flex items-center text-sm text-slate-500 space-x-3 mt-0.5">
                                        <span className="md:hidden inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400">
                                            {item.type}
                                        </span>
                                        <span className="truncate">{item.category}</span>
                                    </div>
                                </div>

                                {/* Meta Info (Desktop) */}
                                <div className="hidden md:flex flex-col items-end w-48 flex-shrink-0 text-right px-4 border-l border-slate-100 dark:border-white/5">
                                    <div className="px-2 py-1 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 mb-1">
                                        {item.type}
                                    </div>
                                    <span className="text-xs text-slate-400">Atualizado recentemente</span>
                                </div>

                                {/* Action Arrow */}
                                <div className="pl-2">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 group-hover:text-evo-purple group-hover:bg-evo-purple/10 transition-all">
                                        <ChevronRightIcon className="w-5 h-5" />
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-12 text-center border border-slate-200 dark:border-white/5">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SearchIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhum resultado</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                            Não encontramos arquivos para "{searchTerm}" em "{selectedCategory}".
                        </p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('Todas'); }}
                            className="mt-6 px-4 py-2 text-sm font-medium text-evo-purple hover:text-evo-purple-dark transition-colors"
                        >
                            Limpar todos os filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LibraryPage;
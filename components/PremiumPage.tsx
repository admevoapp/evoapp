import React, { useState, useEffect } from 'react';
import { DiamondIcon, PlayCircleIcon, AcademicCapIcon, SparklesIcon, TrophyIcon, StarIcon, CheckCircleIcon, PresentationChartLineIcon, BookOpenIcon, MicrophoneIcon, TagIcon, ArrowLeftIcon, SearchIcon, FilterIcon, LockClosedIcon, ClockIcon, UserCircleIcon, ShareIcon } from './icons';
import { useModal } from '../contexts/ModalContext';
import { supabase } from '../lib/supabaseClient';
import { PremiumContent, Product } from '../types';
import { useCart } from '../contexts/CartContext';

const PremiumPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [view, setView] = useState<'landing' | 'catalog'>('landing');
  const [selectedContent, setSelectedContent] = useState<PremiumContent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [contents, setContents] = useState<PremiumContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useModal();
  const { addToCart, toggleCart } = useCart();

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('premium_content')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContents(data || []);
    } catch (error) {
      console.error('Error fetching premium content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = (planType: 'monthly' | 'annual') => {
    // Definir os produtos dos planos
    const monthlyPlan: Product = {
      id: 'plan-monthly',
      name: 'Plano EVO+ Mensal',
      price: 49.90,
      category: 'Assinatura',
      description: 'Acesso completo mensal ao EVO+'
    };

    const annualPlan: Product = {
      id: 'plan-annual',
      name: 'Plano EVO+ Anual',
      price: 497.00,
      category: 'Assinatura',
      description: 'Acesso completo anual ao EVO+ com 20% de desconto'
    };

    const productToAdd = planType === 'monthly' ? monthlyPlan : annualPlan;

    addToCart(productToAdd);
    // Open cart drawer implies success essentially, but standard addToCart shows alert too. We can keep it or depend on addToCart's behavior.
    toggleCart();
  };

  const handleContentClick = (item: PremiumContent) => {
    setSelectedContent(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToCatalog = () => {
    setSelectedContent(null);
  };

  const categories = ['Todos', ...Array.from(new Set(contents.map(c => c.category)))];

  const filteredContent = contents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Logic to get featured content (3 items of different types)
  const getFeaturedContent = () => {
    const uniqueTypes = Array.from(new Set(contents.map(item => item.type)));
    const featured = [];

    // Try to pick one from each type first
    for (const type of uniqueTypes) {
      if (featured.length >= 3) break;
      const item = contents.find(c => c.type === type);
      if (item) featured.push(item);
    }

    // If not enough distinct types, fill with remaining items
    if (featured.length < 3) {
      const remainingIds = new Set(featured.map(f => f.id));
      for (const item of contents) {
        if (featured.length >= 3) break;
        if (!remainingIds.has(item.id)) {
          featured.push(item);
          remainingIds.add(item.id);
        }
      }
    }

    return featured;
  };

  const featuredContent = getFeaturedContent();

  const features = [
    {
      icon: <PlayCircleIcon className="w-8 h-8 text-evo-purple" />,
      title: "Masterclasses Exclusivas",
      description: "Acesso a aulas profundas com Márcio Micheli e convidados especiais sobre inteligência emocional e liderança."
    },
    {
      icon: <PresentationChartLineIcon className="w-8 h-8 text-evo-blue" />,
      title: "Mentorias EVO",
      description: "Sessões de direcionamento estratégico com mentores experientes para acelerar seus resultados."
    },
    {
      icon: <BookOpenIcon className="w-8 h-8 text-yellow-500" />,
      title: "Mini Cursos EVO+",
      description: "Conteúdos práticos e diretos ao ponto para desenvolver novas habilidades em tempo recorde."
    },
    {
      icon: <AcademicCapIcon className="w-8 h-8 text-evo-orange" />,
      title: "Certificados EVO",
      description: "Conclua trilhas de conhecimento e receba certificados exclusivos para validar sua jornada."
    },
    {
      icon: <MicrophoneIcon className="w-8 h-8 text-pink-500" />,
      title: "EVO Talk",
      description: "Conversas profundas e diálogos transformadores sobre vida, carreira e propósito com convidados inspiradores."
    },
    {
      icon: <TagIcon className="w-8 h-8 text-green-500" />,
      title: "Descontos EVO",
      description: "Ofertas especiais em produtos, eventos e parceiros selecionados da nossa comunidade."
    }
  ];

  // Visualização de Detalhes do Conteúdo
  if (selectedContent) {
    return (
      <div className="w-full animate-fade-in pb-12">
        <button
          onClick={handleBackToCatalog}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-evo-purple mb-6 transition-colors font-medium group"
        >
          <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para o Catálogo</span>
        </button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Content Info */}
          {/* Video Player Placeholder */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl group border border-slate-800">
            <img src={selectedContent.thumbnail} alt={selectedContent.title} className="w-full h-full object-cover opacity-40 blur-sm transition-opacity" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/40">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-full mb-4 shadow-xl border border-white/10 animate-pulse">
                <LockClosedIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Conteúdo Exclusivo EVO+</h3>
              <p className="text-slate-300 max-w-md mb-6">Esta aula faz parte do acervo premium. Assine para desbloquear acesso ilimitado a todo o conteúdo.</p>

              <button
                onClick={() => {
                  setSelectedContent(null);
                  setView('landing');
                  setTimeout(() => {
                    document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="px-8 py-3 bg-gradient-to-r from-evo-purple to-evo-blue text-white font-bold rounded-xl shadow-lg hover:shadow-evo-purple/50 transform hover:scale-105 transition-all flex items-center space-x-2"
              >
                <DiamondIcon className="w-5 h-5" />
                <span>Assinar para Liberar</span>
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-evo-purple/10 text-evo-purple px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-evo-purple/20">
                {selectedContent.category}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                {selectedContent.type}
              </span>
              {selectedContent.level && (
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-slate-200 dark:border-slate-700">
                  Nível {selectedContent.level}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
              {selectedContent.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
              {selectedContent.description}
            </p>
          </div>

          {/* Instructor Info */}
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-400 overflow-hidden">
              {selectedContent.instructor_avatar ? (
                <img src={selectedContent.instructor_avatar} alt={selectedContent.author} className="w-full h-full object-cover" />
              ) : (
                selectedContent.author.charAt(0)
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold">Instrutor</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedContent.author}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedContent.role || 'Especialista EVO'}</p>
            </div>
          </div>

          {/* Actions & Meta - Moved below Instructor */}
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <button className="w-full py-4 bg-gradient-to-r from-evo-purple to-evo-blue text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2 mb-4">
              <PlayCircleIcon className="w-6 h-6" />
              <span>Começar Agora</span>
            </button>

            <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center space-x-2 mb-6">
              <ShareIcon className="w-5 h-5" />
              <span>Compartilhar</span>
            </button>

            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="text-slate-500 dark:text-slate-400 flex items-center"><ClockIcon className="w-4 h-4 mr-2" /> Duração</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedContent.duration}</span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="text-slate-500 dark:text-slate-400 flex items-center"><AcademicCapIcon className="w-4 h-4 mr-2" /> Certificado</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedContent.has_certificate ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400 flex items-center"><UserCircleIcon className="w-4 h-4 mr-2" /> Acesso</span>
                <span className="font-semibold text-evo-orange">Membros EVO+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Visualização do Catálogo (Grid)
  if (view === 'catalog') {
    return (
      <div className="w-full animate-fade-in pb-12">
        {/* Header Catálogo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <button
              onClick={() => setView('landing')}
              className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-evo-purple mb-4 transition-colors font-medium group"
            >
              <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar para Visão Geral</span>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center">
              <DiamondIcon className="w-8 h-8 text-evo-purple mr-3" />
              Catálogo EVO+
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Explore todo o acervo de conteúdo transformador.</p>
          </div>

          <div className="w-full md:w-80 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aulas, autores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-evo-purple transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 pb-6 mb-2">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                ? 'bg-evo-purple text-white shadow-md'
                : 'bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-10 h-10 border-4 border-evo-purple border-t-transparent rounded-full"></div>
          </div>
        ) : filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <div
                key={item.id}
                onClick={() => handleContentClick(item)}
                className="group cursor-pointer bg-surface-light dark:bg-surface-dark rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 hover:border-evo-purple/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="relative aspect-video bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-90 dark:opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
                      <PlayCircleIcon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 flex gap-2">
                    {item.is_new && <span className="bg-evo-blue text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm">NOVO</span>}
                    <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase">{item.type}</span>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-bold text-white flex items-center">
                    {item.duration}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-evo-purple">{item.category}</span>
                    <LockClosedIcon className="w-3 h-3 text-slate-400 group-hover:text-evo-purple transition-colors" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug mb-1 group-hover:text-evo-purple transition-colors line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.author}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <SearchIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum conteúdo encontrado</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Tente buscar por outro termo ou categoria.</p>
          </div>
        )}
      </div>
    );
  }

  // Landing View (Padrão)
  return (
    <div className="w-full space-y-16 animate-fade-in pb-24">

      {/* Hero Section */}
      {/* Hero Section (EVO Store Style) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-8 md:p-12 min-h-[400px] flex flex-col justify-center group">

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-gradient-to-br from-evo-purple/10 to-evo-orange/10 rounded-full blur-3xl pointer-events-none animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 bg-gradient-to-tr from-evo-blue/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000"></div>

        {/* Hero Illustration (Watermark) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-[0.03] dark:opacity-[0.02] lg:opacity-[0.06] lg:dark:opacity-[0.04] lg:-mr-12 transition-transform duration-700 group-hover:scale-110">
          <div className="absolute inset-0 bg-gradient-to-tr from-evo-purple/20 to-evo-orange/20 rounded-full blur-2xl"></div>
          <DiamondIcon className="w-full h-full text-slate-900 dark:text-white transform -rotate-12" />
        </div>

        <div className="relative z-10 w-full max-w-3xl px-2">
          <div className="inline-flex items-center space-x-2 mb-6 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 backdrop-blur-sm relative z-20">
            <StarIcon className="w-4 h-4 text-evo-orange" filled />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Assinatura Oficial</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1] relative z-20">
            EVO <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-purple to-evo-orange">Plus</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-xl font-light relative z-20">
            Desbloqueie conteúdos transformadores, mentorias exclusivas e acelere drasticamente sua evolução.
          </p>

          {/* Actions (Replacing Search with CTA) */}
          <div className="flex flex-col sm:flex-row items-center gap-4 relative z-20">
            <button
              onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-evo-purple to-evo-orange text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Assinar para Liberar</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 ml-2">
                <ArrowLeftIcon className="w-3 h-3 rotate-180" />
              </span>
            </button>

            <button
              onClick={() => setView('catalog')}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all duration-300"
            >
              Ver Catálogo
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 pt-8 relative z-20">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1C1C1E] bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <img src={`https://picsum.photos/id/${10 + i}/100/100`} alt="Membro" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <p>+2.000 membros ativos</p>
          </div>
        </div>
      </div>

      {/* Features List (Vertical Stack) */}
      <div className="py-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Tudo o que você precisa para <span className="text-evo-purple">crescer</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Uma suíte completa de ferramentas e conteúdos desenhada para quem não aceita a mediocridade.
          </p>
        </div>

        {/* Vertical Stack Container (Single Column) */}
        <div className="flex flex-col space-y-6 max-w-3xl mx-auto px-4 md:px-0">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group w-full p-8 rounded-[2.5rem] bg-surface-light dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/5 hover:border-evo-purple/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6"
            >
              <div className="w-16 h-16 shrink-0 rounded-2xl bg-slate-50 dark:bg-white/5 group-hover:bg-evo-purple/10 flex items-center justify-center transition-colors duration-300">
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-evo-purple transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-base">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Preview Section */}
      <div className="relative rounded-[2rem] bg-slate-900 dark:bg-black overflow-hidden px-6 py-16 md:p-16 text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-evo-blue/20 blur-[100px] rounded-full"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Conteúdos que transformam
          </h2>
          <p className="text-slate-400 mb-12">
            Acesse centenas de horas de aulas, meditações e mentorias.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 flex justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full"></div>
              </div>
            ) : featuredContent.length > 0 ? (
              featuredContent.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleContentClick(item)}
                  className="group cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 text-left"
                >
                  <div className="relative aspect-video">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircleIcon className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      {item.type}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="text-white font-bold truncate mb-1">{item.title}</h4>
                    <p className="text-slate-400 text-sm">{item.author}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-slate-500">Nenhum conteúdo em destaque.</div>
            )}
          </div>

          <button
            onClick={() => setView('catalog')}
            className="mt-12 px-8 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white hover:text-black transition-all duration-300"
          >
            Explorar Catálogo Completo
          </button>
        </div>
      </div>

      {/* Membership Plans */}
      <div id="plans-section" className="py-12 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Escolha seu plano
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Comece hoje sua jornada de transformação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 bg-surface-light dark:bg-[#1C1C1E] flex flex-col items-center text-center
             ${selectedPlan === 'monthly'
                ? 'border-evo-purple ring-4 ring-evo-purple/10 scale-[1.02] shadow-xl'
                : 'border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 opacity-80 hover:opacity-100'}`}
          >
            <h3 className="text-xl font-bold text-slate-500 uppercase tracking-widest mb-4">Mensal</h3>
            <div className="flex items-baseline justify-center mb-6">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">R$ 49,90</span>
              <span className="text-slate-500 ml-2">/mês</span>
            </div>
            <ul className="space-y-4 text-left w-full mb-8 flex-1">
              <li className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                Acesso a todo conteúdo
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                Cancelamento a qualquer hora
              </li>
            </ul>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSubscribe('monthly');
              }}
              className={`w-full py-3 rounded-xl font-bold transition-all ${selectedPlan === 'monthly' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-white/10 text-slate-500'}`}
            >
              Assinar Mensal
            </button>
          </div>

          {/* Annual Plan (Featured) */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`cursor-pointer rounded-3xl p-8 border-2 relative transition-all duration-300 flex flex-col items-center text-center
             ${selectedPlan === 'annual'
                ? 'bg-white dark:bg-[#252528] border-evo-orange shadow-2xl scale-105 z-10'
                : 'bg-surface-light dark:bg-[#1C1C1E] border-slate-200 dark:border-white/5 opacity-80 hover:opacity-100'}`}
          >
            {selectedPlan === 'annual' && (
              <div className="absolute -top-4 bg-gradient-to-r from-evo-orange to-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                Maior Economia
              </div>
            )}

            <h3 className="text-xl font-bold text-evo-orange uppercase tracking-widest mb-4">Anual</h3>
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-5xl font-extrabold text-slate-900 dark:text-white">R$ 497</span>
              <span className="text-slate-500 ml-2">/ano</span>
            </div>
            <p className="text-green-500 font-bold text-sm mb-6 bg-green-500/10 px-3 py-1 rounded-full">
              Economize 20%
            </p>

            <ul className="space-y-4 text-left w-full mb-8 flex-1">
              <li className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                Acesso ilimitado 12 meses
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                Certificados inclusos
              </li>
              <li className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                Grupo exclusivo de networking
              </li>
            </ul>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSubscribe('annual');
              }}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-evo-orange to-red-500 text-white shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] transition-all"
            >
              Assinar Agora
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PremiumPage;

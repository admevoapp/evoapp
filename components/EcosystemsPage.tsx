import React, { useState } from 'react';
import { NetworkIcon, SearchIcon, ExternalLinkIcon, StarIcon } from './icons';

interface Store {
  id: string;
  name: string;
  description: string;
  url: string;
  logoUrl?: string;
  highlight?: boolean; // Preparado para destaque futuro
}

const mockStores: Store[] = [
  {
    id: '1',
    name: 'EvoRefine',
    description: 'Programa estruturado para saúde, emagrecimento e transformação com foco em base, rotina e consistência.',
    url: 'https://evorefine.com/',
    logoUrl: '/images/logo-evorefine.png',
    highlight: false,
  },
  {
    id: '2',
    name: 'EvoEssence',
    description: 'Uma marca do ecossistema EVO conectada à ideia de cuidado, identidade e experiência.',
    url: 'https://evoessence.com.br/',
    logoUrl: '/images/logo-evoessence.png',
    highlight: false,
  },
  {
    id: '3',
    name: 'Milady Semi Joias',
    description: 'Peças e acessórios que unem brilho, estilo e exclusividade em uma experiência de compra elegante.',
    url: 'https://www.instagram.com/miladysemijoias',
    logoUrl: '/images/logo-milady.png',
    highlight: false,
  },
  {
    id: '4',
    name: 'EVOTÁBIL',
    description: 'Contabilidade inteligente com gestão, tecnologia e educação para empreendedores em evolução.',
    url: 'https://evocontlp-e8fbbsui.manus.space/',
    logoUrl: '/images/logo-evotabil.png',
    highlight: false,
  }
];

const EcosystemsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStores = mockStores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in custom-scrollbar">

      {/* 1. Hero Banner */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-evo-blue via-evo-purple to-evo-orange flex flex-col md:flex-row items-center p-8 md:p-12 shadow-2xl">
        {/* Abstract Background Effects */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-black/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full md:w-2/3 text-center md:text-left space-y-6">
          <div className="inline-flex items-center space-x-2 bg-black/20 border border-black/10 rounded-full px-4 py-1.5 mb-2 backdrop-blur-sm">
            <NetworkIcon className="w-4 h-4 text-white" />
            <span className="text-xs font-semibold text-white uppercase tracking-widest">A nova era das marcas EVO</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-md">
            Ecossistema EVO
          </h1>
          <p className="text-lg text-white/90 max-w-2xl leading-relaxed drop-shadow-sm">
            Negócios, marcas e experiências conectadas ao universo EVO. Um espaço onde propósito, transformação e valor se encontram.
          </p>
          <div className="pt-4 flex justify-center md:justify-start">
            <button
              onClick={() => {
                document.getElementById('stores-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-black hover:bg-slate-100 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Conhecer as Lojas
            </button>
          </div>
        </div>

        {/* Decorative Graphic Element for Hero */}
        <div className="relative z-10 mt-10 md:mt-0 w-full md:w-1/3 flex justify-center">
          <div className="w-48 h-48 md:w-64 md:h-64 relative animate-float">
            <div className="absolute inset-0 border-2 border-white/30 rounded-full border-dashed animate-[spin_30s_linear_infinite]"></div>
            <div className="absolute inset-4 border border-white/40 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <NetworkIcon className="w-20 h-20 text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sessão Introdutória */}
      <div className="bg-[#1C1C1E] rounded-3xl p-8 md:p-12 border border-white/5 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Uma nova etapa da comunidade EVO</h2>
          <p className="text-slate-400 leading-relaxed text-lg">
            O Ecossistema EVO reúnem marcas integradas à comunidade, ampliando a experiência para além das conexões.
            Aqui, você encontra lojas e iniciativas que fazem parte dessa evolução, cada uma com sua proposta, seu propósito
            e sua forma de gerar valor.
          </p>
        </div>
      </div>

      {/* Section Search & Title */}
      <div id="stores-section" className="flex flex-col md:flex-row justify-between items-center bg-transparent pt-8 pb-4 scroll-mt-24 space-y-4 md:space-y-0">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
          Nossas Marcas
          <span className="ml-3 bg-evo-purple/20 text-evo-purple text-xs font-bold px-2 py-1 rounded-full">
            {filteredStores.length}
          </span>
        </h3>

        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar loja ou propósito..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-evo-purple focus:border-transparent text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* 3. Grid Responsivo com Cards das Lojas */}
      {filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStores.map((store) => (
            <div
              key={store.id}
              className="group relative bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 border border-slate-200 dark:border-white/5 hover:border-evo-purple/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              {/* Highlight flare on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-evo-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="h-16 sm:h-20 w-full flex items-center justify-start group-hover:scale-105 transition-transform duration-300 origin-left">
                  {store.logoUrl ? (
                    <img src={store.logoUrl} alt={`Logo ${store.name}`} className="w-full h-full object-contain object-left" />
                  ) : (
                    <div className="h-16 px-6 rounded-2xl bg-slate-100 dark:bg-[#252527] border border-slate-200 dark:border-white/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-slate-400 dark:text-white/40 uppercase">
                        {store.name.substring(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                {store.highlight && (
                  <div className="bg-gradient-to-r from-orange-400 to-evo-orange text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full flex items-center shadow-lg">
                    <StarIcon className="w-3 h-3 mr-1" filled />
                    Em Destaque
                  </div>
                )}
              </div>

              <div className="space-y-3 relative z-10">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-evo-purple transition-colors">{store.name}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {store.description}
                </p>
              </div>

              <div className="mt-8 relative z-10">
                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 bg-slate-100 dark:bg-white/5 hover:bg-evo-purple hover:text-white dark:hover:bg-evo-purple text-slate-800 dark:text-white text-sm font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center space-x-2 border border-transparent dark:border-white/5 group/btn"
                >
                  <span>Acessar loja</span>
                  <ExternalLinkIcon className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full py-16 text-center border border-dashed border-slate-300 dark:border-white/10 rounded-3xl">
          <p className="text-slate-500 dark:text-slate-400">Nenhuma loja encontrada com a sua busca.</p>
        </div>
      )}

      {/* 4. Rodapé da Seção */}
      <div className="mt-12 bg-gradient-to-r from-evo-purple/10 via-slate-100 dark:via-[#1C1C1E] to-evo-blue/10 rounded-3xl p-8 border border-slate-200 dark:border-white/5 text-center flex flex-col items-center justify-center space-y-6">
        <p className="text-lg text-slate-700 dark:text-slate-300 font-medium max-w-xl leading-relaxed">
          O Ecossistema EVO está apenas começando. Novas marcas, experiências e oportunidades farão parte dessa jornada.
        </p>

        {/* Placeholder Button conforme requested */}
        <button
          className="bg-slate-300 dark:bg-white/10 text-slate-500 dark:text-white/50 font-bold py-3 px-8 rounded-full cursor-not-allowed border border-slate-400/20 dark:border-white/5 outline-none"
          disabled
        >
          Em breve!
        </button>
      </div>

    </div>
  );
};

export default EcosystemsPage;

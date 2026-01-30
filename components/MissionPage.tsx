import React, { useEffect } from 'react';
import { HeartPulseIcon, SparklesIcon, ShieldCheckIcon, StarIcon, UsersIcon } from './icons';

const MissionPage: React.FC = () => {
  // Injetar animação de fade-in se não existir globalmente
  useEffect(() => {
    const styleId = 'page-fade-in-animation';
    if (document.getElementById(styleId)) return;

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
    `;
    document.head.appendChild(style);

    return () => {
      // Não remover ao desmontar para evitar flash em navegação rápida, 
      // mas em um app real gerenciariamos estilos globais melhor.
    };
  }, []);

  return (
    <div className="w-full animate-fade-in-page space-y-12 pb-12">

      {/* Header / Hero */}
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-block px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6">
          Nossa Essência
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Nossa <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Missão & Propósito</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Existimos para elevar a consciência humana através de conexões profundas, autênticas e transformadoras.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <section className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
        {/* Missão */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <HeartPulseIcon className="w-32 h-32 text-evo-orange" />
          </div>
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center shrink-0 z-10">
            <HeartPulseIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Nossa Missão</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              Conectar Amantes Radicais de Pessoas em um ecossistema seguro e vibrante, onde cada indivíduo é encorajado a viver sua verdade, compartilhar seus dons e contribuir para a evolução do coletivo.
            </p>
          </div>
        </div>

        {/* Visão */}
        <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <SparklesIcon className="w-32 h-32 text-evo-blue" />
          </div>
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shrink-0 z-10">
            <SparklesIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Nossa Visão</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              Ser a maior e mais impactante comunidade de desenvolvimento humano e conexão do mundo, criando uma rede global de apoio mútuo que transcende fronteiras físicas e digitais.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#121212] rounded-3xl p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-evo-purple/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10 text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Valores Inegociáveis</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Estes são os princípios que guiam cada decisão, cada linha de código e cada interação dentro do EVOAPP.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4 max-w-4xl mx-auto">
          <ValueCard
            icon={<HeartPulseIcon className="w-6 h-6 text-white" />}
            title="Amor Radical"
            description="Amar o próximo não apenas quando é fácil, mas como uma disciplina de aceitação e acolhimento."
            color="bg-evo-orange"
          />
          <ValueCard
            icon={<ShieldCheckIcon className="w-6 h-6 text-white" />}
            title="Integridade"
            description="Ser inteiro. Agir com transparência e honestidade, honrando quem somos em todos os momentos."
            color="bg-evo-blue"
          />
          <ValueCard
            icon={<UsersIcon className="w-6 h-6 text-white" />}
            title="Pertencimento"
            description="Criar um espaço onde ninguém se sinta excluído. Aqui, sua história importa e tem lugar."
            color="bg-evo-purple"
          />
          <ValueCard
            icon={<SparklesIcon className="w-6 h-6 text-white" />}
            title="Evolução Constante"
            description="O compromisso de ser hoje melhor do que fomos ontem, aprendendo e crescendo juntos."
            color="bg-yellow-500"
          />
          <ValueCard
            icon={<StarIcon className="w-6 h-6 text-white" />}
            title="Excelência"
            description="Fazer o nosso melhor com os recursos que temos, entregando valor real para a comunidade."
            color="bg-green-500"
          />
          <ValueCard
            icon={<UsersIcon className="w-6 h-6 text-white" />}
            title="Servir"
            description="Entendemos que a liderança mais alta é o serviço. Estamos aqui para ajudar o outro a brilhar."
            color="bg-orange-500"
          />
        </div>
      </section>

      {/* Final Quote */}
      <section className="text-center py-12 px-4">
        <blockquote className="text-2xl md:text-3xl font-serif italic text-slate-700 dark:text-slate-300 max-w-4xl mx-auto">
          "O propósito da vida é encontrar o seu dom. O sentido da vida é entregá-lo aos outros."
        </blockquote>
        <p className="mt-4 text-slate-500 font-medium">— Pablo Picasso</p>
      </section>
    </div>
  );
};

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({ icon, title, description, color }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${color}`}>
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export default MissionPage;
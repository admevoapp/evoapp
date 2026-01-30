import React, { useEffect } from 'react';
import { UserCircleIcon, SearchIcon, ChatBubbleIcon, CalendarIcon, SparklesIcon, CheckCircleIcon } from './icons';

const HowItWorksPage: React.FC = () => {
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
      // Cleanup handled globally
    };
  }, []);

  const StepCard: React.FC<{ number: string; title: string; description: string; icon: React.ReactNode }> = ({ number, title, description, icon }) => (
    <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <span className="text-8xl font-bold text-slate-900 dark:text-white">{number}</span>
      </div>
      <div className="relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-evo-blue/10 to-evo-purple/10 rounded-2xl flex items-center justify-center mb-6 text-evo-purple group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );

  return (
    <div className="w-full animate-fade-in-page space-y-12 pb-12">

      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-block px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6">
          Guia Prático
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Como Funciona o <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">EVOAPP</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
          Uma jornada simples e intuitiva para você se conectar, evoluir e compartilhar com pessoas que vibram na mesma frequência.
        </p>
      </div>

      {/* Steps Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StepCard
          number="01"
          title="Crie seu Passaporte"
          description="O cadastro é rápido. Preencha seus dados básicos e crie sua conta segura para acessar a comunidade exclusiva."
          icon={<UserCircleIcon className="w-8 h-8" />}
        />
        <StepCard
          number="02"
          title="Conte sua História"
          description="Complete seu perfil com sua foto, bio, profissão e, o mais importante: seus status EVO (Academy, Family, Mission...)."
          icon={<SparklesIcon className="w-8 h-8" />}
        />
        <StepCard
          number="03"
          title="Explore e Conecte-se"
          description="Use a busca inteligente para encontrar ARPs por região, profissão ou perfil comportamental. Envie convites e expanda sua rede."
          icon={<SearchIcon className="w-8 h-8" />}
        />
        <StepCard
          number="04"
          title="Interaja e Evolua"
          description="Participe do feed, troque mensagens, favorite perfis inspiradores e fique por dentro dos próximos eventos presenciais e online."
          icon={<ChatBubbleIcon className="w-8 h-8" />}
        />
      </section>

      {/* Features Highlight */}
      <section className="bg-[#121212] rounded-3xl p-8 md:p-12 relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-evo-blue/20 to-evo-purple/20 opacity-50 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">O que você encontra aqui?</h2>
            <p className="text-slate-400">Ferramentas pensadas para fortalecer a egrégora.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-white">Feed Exclusivo</h3>
                <p className="text-slate-400 leading-relaxed">Compartilhe insights, fotos e momentos sem o ruído das redes sociais tradicionais.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-white">Agenda EVO</h3>
                <p className="text-slate-400 leading-relaxed">Nunca perca uma imersão ou encontro. Todos os eventos oficiais e regionais em um só lugar.</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                <SearchIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2 text-white">Filtros Poderosos</h3>
                <p className="text-slate-400 leading-relaxed">Encontre exatamente quem você precisa: de parceiros de negócios a mentores de vida.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Simple */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">Dúvidas Frequentes</h2>
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Quem pode participar?</h3>
            <p className="text-slate-600 dark:text-slate-400">A comunidade é aberta a todos que compartilham dos valores do Amor Radical e buscam evolução pessoal e coletiva.</p>
          </div>
          <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">É gratuito?</h3>
            <p className="text-slate-600 dark:text-slate-400">Sim! O acesso básico à plataforma e à comunidade é gratuito para todos os membros.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorksPage;
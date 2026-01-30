import React, { useEffect } from 'react';
import { ShieldCheckIcon, CheckCircleIcon, BanIcon } from './icons';

const GuidelinesPage: React.FC = () => {
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
  }, []);

  const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4 flex items-center">
      <span className="w-2 h-8 bg-gradient-to-b from-evo-blue to-evo-purple rounded-full mr-3"></span>
      {title}
    </h2>
  );

  const Text: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 text-base">
      {children}
    </p>
  );

  const DoItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start space-x-3 mb-3 text-slate-600 dark:text-slate-300">
      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );

  const DontItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start space-x-3 mb-3 text-slate-600 dark:text-slate-300">
      <BanIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </li>
  );

  return (
    <div className="w-full animate-fade-in-page pb-12">
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-flex items-center px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6 space-x-2">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Código de Conduta</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Diretrizes da <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Comunidade</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Para manter a egrégora elevada, estabelecemos princípios claros de convivência. Aqui, a evolução é coletiva.
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-surface-light dark:bg-surface-dark rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <Text>
            O EVOAPP é um espaço sagrado de conexão e crescimento. Para garantir que todos se sintam seguros e bem-vindos, pedimos que você siga estas diretrizes em todas as suas interações.
          </Text>

          <SectionTitle title="O que encorajamos (O Jeito ARP de Ser)" />
          <Text>
            Queremos ver você brilhar e ajudar os outros a brilharem também.
          </Text>
          <ul className="list-none pl-0 mt-4 mb-6">
            <DoItem><strong>Seja gentil e respeitoso:</strong> Trate todos com a mesma dignidade que você espera receber. O desacordo é permitido, a falta de respeito não.</DoItem>
            <DoItem><strong>Compartilhe valor:</strong> Publique conteúdos que inspirem, ensinem ou provoquem reflexões positivas.</DoItem>
            <DoItem><strong>Seja autêntico:</strong> Use sua foto real e compartilhe sua história verdadeira. A vulnerabilidade conecta.</DoItem>
            <DoItem><strong>Acolha a diversidade:</strong> Celebre as diferenças de pensamento, origem e vivência.</DoItem>
          </ul>

          <SectionTitle title="O que não toleramos" />
          <Text>
            Comportamentos que ferem a integridade da nossa comunidade serão tratados com rigor.
          </Text>
          <ul className="list-none pl-0 mt-4 mb-6">
            <DontItem><strong>Discurso de ódio e bullying:</strong> Qualquer forma de discriminação, assédio ou intimidação é proibida.</DontItem>
            <DontItem><strong>Conteúdo violento ou sexualmente explícito:</strong> Mantenha o ambiente seguro para todas as idades.</DontItem>
            <DontItem><strong>Spam e autopromoção excessiva:</strong> Não use a plataforma apenas para vender produtos ou enviar mensagens em massa.</DontItem>
            <DontItem><strong>Desinformação:</strong> Não compartilhe notícias falsas ou informações enganosas intencionalmente.</DontItem>
          </ul>

          <SectionTitle title="Relatando Problemas" />
          <Text>
            A segurança da comunidade é responsabilidade de todos. Se você vir algo que viola essas diretrizes, por favor, denuncie. Nossa equipe de administração revisa todas as denúncias cuidadosamente.
          </Text>

          <div className="mt-12 p-6 bg-slate-50 dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              O desrespeito a estas diretrizes pode levar à remoção de conteúdo e suspensão da conta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesPage;
import React, { useEffect } from 'react';
import { SparklesIcon, UserCircleIcon, ChatBubbleIcon, ShieldCheckIcon, HeartIcon } from './icons';

const BestPracticesPage: React.FC = () => {
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

  const PracticeCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-evo-purple/30 transition-colors h-full">
      <div className="flex items-center space-x-4 mb-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-evo-purple">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
        {children}
      </div>
    </div>
  );

  return (
    <div className="w-full animate-fade-in-page pb-12">
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-sm font-semibold mb-6 space-x-2 border border-slate-200 dark:border-slate-700">
          <SparklesIcon className="w-4 h-4" />
          <span>Guia de Sucesso</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Boas <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Práticas</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Dicas essenciais para você aproveitar ao máximo o EVOAPP e construir relações valiosas.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 gap-6">
        <PracticeCard icon={<UserCircleIcon className="w-6 h-6" />} title="Perfil Campeão">
          <p className="mb-3">Seu perfil é a primeira impressão. Mantenha-o autêntico:</p>
          <ul className="space-y-2 list-disc pl-4 marker:text-evo-purple">
            <li>Use uma foto de rosto clara e sorridente.</li>
            <li>Preencha sua Bio com propósito, não apenas cargos.</li>
            <li>Mantenha seus status EVO (Academy, Mission...) atualizados.</li>
            <li>Adicione fotos na galeria que mostrem seus hobbies.</li>
          </ul>
        </PracticeCard>

        <PracticeCard icon={<ChatBubbleIcon className="w-6 h-6" />} title="Interações de Valor">
          <p className="mb-3">Qualidade importa mais que quantidade:</p>
          <ul className="space-y-2 list-disc pl-4 marker:text-evo-purple">
            <li>Comente para somar, elogie com sinceridade.</li>
            <li>Evite respostas monossilábicas; crie diálogo.</li>
            <li>Receba feedbacks com abertura e gratidão.</li>
            <li>Compartilhe aprendizados das suas imersões.</li>
          </ul>
        </PracticeCard>

        <PracticeCard icon={<HeartIcon className="w-6 h-6" />} title="Conexão Real">
          <p className="mb-3">Networking é sobre dar, não apenas receber:</p>
          <ul className="space-y-2 list-disc pl-4 marker:text-evo-purple">
            <li>Ao conectar, envie uma mensagem personalizada.</li>
            <li>Não faça abordagens comerciais frias e invasivas.</li>
            <li>Busque interesses comuns além do trabalho.</li>
            <li>Respeite o tempo de resposta do outro.</li>
          </ul>
        </PracticeCard>

        <PracticeCard icon={<ShieldCheckIcon className="w-6 h-6" />} title="Segurança e Ética">
          <p className="mb-3">Zelamos por um ambiente seguro:</p>
          <ul className="space-y-2 list-disc pl-4 marker:text-evo-purple">
            <li>Mantenha suas credenciais de acesso seguras.</li>
            <li>Seja transparente sobre suas intenções.</li>
            <li>Reporte comportamentos inadequados à moderação.</li>
            <li>Respeite a privacidade das conversas privadas.</li>
          </ul>
        </PracticeCard>
      </div>

      <div className="max-w-3xl mx-auto mt-12 text-center bg-surface-light dark:bg-surface-dark p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Lembre-se do Amor Radical</h3>
        <p className="text-slate-600 dark:text-slate-300">
          A técnica é importante, mas o coração é o que conecta. Em caso de dúvida sobre como agir, pergunte-se: <strong>"Isso contribui para a evolução do outro?"</strong>
        </p>
      </div>
    </div>
  );
};

export default BestPracticesPage;
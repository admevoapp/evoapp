import React, { useEffect } from 'react';
import { LockClosedIcon, ShieldCheckIcon } from './icons';

const PrivacyPage: React.FC = () => {
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

  const ListItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start space-x-3 mb-3 text-slate-600 dark:text-slate-300">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2.5 flex-shrink-0"></span>
      <span>{children}</span>
    </li>
  );

  return (
    <div className="w-full animate-fade-in-page pb-12">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-flex items-center px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6 space-x-2">
          <LockClosedIcon className="w-4 h-4" />
          <span>Política de Privacidade</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Privacidade</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Transparência total sobre como cuidamos dos seus dados e protegemos sua identidade digital.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto bg-surface-light dark:bg-surface-dark rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <Text>
            No EVOAPP, entendemos que sua privacidade é um direito fundamental. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais ao utilizar nossa plataforma.
          </Text>

          <SectionTitle title="1. Informações que Coletamos" />
          <Text>Para proporcionar a melhor experiência de conexão, coletamos os seguintes tipos de dados:</Text>
          <ul className="list-none pl-0 mt-4 mb-6">
            <ListItem><strong>Dados de Cadastro:</strong> Nome, e-mail, telefone e senha.</ListItem>
            <ListItem><strong>Dados de Perfil:</strong> Foto, bio, profissão, status EVO e links de redes sociais.</ListItem>
            <ListItem><strong>Dados de Uso:</strong> Interações, posts, comentários e conexões realizadas.</ListItem>
          </ul>

          <SectionTitle title="2. Como Usamos seus Dados" />
          <Text>Utilizamos suas informações exclusivamente para:</Text>
          <ul className="list-none pl-0 mt-4 mb-6">
            <ListItem>Facilitar conexões relevantes com outros membros da comunidade.</ListItem>
            <ListItem>Personalizar sua experiência e sugerir conteúdos e eventos.</ListItem>
            <ListItem>Garantir a segurança da plataforma e prevenir fraudes.</ListItem>
            <ListItem>Enviar comunicados importantes sobre sua conta e atualizações do sistema.</ListItem>
          </ul>

          <SectionTitle title="3. Compartilhamento de Informações" />
          <Text>
            <strong>Nós não vendemos seus dados pessoais.</strong> Compartilhamos informações apenas nas seguintes circunstâncias:
          </Text>
          <ul className="list-none pl-0 mt-4 mb-6">
            <ListItem>Com seu consentimento explícito.</ListItem>
            <ListItem>Para cumprimento de obrigações legais.</ListItem>
            <ListItem>Com prestadores de serviço essenciais (ex: hospedagem de servidores) sob estritos acordos de confidencialidade.</ListItem>
          </ul>

          <SectionTitle title="4. Segurança dos Dados" />
          <Text>
            Implementamos medidas técnicas e organizacionais robustas para proteger seus dados, incluindo criptografia em trânsito e em repouso, controles de acesso rigorosos e monitoramento constante de segurança.
          </Text>

          <SectionTitle title="5. Seus Direitos" />
          <Text>
            Você tem total controle sobre seus dados. A qualquer momento, você pode:
          </Text>
          <ul className="list-none pl-0 mt-4 mb-6">
            <ListItem>Acessar e exportar seus dados pessoais.</ListItem>
            <ListItem>Corrigir informações imprecisas em seu perfil.</ListItem>
            <ListItem>Solicitar a exclusão definitiva de sua conta e dados associados.</ListItem>
          </ul>

          <div className="mt-12 p-6 bg-slate-50 dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start space-x-4">
              <ShieldCheckIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Dúvidas sobre seus dados?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Se você tiver qualquer questão sobre como seus dados são tratados, entre em contato com nossa equipe de privacidade através do e-mail <span className="text-evo-purple font-medium">privacidade@evoapp.com</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
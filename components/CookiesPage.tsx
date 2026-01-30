import React, { useEffect } from 'react';
import { CookieIcon, CheckCircleIcon, CogIcon } from './icons';

const CookiesPage: React.FC = () => {
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

  const CookieTypeItem: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className="mb-4 p-4 bg-white dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-slate-800">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center">
        <CheckCircleIcon className="w-5 h-5 text-evo-purple mr-2" />
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm">
        {description}
      </p>
    </div>
  );

  return (
    <div className="w-full animate-fade-in-page pb-12">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-flex items-center px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6 space-x-2">
          <CookieIcon className="w-4 h-4" />
          <span>Política de Cookies</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Política de <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Cookies</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Entenda como utilizamos cookies para melhorar sua experiência, garantir a segurança e personalizar sua jornada no EVOAPP.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto bg-surface-light dark:bg-surface-dark rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <Text>
            Esta Política de Cookies explica o que são cookies, como os utilizamos no EVOAPP e como você pode gerenciar suas preferências. Acreditamos na transparência total sobre o uso de seus dados.
          </Text>

          <SectionTitle title="1. O que são Cookies?" />
          <Text>
            Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador, tablet ou celular) quando você visita nosso site. Eles permitem que a plataforma "lembre" de suas ações e preferências (como login, idioma, tamanho da fonte) por um período de tempo, para que você não precise redefini-las sempre que voltar.
          </Text>

          <SectionTitle title="2. Como Utilizamos Cookies" />
          <Text>
            Utilizamos cookies para fornecer uma experiência fluida e segura. Eles nos ajudam a entender como a plataforma está sendo usada, o que nos permite melhorar funcionalidades e corrigir erros.
          </Text>

          <SectionTitle title="3. Tipos de Cookies que Usamos" />
          <div className="mt-6 mb-8">
            <CookieTypeItem
              title="Cookies Essenciais"
              description="Necessários para o funcionamento básico do site, como autenticação segura e prevenção de fraudes. Não podem ser desativados."
            />
            <CookieTypeItem
              title="Cookies de Desempenho"
              description="Coletam informações anônimas sobre como você usa o site (ex: páginas mais visitadas), ajudando-nos a otimizar a performance técnica."
            />
            <CookieTypeItem
              title="Cookies Funcionais"
              description="Permitem que o site lembre suas escolhas (como seu nome de usuário ou região) para oferecer recursos mais personalizados."
            />
          </div>

          <SectionTitle title="4. Gerenciamento de Cookies" />
          <Text>
            Você pode controlar e/ou excluir cookies conforme desejar. A maioria dos navegadores permite que você recuse o armazenamento de cookies ou exclua os que já estão armazenados.
          </Text>
          <Text>
            No entanto, alertamos que a desativação de cookies essenciais pode afetar o funcionamento correto da plataforma EVOAPP, impedindo o login ou o uso de certas funcionalidades.
          </Text>

          <div className="mt-12 p-6 bg-slate-50 dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start space-x-4">
              <CogIcon className="w-8 h-8 text-evo-blue flex-shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Preferências do Navegador</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Para gerenciar cookies diretamente no seu navegador, consulte a seção de ajuda ou configurações do Chrome, Firefox, Safari ou Edge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPage;
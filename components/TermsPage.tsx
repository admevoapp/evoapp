import React, { useEffect } from 'react';
import { ShieldCheckIcon, DocumentTextIcon } from './icons';

const TermsPage: React.FC = () => {
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
      <span className="w-1.5 h-1.5 bg-evo-purple rounded-full mt-2.5 flex-shrink-0"></span>
      <span>{children}</span>
    </li>
  );

  return (
    <div className="w-full animate-fade-in-page pb-12">

      {/* Header */}
      <div className="text-center max-w-4xl mx-auto py-10">
        <div className="inline-flex items-center px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6 space-x-2">
          <DocumentTextIcon className="w-4 h-4" />
          <span>Termos de Uso</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Termos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Uso</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Regras claras e transparentes para garantir que nossa comunidade continue sendo um espaço seguro de evolução e conexão.
        </p>
      </div>

      {/* Content Container */}
      <div className="max-w-4xl mx-auto bg-surface-light dark:bg-surface-dark rounded-3xl p-8 md:p-12 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <Text>
            Bem-vindo ao EVOAPP. Estes Termos de Uso regem seu acesso e uso de nossa plataforma. Ao acessar ou usar o EVOAPP, você concorda em cumprir estes termos. Se você não concordar com alguma parte destes termos, você não deve acessar a plataforma.
          </Text>

          <SectionTitle title="1. O Propósito da Comunidade" />
          <Text>
            O EVOAPP é uma rede social desenhada exclusivamente para conectar pessoas interessadas em desenvolvimento pessoal, evolução humana e conexões autênticas ("Amantes Radicais de Pessoas"). O uso da plataforma deve estar alinhado a esses valores.
          </Text>

          <SectionTitle title="2. Conduta do Usuário" />
          <Text>
            Esperamos que todos os membros ajam com integridade e respeito. Você concorda em não:
          </Text>
          <ul className="list-none pl-0 mt-4 mb-6">
            <ListItem>Usar a plataforma para assediar, abusar, difamar ou ameaçar outros membros.</ListItem>
            <ListItem>Publicar conteúdo de ódio, discriminatório, pornográfico ou violento.</ListItem>
            <ListItem>Utilizar a plataforma para spam, esquemas de pirâmide ou marketing multinível não solicitado.</ListItem>
            <ListItem>Criar perfis falsos ou se passar por outra pessoa.</ListItem>
          </ul>
          <Text>
            A violação destas regras pode resultar na suspensão ou banimento permanente de sua conta, a critério exclusivo da administração.
          </Text>

          <SectionTitle title="3. Privacidade e Dados" />
          <Text>
            Sua privacidade é fundamental para nós. Coletamos apenas as informações necessárias para o funcionamento da plataforma e para facilitar as conexões entre membros. Não vendemos seus dados para terceiros. Para mais detalhes, consulte nossa Política de Privacidade.
          </Text>

          <SectionTitle title="4. Propriedade Intelectual" />
          <Text>
            Todo o conteúdo gerado pelo usuário (posts, fotos, comentários) permanece de propriedade do usuário. No entanto, ao publicar no EVOAPP, você nos concede uma licença não exclusiva para exibir e distribuir esse conteúdo dentro da plataforma.
          </Text>
          <Text>
            A marca EVOAPP, logotipo e design da plataforma são propriedade exclusiva de nossos administradores e não podem ser utilizados sem permissão expressa.
          </Text>

          <SectionTitle title="5. Isenção de Responsabilidade" />
          <Text>
            O EVOAPP serve como um canal de conexão. Não nos responsabilizamos pelas interações offline que ocorram entre os membros, nem pela veracidade das informações publicadas pelos usuários em seus perfis. Recomendamos sempre cautela e bom senso ao encontrar pessoas desconhecidas.
          </Text>

          <SectionTitle title="6. Alterações nos Termos" />
          <Text>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre alterações significativas através da plataforma ou por e-mail. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
          </Text>

          <div className="mt-12 p-6 bg-slate-50 dark:bg-[#121212] rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start space-x-4">
              <ShieldCheckIcon className="w-8 h-8 text-evo-purple flex-shrink-0" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Compromisso de Segurança</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nossa equipe de moderação trabalha diariamente para garantir que estes termos sejam cumpridos. Se você presenciar qualquer violação, utilize as ferramentas de denúncia disponíveis na plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
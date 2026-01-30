import React, { useState, useEffect } from 'react';
import { SearchIcon, UserCircleIcon, ShieldCheckIcon, CalendarIcon, ChatBubbleIcon, MailIcon, ArrowLeftIcon, HelpCircleIcon, XMarkIcon, CheckCircleIcon } from './icons';

// Fix: checkCircleIcon might be imported as CheckCircleIcon (PascalCase) in icons.tsx. 
// However, looking at previous view_file, CheckIcon and CheckCircleIcon exist. 
// I will import CheckCircleIcon.



const HelpCenterPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

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
      .animate-fade-in-modal {
        animation: fadeInModal 0.3s ease-out forwards;
      }
      @keyframes fadeInModal {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
        document.head.appendChild(style);
    }, []);

    // Topic Data
    const topicContent: Record<string, { title: string; items: string[] }> = {
        'profile': {
            title: 'Perfil e Conta',
            items: [
                'Para editar seu perfil, vá até a página "Meu Perfil" e clique no botão "Editar".',
                'Sua foto deve ser de rosto, clara e recente para facilitar a identificação.',
                'Mantenha sua biografia atualizada com seus interesses e momento atual.',
                'Qualquer alteração de e-mail deve ser solicitada ao suporte por segurança.'
            ]
        },
        'privacy': {
            title: 'Privacidade e Segurança',
            items: [
                'Sua senha é pessoal e intransferível. Nunca a compartilhe.',
                'Você pode bloquear usuários indesejados visitando o perfil deles > menu (3 pontos) > Bloquear.',
                'Seus dados sensíveis (CPF, endereço) não são exibidos publicamente.',
                'Para alterar sua senha, acesse Configurações > Segurança.'
            ]
        },
        'events': {
            title: 'Eventos EVO',
            items: [
                'As inscrições para imersões são feitas através da Agenda EVO.',
                'Confirme sua presença com antecedência para garantir sua vaga.',
                'Eventos regionais são organizados por líderes locais e aparecem no feed.',
                'Dúvidas sobre ingressos devem ser tratadas diretamente com a organização do evento.'
            ]
        },
        'community': {
            title: 'Comunidade e Diretrizes',
            items: [
                'O respeito é a base da nossa egrégora. Ofensas não são toleradas.',
                'Use o feed para compartilhar vitórias, aprendizados e conexões genuínas.',
                'Denuncie conteúdos impróprios usando a opção "Denunciar" no post.',
                'Evite spam e autopromoção excessiva; foque em gerar valor.'
            ]
        }
    };

    const CategoryCard: React.FC<{ icon: React.ReactNode; title: string; description: string; topicKey: string }> = ({ icon, title, description, topicKey }) => (
        <div
            onClick={() => setSelectedTopic(topicKey)}
            className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-evo-purple/50 hover:shadow-md transition-all cursor-pointer group flex items-start space-x-6"
        >
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-slate-300 group-hover:text-evo-purple group-hover:bg-evo-purple/10 transition-colors">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );

    const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => (
        <div className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-evo-purple/30 transition-colors">
            <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-start">
                <span className="text-evo-purple mr-2">Q.</span>
                {question}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">{answer}</p>
        </div>
    );

    const faqs = [
        { q: "Como altero minha senha?", a: "Vá em Configurações > Segurança e clique em 'Alterar Senha'. Você receberá um e-mail de confirmação." },
        { q: "Como funcionam as conexões?", a: "Você pode enviar convites de conexão no perfil de outros usuários. Após aceitarem, vocês poderão trocar mensagens diretas." },
        { q: "O que são os status EVO?", a: "São selos que indicam sua jornada na comunidade (Academy, Family, Mission, etc). Você pode editá-los em seu perfil." },
        { q: "Como denuncio um comportamento?", a: "No perfil do usuário ou na postagem, clique nos três pontos e selecione 'Denunciar'. Nossa equipe analisará o caso." },
        { q: "A plataforma é gratuita?", a: "Sim, o acesso à comunidade EVOAPP e suas funcionalidades principais é gratuito para todos os membros." },
        { q: "Como excluir minha conta?", a: "Entre em contato com nosso suporte através do formulário abaixo ou envie um e-mail para privacidade@evoapp.com." }
    ];

    const filteredFaqs = faqs.filter(f =>
        f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.a.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="w-full animate-fade-in-page pb-12 relative">

                {/* Header Standard Style */}
                <div className="text-center max-w-4xl mx-auto py-10">
                    <div className="inline-flex items-center px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6 space-x-2">
                        <HelpCircleIcon className="w-4 h-4" />
                        <span>Central de Ajuda</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                        Como podemos <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">ajudar?</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
                        Busque por dúvidas, tópicos ou navegue pelas categorias abaixo. Estamos aqui para apoiar sua jornada.
                    </p>

                    {/* Search Bar Repositioned */}
                    <div className="relative max-w-2xl mx-auto">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Ex: Como editar perfil, senha, eventos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 rounded-2xl bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-4 focus:ring-evo-purple/20 transition-all shadow-lg shadow-evo-purple/5"
                        />
                    </div>
                </div>

                {/* Categories Grid - Vertical Stack */}
                <div className="max-w-4xl mx-auto px-4 mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Navegue por Tópicos</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <CategoryCard
                            icon={<UserCircleIcon className="w-8 h-8" />}
                            title="Perfil e Conta"
                            description="Configurações de conta, edição de perfil, foto e biografia."
                            topicKey="profile"
                        />
                        <CategoryCard
                            icon={<ShieldCheckIcon className="w-8 h-8" />}
                            title="Privacidade"
                            description="Segurança, senhas, bloqueios e visibilidade de dados."
                            topicKey="privacy"
                        />
                        <CategoryCard
                            icon={<CalendarIcon className="w-8 h-8" />}
                            title="Eventos EVO"
                            description="Inscrições, datas, locais e informações sobre imersões."
                            topicKey="events"
                        />
                        <CategoryCard
                            icon={<ChatBubbleIcon className="w-8 h-8" />}
                            title="Comunidade"
                            description="Interações, conexões, feed e diretrizes de convivência."
                            topicKey="community"
                        />
                    </div>
                </div>

                {/* FAQ Section - Single Column */}
                <div className="max-w-4xl mx-auto px-4 mb-20">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Perguntas Frequentes</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq, index) => (
                                <FAQItem key={index} question={faq.q} answer={faq.a} />
                            ))
                        ) : (
                            <p className="text-center text-slate-500 py-8">Nenhuma pergunta encontrada para sua busca.</p>
                        )}
                    </div>
                </div>

                {/* Contact CTA */}
                <div className="max-w-3xl mx-auto px-4">
                    <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-10 border border-slate-200/50 dark:border-slate-700/50 text-center shadow-xl shadow-evo-purple/5">
                        <div className="w-20 h-20 bg-evo-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-evo-purple ring-8 ring-evo-purple/5">
                            <MailIcon className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Ainda precisa de ajuda?</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
                            Se você não encontrou a resposta que procurava, nossa equipe está pronta para te ouvir.
                        </p>
                        <button
                            onClick={() => onNavigate && onNavigate('contact')}
                            className="px-10 py-4 rounded-2xl bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold shadow-lg shadow-evo-purple/20 hover:shadow-xl hover:shadow-evo-purple/30 hover:-translate-y-1 transition-all duration-300 lg:w-auto w-full"
                        >
                            Fale Conosco
                        </button>
                    </div>
                </div>

            </div>

            {/* Topic Popup Modal - Moved Outside Animated Container */}
            {selectedTopic && topicContent[selectedTopic] && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedTopic(null)}
                    ></div>
                    <div className="relative bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-fade-in-modal border border-slate-200/50 dark:border-slate-700/50">
                        <button
                            onClick={() => setSelectedTopic(null)}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 pr-8">
                            {topicContent[selectedTopic].title}
                        </h3>

                        <div className="space-y-4">
                            {topicContent[selectedTopic].items.map((item, idx) => (
                                <div key={idx} className="flex items-start space-x-3">
                                    <div className="mt-0.5">
                                        <CheckCircleIcon className="w-5 h-5 text-evo-purple flex-shrink-0" />
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Ainda tem dúvidas sobre este tópico?</p>
                            <button
                                onClick={() => { setSelectedTopic(null); onNavigate && onNavigate('contact'); }}
                                className="text-evo-purple font-bold hover:underline"
                            >
                                Falar com Suporte
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HelpCenterPage;
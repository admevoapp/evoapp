import React from 'react';
import { HeartPulseIcon, SparklesIcon, UsersIcon, ShieldCheckIcon } from './icons';

const AboutPage: React.FC = () => {
    return (
        <div className="w-full animate-fade-in space-y-12 pb-12">

            {/* Hero Section - Updated Structure */}
            <div className="text-center max-w-4xl mx-auto py-10">
                <div className="inline-block px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6">
                    Quem Somos
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                    Sobre o <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">EVOAPP</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
                    Mais do que uma rede social, somos um movimento. Uma comunidade dedicada a conectar Amantes Radicais de Pessoas que acreditam que a evolução é constante e coletiva.
                </p>
            </div>

            {/* Manifesto Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Nosso Manifesto
                    </h2>
                    <div className="prose prose-lg dark:prose-invert text-slate-600 dark:text-slate-300">
                        <p>
                            Nascemos da necessidade de continuar a jornada. Após as imersões, os cursos e os encontros presenciais, sentíamos que a chama precisava de um lugar para continuar ardendo.
                        </p>
                        <p>
                            O <strong>EVOAPP</strong> foi criado para ser esse lar digital. Um espaço seguro onde a vulnerabilidade é força, onde o crescimento é celebrado e onde ninguém caminha sozinho.
                        </p>
                        <p>
                            Acreditamos no <strong>Amor Radical</strong>: a capacidade de aceitar, acolher e impulsionar o outro, sem julgamentos, focando sempre na melhor versão de cada um.
                        </p>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-evo-purple to-secondary rounded-3xl p-1 rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="bg-surface-light dark:bg-[#0D0D0D] rounded-[20px] p-8 h-full flex flex-col justify-center items-center text-center relative overflow-hidden">
                        <SparklesIcon className="w-12 h-12 text-evo-purple mb-4" />
                        <blockquote className="text-xl md:text-2xl font-serif italic text-slate-700 dark:text-slate-200 relative z-10">
                            "A evolução não acontece no isolamento. É no encontro com o outro que descobrimos quem realmente somos."
                        </blockquote>
                        <div className="mt-6 w-16 h-1 bg-gradient-to-r from-evo-blue to-evo-orange rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Pillars Section */}
            <section>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">Nossos Pilares</h2>
                <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-evo-blue/50 transition-all group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <HeartPulseIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Conexão Real</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Fugimos da superficialidade. Aqui, buscamos interações que toquem a alma e construam laços duradouros baseados em valores compartilhados.
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-evo-purple/50 transition-all group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <UsersIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Comunidade Forte</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Somos uma família estendida. Family, Academy, Mission, Eagles... não importa sua etapa, importa que você faz parte do todo.
                            </p>
                        </div>
                    </div>

                    <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-evo-orange/50 transition-all group flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
                        <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <ShieldCheckIcon className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Segurança & Respeito</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Um ambiente moderado e cuidado para que você possa se expressar livremente, sabendo que está entre pessoas que respeitam sua história.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* History / Origin */}
            <section className="bg-[#121212] rounded-3xl overflow-hidden relative text-white p-8 md:p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-evo-purple/20 to-evo-blue/20"></div>
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Nossa Origem</h2>
                    <p className="text-lg text-slate-300 mb-6">
                        O projeto EVOAPP nasceu do desejo de manter viva a energia transformadora dos eventos presenciais. Percebemos que, ao voltar para casa, muitos se sentiam desconectados da egrégora que haviam experimentado.
                    </p>
                    <p className="text-lg text-slate-300">
                        Decidimos então construir uma ponte. Uma plataforma tecnológica com coração humano. Desenvolvida por membros da comunidade, para a comunidade. Cada linha de código foi escrita pensando em como facilitar o seu próximo grande encontro, sua próxima parceria ou simplesmente aquele abraço virtual que muda o dia.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
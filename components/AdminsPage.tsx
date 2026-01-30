import React, { useEffect, useState } from 'react';
import { ShieldCheckIcon, UserCircleIcon, StarIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { getProfileColors } from '../utils/profileUtils';
import { DEFAULT_AVATAR_URL } from '../constants';

const AdminsPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
    const [adminTeam, setAdminTeam] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const styleId = 'page-fade-in-animation';
        if (!document.getElementById(styleId)) {
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
        }
    }, []);

    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('app_role', 'admin'); // Fetches only admins, excluding 'master' and 'user'

                if (error) {
                    console.error('Error fetching admins:', error);
                } else if (data) {
                    // Map DB profiles to User type
                    const mappedAdmins: User[] = data.map((profile: any) => ({
                        id: profile.id,
                        name: profile.full_name || 'Administrador',
                        username: profile.username || 'admin',
                        avatarUrl: profile.avatar_url || DEFAULT_AVATAR_URL,
                        profession: profile.profession || 'Administrador',
                        behavioralProfile: profile.behavioral_profile,
                        app_role: profile.app_role,
                        // ... other fields if necessary
                    } as User));
                    setAdminTeam(mappedAdmins);
                }
            } catch (err) {
                console.error('Exception fetching admins:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAdmins();
    }, []);

    const AdminCard: React.FC<{ admin: User }> = ({ admin }) => {
        const behavioralColors = getProfileColors(admin.behavioralProfile);

        return (
            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md3-4 hover:-translate-y-1 transition-all duration-300 group text-center flex flex-col items-center">
                <div className="relative inline-block mb-4">
                    <img
                        src={admin.avatarUrl}
                        alt={admin.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-surface-light dark:border-surface-dark shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 right-0 bg-evo-purple text-white p-1.5 rounded-full border-2 border-surface-light dark:border-surface-dark" title="Administrador">
                        <ShieldCheckIcon className="w-4 h-4" />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{admin.name}</h3>
                <p className="text-sm text-evo-purple font-medium mb-2">@{admin.username}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wide text-[10px]">{admin.profession}</p>

                {/* Behavioral Profile Colors */}
                {behavioralColors.length > 0 && (
                    <div className="flex items-center space-x-1.5 mt-2" aria-label={`Perfil: ${admin.behavioralProfile}`}>
                        {behavioralColors.map((colorClass, index) => (
                            <span key={index} className={`block w-3 h-3 rounded-full ${colorClass}`} title={admin.behavioralProfile}></span>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full animate-fade-in-page space-y-12 pb-12">

            {/* Hero Section */}
            <div className="text-center max-w-4xl mx-auto py-10">
                <div className="inline-flex items-center px-4 py-1.5 bg-evo-purple/10 text-evo-purple rounded-full text-sm font-semibold mb-6 space-x-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Guardiões da Comunidade</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
                    Conheça nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange">Administradores</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                    Uma equipe dedicada a manter o EVOAPP um espaço seguro, organizado e inspirador para sua jornada de evolução.
                </p>
            </div>

            {/* Team Grid */}
            <section>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-evo-purple border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : adminTeam.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {adminTeam.map((admin) => (
                            <AdminCard key={admin.id} admin={admin} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <p>Nenhum administrador encontrado.</p>
                    </div>
                )}
            </section>

            {/* Roles Section */}
            <section className="bg-[#121212] rounded-3xl p-8 md:p-12 relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-tr from-evo-purple/10 to-evo-orange/10 pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-8 text-center">Nossas Responsabilidades</h2>

                    <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 hover:bg-white/10 transition-colors">
                            <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                                <ShieldCheckIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">Moderação & Segurança</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Garantimos que as diretrizes da comunidade sejam respeitadas, mantendo o ambiente livre de toxicidade e seguro para todos. Monitoramos atividades suspeitas e atuamos rapidamente para preservar a harmonia.</p>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 hover:bg-white/10 transition-colors">
                            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                                <StarIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">Curadoria de Conteúdo</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Selecionamos os melhores materiais para a Biblioteca EVO e organizamos os destaques para enriquecer seu aprendizado. Trazemos o que há de mais relevante para o seu crescimento pessoal e profissional.</p>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 hover:bg-white/10 transition-colors">
                            <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                                <UserCircleIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-white">Suporte ao Membro</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Estamos aqui para tirar dúvidas, resolver problemas técnicos e ouvir sugestões para melhorar a plataforma. Seu feedback é essencial para a nossa evolução constante.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="text-center py-12 px-4 bg-surface-light dark:bg-surface-dark rounded-3xl border border-slate-200/50 dark:border-slate-700/50">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Precisa falar com a administração?</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
                    Se você encontrou algum problema, tem uma sugestão de melhoria ou quer reportar algo, não hesite em nos contatar.
                </p>
                <button
                    onClick={() => onNavigate && onNavigate('contact')}
                    className="px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:scale-105 transition-transform duration-300">
                    Entrar em Contato
                </button>
            </section>

        </div>
    );
};

export default AdminsPage;

import React from 'react';
import { LogoIcon, InstagramIcon, YouTubeIcon, UsersIcon } from './icons';

interface FooterProps {
    className?: string;
    onNavigate?: (page: any) => void;
    isAuthenticated?: boolean;
}

const FooterHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-sm font-bold text-white tracking-wider uppercase mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
        {children}
    </h3>
);

const FooterLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
    <li>
        <a
            href={href}
            onClick={(e) => {
                if (onClick) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className="text-[15px] text-slate-400 hover:text-evo-purple hover:pl-1 transition-all duration-300 block py-1 cursor-pointer"
        >
            {children}
        </a>
    </li>
);

const Footer: React.FC<FooterProps> = ({ className, onNavigate, isAuthenticated }) => {
    return (
        <footer className={`bg-[#050505] border-t border-slate-800 relative overflow-hidden ${className || ''}`}>
            {/* Gradient Top Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange"></div>

            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-evo-blue/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-evo-purple/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

            <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">

                    {/* 1. Identidade (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">
                        <img
                            src="/images/logo-evoapp-fundo-escuro-300x65.png"
                            alt="EVOAPP"
                            className="h-10 w-auto"
                        />
                        <p className="text-slate-400 text-base leading-relaxed">
                            Conectando Amantes Radicais de Pessoas.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-gradient-to-br hover:from-evo-purple hover:to-evo-orange hover:text-white transition-all duration-300 group">
                                <InstagramIcon className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-300 group">
                                <YouTubeIcon className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* 2. Institucional & Políticas (3 cols) */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <FooterHeader>Institucional</FooterHeader>
                                <ul className="space-y-2">
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('about')}
                                    >
                                        Sobre o EVOAPP
                                    </FooterLink>
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('mission')}
                                    >
                                        Missão e Propósito
                                    </FooterLink>
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('how-it-works')}
                                    >
                                        Como Funciona
                                    </FooterLink>
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('admins')}
                                    >
                                        Administradores
                                    </FooterLink>
                                </ul>
                            </div>
                            <div>
                                <FooterHeader>Políticas</FooterHeader>
                                <ul className="space-y-2">
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('terms')}
                                    >
                                        Termos de Uso
                                    </FooterLink>
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('privacy')}
                                    >
                                        Privacidade
                                    </FooterLink>
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('guidelines')}
                                    >
                                        Diretrizes
                                    </FooterLink>
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('cookies')}
                                    >
                                        Cookies
                                    </FooterLink>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 3. Comunidade & Suporte (3 cols) */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {isAuthenticated && (
                                <div>
                                    <FooterHeader>Comunidade</FooterHeader>
                                    <ul className="space-y-2">
                                        <FooterLink
                                            href="#"
                                            onClick={() => onNavigate && onNavigate('premium')}
                                        >
                                            EVO+
                                        </FooterLink>
                                        <FooterLink
                                            href="#"
                                            onClick={() => onNavigate && onNavigate('central-evo')}
                                        >
                                            Central EVO
                                        </FooterLink>
                                        <FooterLink
                                            href="#"
                                            onClick={() => onNavigate && onNavigate('library')}
                                        >
                                            Biblioteca EVOAPP
                                        </FooterLink>
                                        <FooterLink
                                            href="#"
                                            onClick={() => onNavigate && onNavigate('best-practices')}
                                        >
                                            Boas Práticas
                                        </FooterLink>
                                        <FooterLink
                                            href="#"
                                            onClick={() => onNavigate && onNavigate('shop')}
                                        >
                                            EVO Store
                                        </FooterLink>
                                    </ul>
                                </div>
                            )}
                            <div>
                                <FooterHeader>Suporte</FooterHeader>
                                <ul className="space-y-2">
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('help-center')}
                                    >
                                        Central de Ajuda
                                    </FooterLink>
                                    <FooterLink
                                        href="#"
                                        onClick={() => onNavigate && onNavigate('contact')}
                                    >
                                        Fale Conosco
                                    </FooterLink>
                                    {isAuthenticated && (
                                        <FooterLink
                                            href="#"
                                            onClick={() => onNavigate && onNavigate('report')}
                                        >
                                            Denunciar
                                        </FooterLink>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 6. Contatos (3 cols) */}
                    <div className="lg:col-span-3 space-y-6">
                        <FooterHeader>Contatos</FooterHeader>
                        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 hover:border-evo-purple/50 transition-colors">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">E-mail</p>
                            <a href="mailto:admevoapp@gmail.com" className="text-slate-200 hover:text-evo-blue transition-colors text-sm">
                                admevoapp@gmail.com
                            </a>
                        </div>
                        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 hover:border-evo-purple/50 transition-colors">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Telefone</p>
                            <p className="text-slate-200 text-sm">
                                (31) 99999–9999
                            </p>
                        </div>
                    </div>
                </div>

                {/* 8. Direitos */}
                <div className="mt-16 pt-8 border-t border-slate-800 text-center">
                    <p className="text-slate-500 text-sm">
                        © 2026 EVOAPP — Feito com amor, para Amantes Radicais de Pessoas.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

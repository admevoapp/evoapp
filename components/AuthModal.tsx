import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { validateCPF } from '../lib/utils';
import { LogoIcon, EyeIcon, EyeOffIcon } from './icons';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
    onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onSuccess }) => {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot-password'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // Reset state when switching modes or opening
    React.useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError(null);
            setMessage(null);
            setEmail('');
            setPassword('');
            setFullName('');
            setCpf('');
        }
    }, [isOpen, initialMode]);

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '');
        return numbers
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCPF(e.target.value));
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'signup') {
                if (!validateCPF(cpf)) {
                    setError('CPF inválido. Por favor, verifique os números.');
                    setLoading(false);
                    return;
                }

                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            cpf: cpf.replace(/\D/g, ''),
                        },
                    },
                });

                if (signUpError) throw signUpError;

                setMessage('Cadastro realizado! Verifique seu email para confirmar.');
            } else if (mode === 'forgot-password') {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}`,
                });

                if (resetError) throw resetError;

                setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (signInError) throw signInError;

                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro durante a autenticação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all animate-fadeIn">

                {/* Header */}
                <div className="px-8 pt-8 pb-6 text-center">
                    <div className="mx-auto mb-6">
                        {/* Light Mode Logo */}
                        <img
                            src="https://static.wixstatic.com/media/8c7f55_9b887c8ceb744ce9a6eaf5fcea98de06~mv2.png"
                            alt="EVOAPP Logo"
                            className="h-12 w-auto mx-auto object-contain dark:hidden"
                        />
                        {/* Dark Mode Logo */}
                        <img
                            src="https://static.wixstatic.com/media/8c7f55_75ce25282b0a45fcadd8df9bae146b16~mv2.png"
                            alt="EVOAPP Logo"
                            className="h-12 w-auto mx-auto object-contain hidden dark:block"
                        />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {mode === 'login' ? 'Bem-vindo de volta!' : mode === 'signup' ? 'Crie sua conta ARP' : 'Recuperar Senha'}
                    </h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        {mode === 'login'
                            ? 'Entre para continuar sua jornada de evolução.'
                            : mode === 'signup'
                                ? 'Junte-se à comunidade de Amantes Radicais de Pessoas.'
                                : 'Digite seu email para receber um link de redefinição.'}
                    </p>
                </div>

                {/* Form */}
                <div className="px-8 pb-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm rounded-xl border border-green-100 dark:border-green-900/30">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        required={mode === 'signup'}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:border-evo-purple focus:ring-2 focus:ring-evo-purple/20 outline-none transition-all dark:text-white"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CPF</label>
                                    <input
                                        type="text"
                                        required={mode === 'signup'}
                                        value={cpf}
                                        onChange={handleCpfChange}
                                        maxLength={14}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:border-evo-purple focus:ring-2 focus:ring-evo-purple/20 outline-none transition-all dark:text-white"
                                        placeholder="000.000.000-00"
                                    />
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Exclusivo para Amantes Radicais de Pessoas
                                    </p>
                                </div>
                            </>
                        )}

                        {mode === 'forgot-password' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:border-evo-purple focus:ring-2 focus:ring-evo-purple/20 outline-none transition-all dark:text-white"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        )}

                        {mode !== 'forgot-password' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:border-evo-purple focus:ring-2 focus:ring-evo-purple/20 outline-none transition-all dark:text-white"
                                        placeholder="seu@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Senha</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:border-evo-purple focus:ring-2 focus:ring-evo-purple/20 outline-none transition-all dark:text-white pr-10"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? (
                                                <EyeOffIcon className="w-5 h-5" />
                                            ) : (
                                                <EyeIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot-password')}
                                    className="text-sm text-evo-purple hover:underline"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Processando...' : (mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Enviar Link')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            {mode === 'forgot-password' ? (
                                <button
                                    type="button"
                                    onClick={() => setMode('login')}
                                    className="text-evo-purple font-semibold hover:underline"
                                >
                                    Voltar para o Login
                                </button>
                            ) : (
                                <>
                                    {mode === 'login' ? "Ainda não tem uma conta? " : "Já tem uma conta? "}
                                    <button
                                        type="button"
                                        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                        className="text-evo-purple font-semibold hover:underline"
                                    >
                                        {mode === 'login' ? "Cadastre-se" : "Entre agora"}
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;

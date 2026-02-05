import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { LogoIcon, EyeIcon, EyeOffIcon } from './icons';

interface UpdatePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    isRecovery?: boolean;
}

const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose, isRecovery = false }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            setLoading(false);
            return;
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) throw updateError;

            setMessage('Senha atualizada com sucesso!');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => !isRecovery && onClose()}
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
                        Definir nova senha
                    </h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Digite sua nova senha abaixo.
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nova Senha</label>
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

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirmar Senha</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-slate-700 focus:border-evo-purple focus:ring-2 focus:ring-evo-purple/20 outline-none transition-all dark:text-white pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOffIcon className="w-5 h-5" />
                                    ) : (
                                        <EyeIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-evo-blue via-evo-purple to-evo-orange text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? 'Atualizando...' : 'Atualizar Senha'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePasswordModal;

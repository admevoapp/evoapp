import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import { PaperAirplaneIcon, XMarkIcon } from './icons';

interface SendBottleModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: User;
}

const SendBottleModal: React.FC<SendBottleModalProps> = ({ isOpen, onClose, currentUser }) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('bottle_messages')
                .insert({
                    sender_id: currentUser.id,
                    content: message.trim(),
                });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setMessage('');
                onClose();
            }, 2000);
        } catch (err) {
            console.error('Error sending bottle:', err);
            setError('Não foi possível enviar sua mensagem. Tente novamente.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl w-full max-w-md shadow-2xl transform transition-all scale-100 p-6 relative border border-slate-100 dark:border-white/10">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                {/* Content */}
                {!success ? (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-600 dark:text-purple-400">
                                <PaperAirplaneIcon className="w-6 h-6 transform -rotate-45 translate-x-1" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Escreva sua Mensagem</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Sua mensagem será entregue anonimamente a alguém.
                            </p>
                        </div>

                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escreva algo inspirador..."
                            className="w-full h-32 p-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-slate-700 dark:text-slate-200 mb-2"
                            maxLength={100}
                        />

                        <div className="flex justify-between items-center text-xs text-slate-400 mb-6">
                            <span>*A mensagem desaparece em 24h.</span>
                            <span>{message.length}/100</span>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
                        )}

                        <button
                            onClick={handleSend}
                            disabled={isSending || !message.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isSending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Lançar ao Mar</span>
                                    <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45 translate-y-[-2px]" />
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400 animate-bounce-short">
                            <PaperAirplaneIcon className="w-8 h-8 transform -rotate-45 translate-x-1" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Mensagem Enviada!</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Sua garrafa foi lançada ao mar digital.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SendBottleModal;

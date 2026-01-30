import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import SendBottleModal from './SendBottleModal';
import { SparklesIcon, PaperAirplaneIcon } from './icons';

interface BottleWidgetProps {
    currentUser: User;
}

interface BottleMessage {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
}

const BottleWidget: React.FC<BottleWidgetProps> = ({ currentUser }) => {
    const [message, setMessage] = useState<BottleMessage | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRandomMessage();
    }, []);

    const fetchRandomMessage = async () => {
        try {
            setLoading(true);
            // Call RPC function to get a random message
            const { data, error } = await supabase.rpc('get_random_bottle_message');

            if (error) throw error;

            if (data && data.length > 0) {
                setMessage(data[0]);
            } else {
                setMessage(null); // No messages found
            }
        } catch (err) {
            console.error('Error fetching bottle message:', err);
            // Silently fail or show subtle error
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-white/5 relative overflow-hidden group">

                {/* Glow Effect */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>

                <div className="flex flex-col items-center text-center relative z-10">

                    {/* Icon */}
                    <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-purple-50/50 dark:ring-purple-900/10">
                        <SparklesIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                        Mensagem na Garrafa
                    </h3>

                    {/* Content */}
                    <div className="mb-6 w-full">
                        {loading ? (
                            <div className="h-16 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                        ) : message ? (
                            <div className="animate-fade-in relative px-4">
                                <p className="text-slate-600 dark:text-slate-300 italic font-medium leading-relaxed font-serif text-lg">
                                    "{message.content}"
                                </p>
                            </div>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                O mar está calmo... Nenhuma garrafa à vista por enquanto.
                            </p>
                        )}
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-6 uppercase tracking-wide">
                        Uma mensagem anônima enviada por um ARP.
                    </p>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center space-x-2 group/btn"
                    >
                        <span>Enviar minha Garrafa</span>
                        <PaperAirplaneIcon className="w-5 h-5 transform -rotate-45 translate-y-[1px] group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            <SendBottleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentUser={currentUser}
            />
        </>
    );
};

export default BottleWidget;

import React from 'react';
import { XMarkIcon, UserMinusIcon, TrashIcon, CheckCircleIcon } from './icons';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'info' | 'success';
    isLoading?: boolean;
    icon?: React.ReactNode;
    isAlert?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type = 'danger',
    isLoading = false,
    icon,
    isAlert = false,
}) => {
    if (!isOpen) return null;

    const handleConfirmClick = () => {
        if (!isLoading) {
            onConfirm();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={isLoading ? undefined : onClose}
            />

            {/* Modal Card */}
            <div
                className="relative bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Close Button top-right */}
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}

                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-500/10' : type === 'success' ? 'bg-green-500/10' : 'bg-slate-100 dark:bg-slate-800'
                    }`}>
                    {icon ? icon : (
                        type === 'danger' ? (
                            <TrashIcon className="w-8 h-8 text-red-500" />
                        ) : type === 'success' ? (
                            <CheckCircleIcon className="w-8 h-8 text-green-500" />
                        ) : (
                            <UserMinusIcon className="w-8 h-8 text-slate-500" />
                        )
                    )}
                </div>

                {/* Title */}
                <h3 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {title}
                </h3>

                {/* Message */}
                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex flex-row space-x-3 w-full">
                    {!isAlert && (
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                        >
                            {cancelLabel}
                        </button>
                    )}

                    <button
                        onClick={handleConfirmClick}
                        disabled={isLoading}
                        className={`flex-1 px-4 py-3 rounded-xl font-semibold text-white shadow-lg transition-all disabled:opacity-70 disabled:cursor-wait ${isAlert ? 'w-full' : ''} ${type === 'danger'
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                            : type === 'success'
                                ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                                : 'bg-gradient-to-r from-evo-purple to-evo-orange shadow-evo-purple/20 hover:-translate-y-0.5'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>...</span>
                            </div>
                        ) : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

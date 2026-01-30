import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ConfirmModal from '../components/ConfirmModal';
import { BellIcon, TrashIcon, CheckCircleIcon, XMarkIcon } from '../components/icons';

type ModalType = 'alert' | 'confirm';

interface ModalOptions {
    title: string;
    message: string;
    icon?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'info' | 'success' | 'warning'; // Visual type
}

interface ModalContextType {
    showAlert: (title: string, message: string, options?: Partial<ModalOptions>) => Promise<void>;
    showConfirm: (title: string, message: string, options?: Partial<ModalOptions>) => Promise<boolean>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<ModalType>('alert');
    const [options, setOptions] = useState<ModalOptions>({ title: '', message: '' });
    const [resolvePromise, setResolvePromise] = useState<(value: any) => void>(() => { });

    const showAlert = useCallback((title: string, message: string, opts?: Partial<ModalOptions>) => {
        return new Promise<void>((resolve) => {
            setMode('alert');
            setOptions({
                title,
                message,
                confirmLabel: 'OK',
                type: 'info',
                ...opts
            });
            setResolvePromise(() => resolve); // Just resolve
            setIsOpen(true);
        });
    }, []);

    const showConfirm = useCallback((title: string, message: string, opts?: Partial<ModalOptions>) => {
        return new Promise<boolean>((resolve) => {
            setMode('confirm');
            setOptions({
                title,
                message,
                confirmLabel: 'Confirmar',
                cancelLabel: 'Cancelar',
                type: 'danger',
                ...opts
            } as any);
            setResolvePromise(() => resolve);
            setIsOpen(true);
        });
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        if (mode === 'confirm') {
            resolvePromise(false);
        } else {
            resolvePromise(undefined);
        }
    };

    const handleConfirm = () => {
        setIsOpen(false);
        if (mode === 'confirm') {
            resolvePromise(true);
        } else {
            resolvePromise(undefined);
        }
    };

    return (
        <ModalContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <ConfirmModal
                isOpen={isOpen}
                onClose={handleClose}
                onConfirm={handleConfirm}
                title={options.title}
                message={options.message}
                confirmLabel={options.confirmLabel}
                cancelLabel={options.cancelLabel}
                icon={options.icon}
                isAlert={mode === 'alert'}
                type={options.type}
            />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};

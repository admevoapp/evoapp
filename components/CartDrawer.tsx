import React from 'react';
import { useCart } from '../contexts/CartContext';
import { ShoppingBagIcon, XMarkIcon, TrashIcon, CheckCircleIcon, SparklesIcon } from './icons';

const CartDrawer: React.FC = () => {
    const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={toggleCart} />

            <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md transform transition-transform duration-500 bg-surface-light dark:bg-surface-dark shadow-xl flex flex-col h-full border-l border-slate-200 dark:border-slate-800">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20 backdrop-blur-md">
                        <div className="flex items-center space-x-3">
                            <ShoppingBagIcon className="w-6 h-6 text-evo-purple" />
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Seu Carrinho</h2>
                            <span className="bg-evo-purple/10 text-evo-purple text-xs font-bold px-2 py-1 rounded-full">
                                {cart.length} itens
                            </span>
                        </div>
                        <button
                            onClick={toggleCart}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-slate-500">
                                <ShoppingBagIcon className="w-16 h-16 opacity-20" />
                                <p className="text-lg font-medium">Seu carrinho está vazio</p>
                                <button
                                    onClick={toggleCart}
                                    className="text-evo-purple font-bold hover:underline"
                                >
                                    Continuar comprando
                                </button>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="flex gap-4 animate-fade-in">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-[#121212] rounded-xl overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700">
                                        {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : item.category === 'Assinatura' ? (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-evo-purple to-evo-blue">
                                                <SparklesIcon className="w-8 h-8 text-white" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBagIcon className="w-8 h-8 text-slate-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-green-500 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                R$ {Number(item.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors h-fit"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-surface-light dark:bg-surface-dark safe-bottom">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-slate-500 dark:text-slate-400">Total</span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    R$ {cartTotal.toFixed(2)}
                                </span>
                            </div>
                            <button className="w-full py-4 bg-gradient-to-r from-evo-purple to-evo-blue text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-2">
                                <CheckCircleIcon className="w-6 h-6" />
                                <span>Finalizar Compra</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;

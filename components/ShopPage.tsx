
import React, { useState, useEffect } from 'react';
import { ShoppingBagIcon, SearchIcon, StarIcon, ArrowLeftIcon, CheckCircleIcon, TruckIcon, ShieldCheckIcon, XMarkIcon } from './icons';
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

const ShopPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            setQuantity(1);
        }
    }, [selectedProduct]);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique categories from products
    const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category))).filter(Boolean)];

    // Lógica de filtragem
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="w-full pb-12 relative">
            <div className="w-full space-y-8 animate-fade-in">
                {selectedProduct ? (
                    // Product Detail View
                    <div className="w-full animate-fade-in">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 hover:text-evo-purple mb-6 transition-colors font-medium"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span>Voltar para a Loja</span>
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {/* Product Image */}
                            <div className="bg-surface-light dark:bg-surface-dark rounded-3xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#121212] flex items-center justify-center">
                                    {selectedProduct.image_url ? (
                                        <img
                                            src={selectedProduct.image_url}
                                            alt={selectedProduct.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 cursor-zoom-in"
                                            onClick={() => setPreviewImage(selectedProduct.image_url || null)}
                                        />
                                    ) : (
                                        <ShoppingBagIcon className="w-32 h-32 text-slate-300" />
                                    )}
                                    {selectedProduct.badge && (
                                        <div className="absolute top-4 left-4 bg-evo-blue text-slate-900 text-xs font-bold uppercase px-3 py-1.5 rounded shadow-lg">
                                            {selectedProduct.badge}
                                        </div>
                                    )}
                                    {!selectedProduct.badge && selectedProduct.is_new && (
                                        <div className="absolute top-4 left-4 bg-evo-blue text-slate-900 text-xs font-bold uppercase px-3 py-1.5 rounded shadow-lg">
                                            Lançamento
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-8">
                                <div>
                                    <div className="text-evo-purple font-semibold uppercase tracking-wider text-sm mb-2">{selectedProduct.category}</div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">{selectedProduct.name}</h1>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">R$ {Number(selectedProduct.price).toFixed(2)}</p>
                                </div>

                                <div className="prose prose-slate dark:prose-invert">
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                        {selectedProduct.description}
                                    </p>
                                </div>

                                {selectedProduct.features && selectedProduct.features.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-bold text-slate-900 dark:text-white">Destaques:</h3>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedProduct.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                                                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Quantidade</span>
                                            {selectedProduct.stock !== undefined && (
                                                <span className={`text-xs font-semibold ${selectedProduct.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} disponíveis` : 'Indisponível'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                                                disabled={quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center font-bold text-slate-900 dark:text-white">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(Math.min(selectedProduct.stock || 99, quantity + 1))}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
                                                disabled={quantity >= (selectedProduct.stock || 99)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => addToCart(selectedProduct, quantity)}
                                        disabled={selectedProduct.stock === 0}
                                        className={`w-full py-4 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-3 
                                            ${selectedProduct.stock === 0
                                                ? 'bg-slate-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-evo-purple to-evo-blue hover:shadow-xl hover:scale-[1.02]'}`}
                                    >
                                        <ShoppingBagIcon className="w-6 h-6" />
                                        <span className="text-lg">{selectedProduct.stock === 0 ? 'Esgotado' : 'Adicionar ao Carrinho'}</span>
                                    </button>
                                    <p className="text-center text-xs text-slate-500 mt-3">Pagamento seguro e entrega para todo o Brasil.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl flex flex-col items-center text-center">
                                        <TruckIcon className="w-6 h-6 text-slate-400 mb-2" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Frete & Entrega</span>
                                        <span className="text-xs text-slate-500">{selectedProduct.shipping_info || 'Frete Grátis para compras acima de R$ 299'}</span>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl flex flex-col items-center text-center">
                                        <ShieldCheckIcon className="w-6 h-6 text-slate-400 mb-2" />
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Garantia</span>
                                        <span className="text-xs text-slate-500">{selectedProduct.warranty_info || 'Garantia EVO - 30 dias para troca'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Shop Grid View
                    <>
                        {/* Header / Hero Loja */}
                        <div className="mb-8 relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#1C1C1E] border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-gradient-to-br from-evo-purple/10 to-evo-blue/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 bg-gradient-to-tr from-evo-orange/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

                            {/* Hero Illustration (Behind Text) */}
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none opacity-[0.03] dark:opacity-[0.02] lg:opacity-[0.06] lg:dark:opacity-[0.04] lg:-mr-12">
                                <div className="absolute inset-0 bg-gradient-to-tr from-evo-purple/20 to-evo-blue/20 rounded-full blur-2xl"></div>
                                <ShoppingBagIcon className="w-full h-full text-slate-900 dark:text-white transform -rotate-12" />
                            </div>

                            <div className="relative z-10 w-full max-w-2xl px-2">
                                <div className="inline-flex items-center space-x-2 mb-6 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 backdrop-blur-sm relative z-20">
                                    <StarIcon className="w-4 h-4 text-evo-yellow" filled />
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">Loja Oficial</span>
                                </div>

                                <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1] relative z-20">
                                    EVO <span className="text-transparent bg-clip-text bg-gradient-to-r from-evo-purple to-evo-blue">Store</span>
                                </h1>

                                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-lg font-light relative z-20">
                                    Produtos exclusivos que traduzem nosso propósito. Vista a camisa e leve a evolução com você.
                                </p>

                                {/* Modern Search Bar (Full Width) */}
                                <div className="relative w-full group relative z-20">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-evo-purple to-evo-blue rounded-2xl opacity-20 group-hover:opacity-100 transition duration-500 blur-sm group-focus-within:opacity-100 group-focus-within:duration-200"></div>
                                    <div className="relative flex items-center bg-white dark:bg-[#151515] rounded-xl shadow-sm">
                                        <div className="pl-4 text-slate-400 group-focus-within:text-evo-purple transition-colors">
                                            <SearchIcon className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="O que você procura hoje?"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full py-4 px-4 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 text-base"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modern Categories Tabs */}
                        <div className="mb-8">
                            <div className="flex flex-wrap gap-3 pb-4 pt-2 px-1">
                                {categories.map((cat, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`
                                            px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 transform hover:-translate-y-0.5
                                            ${selectedCategory === cat
                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-black/50'
                                                : 'bg-white dark:bg-[#1C1C1E] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/10'
                                            }
                                        `}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="text-center py-20 text-slate-500">Carregando produtos...</div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        onClick={() => setSelectedProduct(product)}
                                        className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-[#121212] flex items-center justify-center">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPreviewImage(product.image_url || null);
                                                    }}
                                                />
                                            ) : (
                                                <ShoppingBagIcon className="w-20 h-20 text-slate-300" />
                                            )}

                                            {product.badge && (
                                                <div className="absolute top-3 left-3 bg-evo-blue text-slate-900 text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                                                    {product.badge}
                                                </div>
                                            )}
                                            {!product.badge && product.is_new && (
                                                <div className="absolute top-3 left-3 bg-evo-blue text-slate-900 text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                                                    Novo
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl hover:bg-evo-purple hover:text-white">
                                                    Ver Detalhes
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">{product.category}</p>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 line-clamp-1">{product.name}</h3>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-xl font-bold text-evo-purple">R$ {Number(product.price).toFixed(2)}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addToCart(product);
                                                    }}
                                                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-evo-purple hover:text-white transition-colors"
                                                >
                                                    <ShoppingBagIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                    <SearchIcon className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Nenhum produto encontrado</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Tente buscar por outro termo ou categoria.</p>
                            </div>
                        )}


                    </>
                )}
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewImage(null)}>
                    <button className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                    <img
                        src={previewImage}
                        alt="Zoom"
                        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-zoom-in"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default ShopPage;

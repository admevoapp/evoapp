
import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ShoppingBagIcon, UploadIcon, PencilIcon, EyeIcon, EyeOffIcon } from '../icons';
import { useModal } from '../../contexts/ModalContext';
import { supabase } from '../../lib/supabaseClient';
import { Product } from '../../types';
import ImageCropper from './ImageCropper';

const AdminShop: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const { showConfirm, showAlert } = useModal();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        category: '',
        stock: '',
        description: '',
        image_url: '',
        badge: '',
        shipping_info: 'Frete Grátis para compras acima de R$ 299',
        warranty_info: 'Garantia EVO - 30 dias para troca'
    });
    const [uploading, setUploading] = useState(false);

    // Cropper State
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            showAlert('Erro', 'Erro ao carregar produtos.', { type: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setCroppingImage(reader.result as string);
                setShowCropper(true);
            });
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const handleCropComplete = async (croppedImageBlob: Blob) => {
        setShowCropper(false);
        if (!croppedImageBlob) return;

        try {
            setUploading(true);
            const fileExt = 'jpg';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('shop')
                .upload(filePath, croppedImageBlob, {
                    contentType: 'image/jpeg'
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('shop').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
            showAlert('Sucesso', 'Imagem carregada com sucesso!', { type: 'success' });
        } catch (error) {
            console.error('Error uploading image:', error);
            showAlert('Erro', 'Erro ao fazer upload da imagem.', { type: 'danger' });
        } finally {
            setUploading(false);
            setCroppingImage(null);
        }
    };

    const handleCancelCrop = () => {
        setShowCropper(false);
        setCroppingImage(null);
    };

    const handleEdit = (product: Product) => {
        setFormData({
            name: product.name,
            price: product.price.toString(),
            category: product.category || '',
            stock: (product.stock || 0).toString(),
            description: product.description || '',
            image_url: product.image_url || '',
            badge: product.badge || '',
            shipping_info: product.shipping_info || 'Frete Grátis para compras acima de R$ 299',
            warranty_info: product.warranty_info || 'Garantia EVO - 30 dias para troca'
        });
        setEditingId(product.id);
        setIsAdding(true);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData({ name: '', price: '', category: '', stock: '', description: '', image_url: '', badge: '', shipping_info: 'Frete Grátis para compras acima de R$ 299', warranty_info: 'Garantia EVO - 30 dias para troca' });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price) {
            return showAlert('Erro', 'Preencha os campos obrigatórios (Nome e Preço).', { type: 'warning' });
        }

        try {
            const priceValue = parseFloat(formData.price.replace(',', '.'));
            const productData = {
                name: formData.name,
                price: isNaN(priceValue) ? 0 : priceValue,
                category: formData.category,
                stock: parseInt(formData.stock) || 0,
                description: formData.description,
                image_url: formData.image_url,
                badge: formData.badge,
                shipping_info: formData.shipping_info,
                warranty_info: formData.warranty_info,
            };

            let error;
            if (editingId) {
                // Update
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingId);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([{ ...productData, active: true, is_new: true }]);
                error = insertError;
            }

            if (error) throw error;

            showAlert('Sucesso', `Produto ${editingId ? 'atualizado' : 'criado'} com sucesso!`, { type: 'success' });
            handleCancel(); // Resets state
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            showAlert('Erro', 'Erro ao salvar produto.', { type: 'danger' });
        }
    };

    const toggleActive = async (product: Product) => {
        try {
            const newStatus = !product.active;
            const { error } = await supabase
                .from('products')
                .update({ active: newStatus })
                .eq('id', product.id);

            if (error) throw error;

            // Optimistic update or refetch
            setProducts(products.map(p => p.id === product.id ? { ...p, active: newStatus } : p));
        } catch (error) {
            console.error('Error updating status:', error);
            showAlert('Erro', 'Erro ao atualizar status do produto.', { type: 'danger' });
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Excluir produto?', 'Tem certeza que deseja excluir este produto?', { type: 'danger' });
        if (confirmed) {
            try {
                const { error } = await supabase.from('products').delete().eq('id', id);
                if (error) throw error;
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                showAlert('Erro', 'Erro ao excluir produto.', { type: 'danger' });
            }
        }
    };

    return (
        <div className="space-y-8 animate-fade-in relative">
            {showCropper && croppingImage && (
                <ImageCropper
                    imageSrc={croppingImage}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCancelCrop}
                    aspect={1} // Square for products usually, or 4/3? Let's assume square or 1:1
                />
            )}
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">EVO Store</h2>
                    <p className="text-slate-400 mt-2">Gerencie produtos, estoque e pedidos.</p>
                </div>
                <button onClick={() => { handleCancel(); setIsAdding(true); }} className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    <span>Novo Produto</span>
                </button>
            </header>

            {isAdding && (
                <div className="bg-[#1C1C1E] p-6 rounded-2xl border border-white/10 max-w-2xl">
                    <h3 className="text-lg font-bold text-white mb-4">{editingId ? 'Editar Produto' : 'Cadastrar Produto'}</h3>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nome do Produto"
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                placeholder="Preço (ex: 89.90)"
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                            />
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                placeholder="Estoque"
                                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                            />
                        </div>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            placeholder="Categoria (Vestuário, Acessórios, etc)"
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                        />
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Descrição do produto"
                            className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none min-h-[100px]"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-400 block">Etiqueta (Badge)</label>
                                <select
                                    name="badge"
                                    value={formData.badge}
                                    onChange={handleInputChange}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none"
                                >
                                    <option value="">Sem etiqueta</option>
                                    <option value="Lançamento">Lançamento</option>
                                    <option value="Promoção">Promoção</option>
                                    <option value="Exclusivo">Exclusivo</option>
                                    <option value="Mais Vendido">Mais Vendido</option>
                                    <option value="Últimas Unidades">Últimas Unidades</option>
                                    <option value="Recomendado">Recomendado</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 border-t border-white/5 pt-4">
                            <h4 className="text-white font-bold text-sm mb-2">Informações Adicionais</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Texto de Frete</label>
                                    <input
                                        type="text"
                                        name="shipping_info"
                                        value={formData.shipping_info}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Frete Grátis..."
                                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 block mb-1">Texto de Garantia</label>
                                    <input
                                        type="text"
                                        name="warranty_info"
                                        value={formData.warranty_info}
                                        onChange={handleInputChange}
                                        placeholder="Ex: Garantia EVO - 30 dias..."
                                        className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-evo-orange outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center text-slate-400 cursor-pointer hover:border-evo-orange/50 transition-colors relative">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {uploading ? (
                                <span>Enviando...</span>
                            ) : formData.image_url ? (
                                <div className="flex flex-col items-center">
                                    <img src={formData.image_url} alt="Preview" className="h-20 w-20 object-cover rounded mb-2" />
                                    <span className="text-xs text-green-500">Imagem carregada!</span>
                                </div>
                            ) : (
                                <>
                                    <UploadIcon className="w-8 h-8 mx-auto mb-2" />
                                    <span>Upload de Imagem</span>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button onClick={handleCancel} className="px-4 py-2 text-slate-400">Cancelar</button>
                            <button onClick={handleSave} className="px-6 py-2 rounded-xl bg-evo-orange text-white font-bold hover:bg-evo-orange/90 transition-colors">Salvar</button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center text-slate-500 py-10">Carregando produtos...</div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {products.map(product => (
                        <div key={product.id} className={`bg-[#1C1C1E] p-4 rounded-2xl border ${!product.active ? 'border-red-500/20 opacity-75' : 'border-white/10'} flex items-center justify-between group transition-all`}>
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 overflow-hidden relative">
                                    {product.image_url ? (
                                        <img src={product.image_url} alt={product.name} className={`w-full h-full object-cover ${!product.active ? 'grayscale' : ''}`} />
                                    ) : (
                                        <ShoppingBagIcon className="w-8 h-8" />
                                    )}
                                    {!product.active && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <EyeOffIcon className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                        {product.name}
                                        {!product.active && <span className="text-xs bg-red-500/20 text-red-500 px-2 py-0.5 rounded">Oculto</span>}
                                    </h4>
                                    <p className="text-sm text-slate-400">{product.category} • R$ {Number(product.price).toFixed(2)}</p>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${(product.stock || 0) < 20 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                                        {product.stock} em estoque
                                    </span>
                                </div>
                            </div>
                            <div className="flex space-x-2 transition-opacity">
                                <button
                                    onClick={() => toggleActive(product)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                                    title={product.active ? "Ocultar" : "Exibir"}
                                >
                                    {product.active ? <EyeIcon className="w-5 h-5" /> : <EyeOffIcon className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-evo-blue transition-colors"
                                    title="Editar"
                                >
                                    <PencilIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Excluir"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && !loading && (
                        <div className="text-center text-slate-500 py-10">Nenhum produto cadastrado.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminShop;

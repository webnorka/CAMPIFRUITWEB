import { useState, useMemo, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Save,
    Search,
    Filter,
    Package,
    CheckCircle2,
    Tag,
    TrendingDown,
    Layers,
    ChevronDown,
    CheckSquare,
    Square,
    Percent,
    DollarSign
} from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useConfig } from '../context/ConfigContext';
import { formatPrice } from '../utils/whatsapp';
import ImageUpload from '../components/ImageUpload';

export default function ProductEditor({ setHasUnsavedChanges }) {
    const {
        products,
        addProduct,
        editProduct,
        deleteProduct,
        batchUpdateProducts,
        batchDeleteProducts,
        categories
    } = useProducts();
    const { config } = useConfig();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [saved, setSaved] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBatchTools, setShowBatchTools] = useState(false);

    // Form state
    const emptyProduct = {
        name: '',
        description: '',
        price: 0,
        offerPrice: 0,
        onSale: false,
        category: categories[0] || 'General',
        image: '',
        weight: ''
    };
    const [formData, setFormData] = useState(emptyProduct);

    // Track unsaved changes
    useEffect(() => {
        const isDirty = (isAdding || editingId !== null) && !saved;
        if (setHasUnsavedChanges) setHasUnsavedChanges(isDirty);
    }, [isAdding, editingId, saved, setHasUnsavedChanges]);

    // Filtering logic
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchTerm, categoryFilter]);

    // Batch operations state
    const [batchAction, setBatchAction] = useState({ type: '', value: '' });

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleBatchUpdate = async () => {
        if (selectedIds.length === 0) return;

        let updates = {};
        if (batchAction.type === 'discount') {
            const factor = (100 - Number(batchAction.value)) / 100;
            // This is complex because we need to update each product based on its own price
            // So we use a custom loop or update the context to handle this
            // For now, let's just support fixed values or category changes
            alert('El descuento por lote se aplicará a los precios actuales.');
            products.forEach(p => {
                if (selectedIds.includes(p.id)) {
                    const newOfferPrice = Math.round(p.price * factor);
                    editProduct(p.id, { offerPrice: newOfferPrice, onSale: true });
                }
            });
        } else if (batchAction.type === 'category') {
            await batchUpdateProducts(selectedIds, { category: batchAction.value });
        } else if (batchAction.type === 'remove_offers') {
            await batchUpdateProducts(selectedIds, { onSale: false, offerPrice: 0 });
        } else if (batchAction.type === 'delete') {
            if (window.confirm(`¿Eliminar ${selectedIds.length} productos definitivamente?`)) {
                await batchDeleteProducts(selectedIds);
            }
        }

        setSelectedIds([]);
        setBatchAction({ type: '', value: '' });
        setShowBatchTools(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({ ...emptyProduct, ...product });
        setIsAdding(false);
    };

    const handleAdd = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData(emptyProduct);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
        setFormData(emptyProduct);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await editProduct(editingId, formData);
            } else {
                await addProduct(formData);
            }
            setSaved(true);
            setTimeout(() => {
                setSaved(false);
                handleCancel();
            }, 1500);
        } catch (error) {
            console.error('Detailed Error:', error);
            alert(`Error al guardar: ${error.message || 'Consulta la consola para más detalles'}`);
        }
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12 px-2">
                <div>
                    <h2 className="text-4xl font-display font-black text-forest tracking-tight">Catálogo maestro</h2>
                    <p className="text-forest/40 font-bold uppercase tracking-[0.2em] text-xs mt-2">Gestiona {products.length} productos naturales</p>
                </div>

                <div className="flex items-center gap-4">
                    {selectedIds.length > 0 && (
                        <button
                            onClick={() => setShowBatchTools(!showBatchTools)}
                            className="flex items-center gap-3 bg-white text-forest font-black py-4 px-8 rounded-3xl shadow-xl shadow-forest/5 border border-white hover:bg-forest hover:text-white transition-all duration-300"
                        >
                            <Layers className="w-5 h-5 text-accent" />
                            Acciones ({selectedIds.length})
                        </button>
                    )}
                    <button
                        onClick={handleAdd}
                        className="btn-primary group h-16 px-8 text-sm uppercase tracking-[0.2em]"
                    >
                        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-12 bg-white/60 backdrop-blur-xl p-4 rounded-4xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-forest/20 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 h-16 bg-white border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-forest placeholder:text-forest/20"
                    />
                </div>

                <div className="flex items-center gap-4 bg-white px-6 rounded-[1.25rem] h-16">
                    <Filter className="w-5 h-5 text-forest/20" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-transparent border-none py-2 pr-10 outline-none focus:ring-0 font-black text-xs uppercase tracking-widest text-forest/60 appearance-none cursor-pointer"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%231A2F1A\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0 center', backgroundSize: '1rem' }}
                    >
                        <option value="All">Categoría: todas</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center gap-3 h-16 px-8 bg-forest/5 hover:bg-forest/10 rounded-[1.25rem] text-forest font-black text-xs uppercase tracking-widest transition-all"
                >
                    {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? (
                        <CheckSquare className="w-5 h-5 text-primary-500" />
                    ) : (
                        <Square className="w-5 h-5 opacity-20" />
                    )}
                    {selectedIds.length === filteredProducts.length ? 'Deseleccionar' : 'Seleccionar Todo'}
                </button>
            </div>

            {/* Batch Tools Panel */}
            {showBatchTools && (
                <div className="mb-12 p-8 bg-forest border border-white/10 rounded-5xl text-white shadow-2xl animate-slide-up relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Layers className="w-32 h-32" />
                    </div>
                    <div className="relative flex flex-col md:flex-row items-end gap-6">
                        <div className="flex-1 space-y-3">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1">Operación Masiva</label>
                            <select
                                value={batchAction.type}
                                onChange={(e) => setBatchAction({ ...batchAction, type: e.target.value })}
                                className="w-full bg-white/10 border-white/10 text-white rounded-2xl h-14 px-6 outline-none focus:ring-2 focus:ring-accent font-bold"
                            >
                                <option value="" className="text-forest">Elige una acción...</option>
                                <option value="discount" className="text-forest">Aplicar Descuento (%)</option>
                                <option value="category" className="text-forest">Cambiar Categoría</option>
                                <option value="remove_offers" className="text-forest">Quitar todas las ofertas</option>
                                <option value="delete" className="text-forest">Eliminar Permanente</option>
                            </select>
                        </div>

                        {(batchAction.type === 'discount' || batchAction.type === 'category') && (
                            <div className="flex-1 space-y-3 animate-fade-in">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-1">
                                    {batchAction.type === 'discount' ? 'Porcentaje' : 'Nueva Categoría'}
                                </label>
                                {batchAction.type === 'discount' ? (
                                    <div className="relative">
                                        <Percent className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                                        <input
                                            type="number"
                                            placeholder="Ej: 15"
                                            value={batchAction.value}
                                            onChange={(e) => setBatchAction({ ...batchAction, value: e.target.value })}
                                            className="w-full pl-14 pr-6 h-14 bg-white/10 border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-accent font-black text-xl"
                                        />
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        list="categories-list"
                                        placeholder="Nueva categoría..."
                                        value={batchAction.value}
                                        onChange={(e) => setBatchAction({ ...batchAction, value: e.target.value })}
                                        className="w-full h-14 px-6 bg-white/10 border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-accent font-bold"
                                    />
                                )}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleBatchUpdate}
                                disabled={!batchAction.type || ((batchAction.type === 'discount' || batchAction.type === 'category') && !batchAction.value)}
                                className="h-14 px-10 bg-accent text-forest font-black uppercase text-xs tracking-widest rounded-2xl disabled:opacity-30 transition-all shadow-xl shadow-accent/20"
                            >
                                Ejecutar ({selectedIds.length})
                            </button>
                            <button
                                onClick={() => setShowBatchTools(false)}
                                className="h-14 px-6 bg-white/5 text-white/50 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/10"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Editor Modal */}
            {(isAdding || editingId) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-forest/80 backdrop-blur-xl" onClick={handleCancel} />

                    <div className="relative w-full max-w-5xl bg-organic rounded-5xl shadow-2xl overflow-hidden animate-slide-up max-h-[95vh] flex flex-col border border-white/40">
                        <div className="flex items-center justify-between p-10 bg-white/50 border-b border-gray-100">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-primary-100 rounded-3xl flex items-center justify-center shadow-inner">
                                    <Package className="w-8 h-8 text-primary-500" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-display font-black text-forest leading-tight tracking-tight">
                                        {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                                    </h3>
                                    <p className="text-[10px] font-black text-forest/30 uppercase tracking-[0.2em] mt-1">Configuración técnica del catálogo</p>
                                </div>
                            </div>
                            <button onClick={handleCancel} className="p-4 hover:bg-white rounded-3xl transition-all text-forest/20 hover:text-forest border border-transparent hover:border-gray-200">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="bg-white p-2 rounded-4xl shadow-sm border border-gray-100">
                                        <ImageUpload
                                            currentImage={formData.image}
                                            onUpload={(url) => setFormData({ ...formData, image: url })}
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Nombre Comercial</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="input-field mt-3 text-xl font-black bg-white"
                                                placeholder="Ej: Piña Golden"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Categoría</label>
                                                <div className="relative mt-3">
                                                    <select
                                                        required
                                                        value={formData.category}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'NEW') {
                                                                const newCat = prompt('Nombre de la nueva categoría:');
                                                                if (newCat) setFormData({ ...formData, category: newCat });
                                                            } else {
                                                                setFormData({ ...formData, category: e.target.value });
                                                            }
                                                        }}
                                                        className="input-field pr-12 bg-white appearance-none"
                                                    >
                                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                        {!categories.includes(formData.category) && formData.category && (
                                                            <option key={formData.category} value={formData.category}>{formData.category}</option>
                                                        )}
                                                        <option value="NEW" className="text-primary-600 font-bold">+ Nueva categoría...</option>
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/20 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Unidad/Medida</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ej: 500g"
                                                    value={formData.weight}
                                                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                                    className="input-field mt-3 bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-forest rounded-4xl p-8 text-white space-y-8 shadow-2xl shadow-forest/20">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-display font-black text-xl flex items-center gap-3">
                                                <TrendingDown className="w-6 h-6 text-accent" />
                                                Precio y Descuentos
                                            </h4>
                                            {formData.onSale && formData.price > 0 && formData.offerPrice > 0 && (
                                                <span className="bg-accent text-forest font-black px-4 py-1.5 rounded-full text-xs animate-bounce">
                                                    -{Math.round(((formData.price - formData.offerPrice) / formData.price) * 100)}%
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">Precio Base ({config.currencySymbol})</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.price === 0 ? '' : formData.price}
                                                    onChange={(e) => {
                                                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                        if (!isNaN(val)) setFormData({ ...formData, price: val });
                                                    }}
                                                    className="w-full bg-white/10 border-white/10 rounded-2xl h-16 px-6 outline-none focus:ring-2 focus:ring-accent font-black text-3xl text-white mt-3"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div className="pt-8 border-t border-white/10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            onClick={() => setFormData({ ...formData, onSale: !formData.onSale })}
                                                            className={`w-14 h-8 rounded-full transition-all relative cursor-pointer ${formData.onSale ? 'bg-accent' : 'bg-white/10'}`}
                                                        >
                                                            <div className={`absolute top-1 w-6 h-6 rounded-full transition-all ${formData.onSale ? 'left-7 bg-forest' : 'left-1 bg-white/40'}`} />
                                                        </div>
                                                        <span className={`font-black text-xs uppercase tracking-widest ${formData.onSale ? 'text-accent' : 'text-white/30'}`}>Oferta activa</span>
                                                    </div>
                                                </div>

                                                {formData.onSale && (
                                                    <div className="animate-slide-up space-y-6">
                                                        <div className="grid grid-cols-2 gap-6">
                                                            <div>
                                                                <label className="text-[10px] font-black text-accent/60 uppercase tracking-[0.3em] ml-1">Precio Oferta</label>
                                                                <input
                                                                    type="text"
                                                                    value={formData.offerPrice === 0 ? '' : formData.offerPrice}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value === '' ? 0 : Number(e.target.value);
                                                                        if (!isNaN(val)) setFormData({ ...formData, offerPrice: val });
                                                                    }}
                                                                    className="w-full bg-accent/10 border-accent/20 rounded-2xl h-16 px-6 outline-none focus:ring-2 focus:ring-accent font-black text-2xl text-accent mt-3"
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-black text-accent/60 uppercase tracking-[0.3em] ml-1">% Descuento</label>
                                                                <div className="relative mt-3">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Ej: 20"
                                                                        onChange={(e) => {
                                                                            const pct = Number(e.target.value);
                                                                            if (!isNaN(pct) && formData.price > 0) {
                                                                                const newOffer = Math.round(formData.price * (1 - pct / 100));
                                                                                setFormData({ ...formData, offerPrice: newOffer });
                                                                            }
                                                                        }}
                                                                        className="w-full bg-accent/10 border-accent/20 rounded-2xl h-16 px-10 outline-none focus:ring-2 focus:ring-accent font-black text-2xl text-accent"
                                                                    />
                                                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-forest/40 uppercase tracking-[0.3em] ml-1">Descripción del Producto</label>
                                        <textarea
                                            rows={5}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="input-field mt-3 resize-none font-medium text-forest/60 bg-white py-5"
                                            placeholder="Detalles sobre origen, maduración o beneficios..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-10 border-t border-gray-100 bg-white/30 backdrop-blur-md flex flex-col sm:flex-row justify-end gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-10 py-5 text-forest/40 font-black uppercase tracking-widest text-xs hover:bg-white rounded-2xl transition-all"
                            >
                                Descartar Cambios
                            </button>
                            <button
                                onClick={handleSubmit}
                                className={`min-w-[280px] h-16 btn-primary shadow-2xl shadow-primary-500/30 uppercase tracking-[0.2em] ${saved ? 'bg-forest' : ''}`}
                            >
                                {saved ? (
                                    <>
                                        <CheckCircle2 className="w-6 h-6 text-accent" />
                                        ¡Actualizado!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-6 h-6 mr-2" />
                                        {editingId ? 'Guardar Cambios' : 'Lanzar al Catálogo'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List Header with Statistics */}
            <div className="mb-8 flex items-center justify-between px-4">
                <span className="text-[10px] font-black text-forest/40 uppercase tracking-[0.3em]">
                    Visualizando {filteredProducts.length} de {products.length} productos
                </span>
                {selectedIds.length > 0 && (
                    <span className="text-[10px] font-black text-forest bg-accent px-4 py-2 rounded-full uppercase tracking-widest shadow-lg shadow-accent/10">
                        {selectedIds.length} seleccionados para acción
                    </span>
                )}
            </div>

            {/* Grid of cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map(product => {
                    const isSelected = selectedIds.includes(product.id);
                    return (
                        <div
                            key={product.id}
                            onClick={() => selectedIds.length > 0 && toggleSelect(product.id)}
                            className={`card-bento relative p-6 group transition-all duration-500 cursor-pointer border-2 shadow-none hover:translate-y-[-4px] ${isSelected ? 'border-primary-500 bg-primary-50/50' : 'border-transparent'
                                }`}
                        >
                            {/* Selection Checkbox Overlay */}
                            <div
                                onClick={(e) => { e.stopPropagation(); toggleSelect(product.id); }}
                                className={`absolute top-6 left-6 z-10 w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-forest border-forest' : 'bg-white/90 border-forest/10 opacity-0 group-hover:opacity-100'
                                    }`}
                            >
                                {isSelected && <CheckCircle2 className="w-5 h-5 text-accent" />}
                            </div>

                            <div className="flex gap-6 mb-8">
                                <div className="relative flex-shrink-0">
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                                        <img
                                            src={product.image || '/placeholder-product.jpg'}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    {product.onSale && (
                                        <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-lg shadow-rose-500/20 rotate-12">
                                            OFERTA
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h4 className="font-display font-black text-forest truncate text-xl tracking-tight mb-2 leading-tight">
                                        {product.name}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[9px] font-black text-primary-500 bg-primary-100/50 px-2 py-1 rounded-md uppercase tracking-widest">
                                            {product.category}
                                        </span>
                                        {product.weight && (
                                            <span className="text-[9px] font-black text-forest/30 uppercase tracking-widest">{product.weight}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-end justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-forest/30 uppercase tracking-[0.2em] mb-1">Precio Unitario</span>
                                    <div className="flex items-baseline gap-2">
                                        {product.onSale ? (
                                            <>
                                                <span className="text-2xl font-black text-primary-500">
                                                    {formatPrice(product.offerPrice, config.currencySymbol)}
                                                </span>
                                                <span className="text-sm font-bold text-forest/20 line-through">
                                                    {formatPrice(product.price, config.currencySymbol)}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-2xl font-black text-forest">
                                                {formatPrice(product.price, config.currencySymbol)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(product); }}
                                        className="h-12 w-12 flex items-center justify-center bg-white border border-gray-100 text-forest/40 hover:text-primary-500 hover:border-primary-200 rounded-2xl shadow-sm transition-all active:scale-95"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                                        className="h-12 w-12 flex items-center justify-center bg-white border border-gray-100 text-rose-300 hover:text-rose-500 hover:border-rose-200 rounded-2xl shadow-sm transition-all active:scale-95"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-40 bg-white/60 backdrop-blur-xl rounded-5xl border-2 border-dashed border-gray-100">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <Package className="w-12 h-12 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-forest tracking-tight">Vaya, está vacío</h3>
                    <p className="text-forest/40 font-bold uppercase tracking-widest text-xs mt-3">No hay productos que coincidan con tu búsqueda</p>
                </div>
            )}

            {/* Hidden category data list for auto-complete */}
            <datalist id="categories-list">
                {categories.map(c => <option key={c} value={c} />)}
            </datalist>
        </div>
    );
}

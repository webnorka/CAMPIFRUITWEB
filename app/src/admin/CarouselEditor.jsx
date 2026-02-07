import { useState, useMemo } from 'react';
import { useConfirm } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Save,
    GripVertical,
    Image as ImageIcon,
    Link,
    ShoppingBag,
    CheckCircle2,
    Eye,
    EyeOff,
    Tag
} from 'lucide-react';
import { useCarousel } from '../context/CarouselContext';
import { useProducts } from '../context/ProductsContext';
import ImageUpload from '../components/ImageUpload';

export default function CarouselEditor({ setHasUnsavedChanges }) {
    const confirm = useConfirm();
    const toast = useToast();
    const { products } = useProducts();
    const { slides, addSlide, editSlide, deleteSlide, reorderSlides, loading } = useCarousel();

    const [editingSlide, setEditingSlide] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        type: 'image',
        productId: '',
        imageUrl: '',
        title: '',
        subtitle: '',
        ctaText: '',
        ctaUrl: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const onSaleProducts = useMemo(() => products.filter(p => p.onSale), [products]);

    const handleAdd = () => {
        setIsAdding(true);
        setEditingSlide(null);
        setFormData({
            type: 'image',
            productId: '',
            imageUrl: '',
            title: '',
            subtitle: '',
            ctaText: '',
            ctaUrl: ''
        });
    };

    const handleEdit = (slide) => {
        setEditingSlide(slide);
        setIsAdding(false);
        setFormData({
            type: slide.type,
            productId: slide.productId || '',
            imageUrl: slide.imageUrl || '',
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            ctaText: slide.ctaText || '',
            ctaUrl: slide.ctaUrl || ''
        });
    };

    const handleCancel = () => {
        setEditingSlide(null);
        setIsAdding(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const slideData = {
            type: formData.type,
            productId: formData.type === 'product' ? formData.productId : null,
            imageUrl: formData.imageUrl || null,
            title: formData.title || null,
            subtitle: formData.subtitle || null,
            ctaText: formData.ctaText || null,
            ctaUrl: formData.ctaUrl || null,
            displayOrder: isAdding ? slides.length : editingSlide.displayOrder,
            active: true
        };

        try {
            if (isAdding) {
                await addSlide(slideData);
            } else {
                await editSlide(editingSlide.id, slideData);
            }
            handleCancel();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            toast.error('Error al guardar el slide');
        }
    };

    const handleDelete = async (id) => {
        if (!await confirm('¿Eliminar este slide del carrusel?')) return;
        try {
            await deleteSlide(id);
        } catch (error) {
            console.error('Error deleting slide:', error);
        }
    };

    const handleToggleActive = async (slide) => {
        try {
            await editSlide(slide.id, { active: !slide.active });
        } catch (error) {
            console.error('Error toggling slide:', error);
        }
    };

    // Drag and drop
    const handleDragStart = (e, slide) => e.dataTransfer.setData('slideId', slide.id);
    const handleDragOver = (e) => e.preventDefault();

    const handleDrop = async (e, targetSlide) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('slideId');
        if (draggedId === targetSlide.id) return;

        const newOrder = [...slides];
        const draggedIndex = newOrder.findIndex(s => s.id === draggedId);
        const targetIndex = newOrder.findIndex(s => s.id === targetSlide.id);
        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, removed);

        // Update order using context
        try {
            await reorderSlides(newOrder);
        } catch (error) {
            console.error('Error reordering slides:', error);
        }
    };

    const getSlidePreview = (slide) => {
        if (slide.type === 'product' && slide.productId) {
            const product = products.find(p => p.id === slide.productId);
            return product?.image || slide.imageUrl;
        }
        return slide.imageUrl;
    };

    const getSlideTitle = (slide) => {
        if (slide.type === 'product' && slide.productId) {
            const product = products.find(p => p.id === slide.productId);
            return product?.name || slide.title;
        }
        return slide.title || 'Slide sin título';
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-display font-black text-forest tracking-tight">Carrusel de Ofertas</h2>
                    <p className="text-forest/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        Configura los slides del hero
                    </p>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-3 bg-forest text-accent px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-forest/20 hover:scale-105 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Slide
                </button>
            </div>

            {/* Success toast */}
            {showSuccess && (
                <div className="fixed top-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Guardado correctamente</span>
                </div>
            )}

            {/* Add/Edit Form */}
            {(isAdding || editingSlide) && (
                <div className="card-bento bg-white mb-8 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-display font-black text-forest">
                                {isAdding ? 'Nuevo Slide' : 'Editar Slide'}
                            </h3>
                            <button type="button" onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-forest/40" />
                            </button>
                        </div>

                        {/* Slide Type Selector */}
                        <div>
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-3">
                                Tipo de Slide
                            </label>
                            <div className="flex gap-4">
                                {[
                                    { value: 'image', icon: ImageIcon, label: 'Imagen' },
                                    { value: 'product', icon: ShoppingBag, label: 'Producto' },
                                    { value: 'offer', icon: Tag, label: 'Oferta' }
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: type.value })}
                                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${formData.type === type.value
                                            ? 'border-accent bg-accent/10 text-forest'
                                            : 'border-forest/5 text-forest/40 hover:border-forest/20'
                                            }`}
                                    >
                                        <type.icon className="w-5 h-5" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Selector (only for product type) */}
                        {formData.type === 'product' && (
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Seleccionar Producto
                                </label>
                                <select
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                >
                                    <option value="">Elige un producto...</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} {p.onSale ? '(EN OFERTA)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Image (for image/offer types or as fallback) */}
                        {formData.type !== 'product' && (
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Imagen
                                </label>
                                <ImageUpload
                                    currentImage={formData.imageUrl}
                                    onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                                />
                            </div>
                        )}

                        {/* Title & Subtitle */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                    placeholder="Título del slide"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Subtítulo
                                </label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                    placeholder="Subtítulo opcional"
                                />
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Texto del Botón
                                </label>
                                <input
                                    type="text"
                                    value={formData.ctaText}
                                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                    placeholder="Ej: Ver Oferta"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    URL del Botón
                                </label>
                                <input
                                    type="text"
                                    value={formData.ctaUrl}
                                    onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                    placeholder="/catalogo o https://..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-4 text-forest/40 font-black uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition-all text-[10px]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-3 bg-forest text-accent px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-forest/20 hover:scale-105 transition-all"
                            >
                                <Save className="w-4 h-4" />
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Slides List */}
            <div className="card-bento bg-white">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-forest/30">Cargando slides...</p>
                    </div>
                ) : slides.length === 0 ? (
                    <div className="py-20 text-center">
                        <ImageIcon className="w-16 h-16 text-forest/5 mx-auto mb-6" />
                        <p className="font-black text-forest/20 uppercase tracking-widest text-sm mb-6">No hay slides en el carrusel</p>
                        <button onClick={handleAdd} className="text-accent-dark font-bold hover:underline">
                            Crear el primer slide
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-forest/5">
                        {slides.map((slide) => (
                            <div
                                key={slide.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, slide)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, slide)}
                                className={`flex items-center gap-6 p-6 hover:bg-organic/30 transition-all cursor-move ${!slide.active ? 'opacity-50' : ''}`}
                            >
                                <div className="text-forest/20 hover:text-forest/40 transition-colors">
                                    <GripVertical className="w-5 h-5" />
                                </div>

                                {/* Preview */}
                                <div className="w-24 h-16 rounded-xl bg-organic overflow-hidden flex-shrink-0">
                                    {getSlidePreview(slide) ? (
                                        <img src={getSlidePreview(slide)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-forest/10" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${slide.type === 'product' ? 'bg-blue-100 text-blue-600' :
                                            slide.type === 'offer' ? 'bg-amber-100 text-amber-600' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                            {slide.type}
                                        </span>
                                    </div>
                                    <h4 className="font-black text-forest truncate">{getSlideTitle(slide)}</h4>
                                    {slide.subtitle && <p className="text-forest/40 text-sm truncate">{slide.subtitle}</p>}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleToggleActive(slide)}
                                        className={`p-3 rounded-xl transition-all ${slide.active ? 'hover:bg-emerald-50 text-emerald-500' : 'hover:bg-gray-100 text-forest/20'}`}
                                    >
                                        {slide.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                    </button>
                                    <button onClick={() => handleEdit(slide)} className="p-3 hover:bg-forest/5 rounded-xl transition-all text-forest/40 hover:text-forest">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(slide.id)} className="p-3 hover:bg-rose-50 rounded-xl transition-all text-rose-300 hover:text-rose-500">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

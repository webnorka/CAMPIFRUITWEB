import { X, Plus, Check, Tag, ShoppingCart } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/whatsapp';

export default function ProductQuickView({ product, onClose }) {
    const { config } = useConfig();
    const { addToCart, items } = useCart();
    const [added, setAdded] = useState(false);

    const inCart = items.find(item => item.id === product.id);
    const quantity = inCart?.quantity || 0;

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };

    // Close on ESC
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const discount = product.onSale
        ? Math.round((1 - product.offerPrice / product.price) * 100)
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-forest/70 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-3xl bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-forest hover:text-white transition-all shadow-lg border border-forest/5"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row overflow-y-auto">
                    {/* Image */}
                    <div className="relative w-full md:w-1/2 aspect-square shrink-0 bg-organic">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />

                        {/* Offer badge */}
                        {product.onSale && (
                            <div className="absolute top-4 left-4 bg-accent text-forest text-xs font-black px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border border-forest/5">
                                <Tag className="w-4 h-4" />
                                -{discount}%
                            </div>
                        )}

                        {/* Quantity indicator */}
                        {quantity > 0 && (
                            <div className="absolute bottom-4 left-4 bg-forest text-accent text-sm font-black px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                {quantity} en cesta
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-6 sm:p-10 flex flex-col">
                        {/* Category */}
                        <span className="text-[9px] font-black text-forest/30 uppercase tracking-[0.3em] mb-3">
                            {product.category}
                        </span>

                        {/* Name */}
                        <h2 className="text-3xl sm:text-4xl font-display font-black text-forest tracking-tight leading-tight mb-4">
                            {product.name}
                        </h2>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-forest/50 leading-relaxed mb-6 font-medium">
                            {product.description || 'Producto fresco de Campifruit, seleccionado con el máximo cuidado para garantizar la mejor calidad.'}
                        </p>

                        {/* Weight */}
                        {product.weight && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-organic rounded-xl border border-forest/5 mb-6 w-fit">
                                <span className="text-[9px] font-black text-forest/40 uppercase tracking-widest">Formato</span>
                                <span className="text-sm font-black text-forest">{product.weight}</span>
                            </div>
                        )}

                        {/* Spacer */}
                        <div className="flex-1" />

                        {/* Price section */}
                        <div className="flex items-end justify-between gap-4 pt-6 border-t border-forest/5">
                            <div className="flex flex-col">
                                {product.onSale ? (
                                    <>
                                        <span className="text-3xl sm:text-4xl font-black text-forest leading-none">
                                            {formatPrice(product.offerPrice, config.currencySymbol)}
                                        </span>
                                        <span className="text-sm font-bold text-forest/20 line-through mt-1.5">
                                            {formatPrice(product.price, config.currencySymbol)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-3xl sm:text-4xl font-black text-forest leading-none">
                                        {formatPrice(product.price, config.currencySymbol)}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={handleAdd}
                                className={`min-w-[160px] h-14 sm:h-16 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] transition-all duration-300 active:scale-95 shadow-xl flex items-center justify-center gap-2.5 ${added
                                    ? 'bg-accent text-forest border border-forest/5'
                                    : 'bg-forest text-accent hover:bg-forest/90 border border-forest/10'
                                    }`}
                            >
                                {added ? (
                                    <><Check className="w-4 h-4 sm:w-5 sm:h-5" /> ¡Añadido!</>
                                ) : (
                                    <><Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Añadir</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

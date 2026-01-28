import { Plus, Check, Tag } from 'lucide-react';
import { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/whatsapp';

export default function ProductCard({ product }) {
    const { config } = useConfig();
    const { addToCart, items } = useCart();
    const [added, setAdded] = useState(false);

    const inCart = items.find(item => item.id === product.id);
    const quantity = inCart?.quantity || 0;

    const handleAdd = () => {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1000);
    };

    return (
        <div className="card-bento group overflow-hidden flex flex-col h-full bg-white">
            {/* Image container */}
            <div className="relative aspect-square overflow-hidden m-5 rounded-[2rem] bg-organic">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                />

                {/* Standardized Offer Tag */}
                {product.onSale && (
                    <div className="absolute top-4 right-4 bg-accent text-forest text-[11px] font-black px-4 py-2 rounded-xl shadow-xl z-20 animate-bounce-short flex items-center gap-1.5 border border-forest/5">
                        <Tag className="w-3.5 h-3.5" />
                        -{Math.round((1 - (product.offerPrice / product.price)) * 100)}%
                    </div>
                )}

                {/* Weight badge */}
                {product.weight && (
                    <div className="absolute bottom-4 left-4 bg-forest/80 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-xl shadow-sm z-10 border border-white/10 uppercase tracking-[0.1em]">
                        {product.weight}
                    </div>
                )}

                {/* Quantity badge */}
                {quantity > 0 && (
                    <div className="absolute -top-1 -left-1 bg-accent text-forest text-xs font-black w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white z-20 animate-bounce-short">
                        {quantity}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-8 pt-0 flex-1 flex flex-col">
                {/* Category & Offer Price Save */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black text-forest/30 uppercase tracking-[0.3em]">
                        {product.category}
                    </span>
                    {product.onSale && (
                        <span className="text-[9px] font-black text-accent-dark uppercase tracking-widest px-2 py-1 bg-accent/10 rounded-lg">
                            Gran Oferta
                        </span>
                    )}
                </div>

                {/* Name */}
                <h3 className="text-2xl font-display font-black text-forest mb-3 leading-tight tracking-tight">
                    {product.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-forest/50 mb-8 line-clamp-2 font-medium leading-relaxed">
                    {product.description}
                </p>

                {/* Price and Add button */}
                <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        {product.onSale ? (
                            <>
                                <span className="text-2xl font-black text-forest leading-none">
                                    {formatPrice(product.offerPrice, config.currencySymbol)}
                                </span>
                                <span className="text-xs font-bold text-forest/20 line-through mt-1.5 ml-0.5">
                                    {formatPrice(product.price, config.currencySymbol)}
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-black text-forest leading-none">
                                {formatPrice(product.price, config.currencySymbol)}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAdd}
                        className={`min-w-[140px] h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 shadow-xl flex items-center justify-center gap-2 ${added
                            ? 'bg-accent text-forest border border-forest/5'
                            : 'bg-forest text-accent hover:bg-forest/90 border border-forest/10'
                            }`}
                    >
                        {added ? (
                            <><Check className="w-4 h-4" /> ¡En Cesta!</>
                        ) : (
                            <><Plus className="w-4 h-4" /> Comprar</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

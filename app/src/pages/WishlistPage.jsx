import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronRight, ShoppingBag, X } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductsContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { formatPrice } from '../utils/whatsapp';
import SEOHead from '../components/SEOHead';

export default function WishlistPage() {
    const { wishlistIds, toggleWishlist, loading: wishLoading } = useWishlist();
    const { products } = useProducts();
    const { isAuthenticated, loading: authLoading } = useCustomerAuth();
    const { addItem } = useCart();
    const { config } = useConfig();

    const wishlistProducts = products.filter(p => wishlistIds.has(p.id));

    if (authLoading) {
        return (
            <main className="bg-organic min-h-screen pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="h-8 w-48 bg-forest/5 rounded-xl animate-pulse mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse" />
                        ))}
                    </div>
                </div>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="bg-organic min-h-screen pt-32 pb-16 flex items-center justify-center">
                <div className="text-center px-4">
                    <Heart className="w-16 h-16 text-forest/15 mx-auto mb-4" />
                    <h1 className="text-2xl font-display font-black text-forest mb-2">Favoritos</h1>
                    <p className="text-sm text-forest/40 font-medium mb-6">Inicia sesión para guardar tus productos favoritos</p>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/90 transition-all shadow-xl"
                    >
                        Ir al Catálogo
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-organic min-h-screen pt-24 sm:pt-32 pb-16">
            <SEOHead title="Favoritos" noindex />
            <div className="max-w-4xl mx-auto px-4 sm:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[10px] font-bold text-forest/40 mb-8" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-forest transition-colors">Inicio</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-forest font-black">Favoritos</span>
                </nav>

                <h1 className="text-3xl font-display font-black text-forest tracking-tight mb-2">Favoritos</h1>
                <p className="text-sm text-forest/40 font-medium mb-8">{wishlistProducts.length} producto{wishlistProducts.length !== 1 ? 's' : ''}</p>

                {wishlistProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="w-16 h-16 text-forest/10 mx-auto mb-4" />
                        <p className="text-forest/40 font-medium mb-6">Aún no tienes favoritos</p>
                        <Link
                            to="/catalogo"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/90 transition-all shadow-xl"
                        >
                            Explorar Catálogo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-forest/5 overflow-hidden group">
                                {/* Image */}
                                <Link to={`/producto/${product.slug || product.id}`} className="relative block aspect-square overflow-hidden">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    {product.onSale && (
                                        <span className="absolute top-4 left-4 px-3 py-1.5 bg-accent text-forest text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                            Oferta
                                        </span>
                                    )}
                                </Link>

                                {/* Info */}
                                <div className="p-5">
                                    <Link to={`/producto/${product.slug || product.id}`}>
                                        <h3 className="text-base font-black text-forest mb-1 hover:text-forest/70 transition-colors truncate">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center gap-2 mb-4">
                                        {product.onSale ? (
                                            <>
                                                <span className="text-lg font-black text-forest">{formatPrice(product.offerPrice, config.currencySymbol)}</span>
                                                <span className="text-xs font-bold text-forest/20 line-through">{formatPrice(product.price, config.currencySymbol)}</span>
                                            </>
                                        ) : (
                                            <span className="text-lg font-black text-forest">{formatPrice(product.price, config.currencySymbol)}</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => addItem(product)}
                                            className="flex-1 h-10 bg-forest text-accent rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-forest/90 transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            Añadir
                                        </button>
                                        <button
                                            onClick={() => toggleWishlist(product.id)}
                                            className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                                            aria-label="Quitar de favoritos"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

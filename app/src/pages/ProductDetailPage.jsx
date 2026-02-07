import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronRight, Plus, Check, Minus, Tag, ShoppingCart, Heart, ArrowLeft, Package } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { useFamilies } from '../context/FamiliesContext';
import { useConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/whatsapp';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { supabase } from '../utils/supabaseClient';

export default function ProductDetailPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { families } = useFamilies();
    const { config } = useConfig();
    const { addToCart, items, updateQuantity } = useCart();
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loadingVariants, setLoadingVariants] = useState(false);

    // Find product by slug (slug = id for existing products)
    const product = products.find(p => p.slug === slug || p.id === slug);
    const family = product ? families.find(f => f.id === product.familyId) : null;
    // Match cart item considering variant
    const inCart = product ? items.find(item => {
        if (selectedVariant) return item.id === product.id && item.variantId === selectedVariant.id;
        return item.id === product.id && !item.variantId;
    }) : null;
    const cartQty = inCart?.quantity || 0;

    // Related products: same family, excluding current
    const relatedProducts = product
        ? products.filter(p => p.familyId === product.familyId && p.id !== product.id).slice(0, 4)
        : [];

    // Determine effective price based on selected variant or product
    const activeItem = selectedVariant || product;
    const effectivePrice = activeItem?.onSale ? (activeItem.offerPrice || activeItem.offer_price) : activeItem?.price;
    const discount = product?.onSale
        ? Math.round((1 - product.offerPrice / product.price) * 100)
        : 0;

    const handleAddToCart = () => {
        const cartItem = {
            ...product,
            price: selectedVariant ? selectedVariant.price : product.price,
            offerPrice: selectedVariant ? (selectedVariant.offer_price || selectedVariant.price) : product.offerPrice,
            weight: selectedVariant?.weight || product.weight,
            ...(selectedVariant ? {
                variantId: selectedVariant.id,
                variantName: selectedVariant.name
            } : {}),
            quantity: qty
        };
        addToCart(cartItem);
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [slug]);

    // Fetch variants when product has_variants
    useEffect(() => {
        if (product?.has_variants) {
            setLoadingVariants(true);
            supabase.from('product_variants').select('*').eq('product_id', product.id).eq('active', true).order('name')
                .then(({ data }) => {
                    const v = data || [];
                    setVariants(v);
                    if (v.length > 0) setSelectedVariant(v[0]);
                    setLoadingVariants(false);
                })
                .catch(() => setLoadingVariants(false));
        } else {
            setVariants([]);
            setSelectedVariant(null);
        }
    }, [product?.id, product?.has_variants]);

    if (loading) {
        return (
            <main className="bg-organic min-h-screen pt-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                        <div className="aspect-square rounded-[2rem] bg-forest/5 animate-pulse" />
                        <div className="space-y-6 py-8">
                            <div className="h-4 w-32 bg-forest/5 rounded-xl animate-pulse" />
                            <div className="h-10 w-3/4 bg-forest/5 rounded-xl animate-pulse" />
                            <div className="h-24 w-full bg-forest/5 rounded-xl animate-pulse" />
                            <div className="h-12 w-48 bg-forest/5 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!product) {
        return (
            <main className="bg-organic min-h-screen pt-32 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-24 h-24 mx-auto mb-6 bg-forest/5 rounded-full flex items-center justify-center">
                        <Package className="w-10 h-10 text-forest/30" />
                    </div>
                    <h1 className="text-3xl font-display font-black text-forest mb-3">Producto no encontrado</h1>
                    <p className="text-forest/50 mb-8 font-medium">Este producto no existe o ha sido retirado del catálogo.</p>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-forest/90 transition-all shadow-xl"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Ver Catálogo
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-organic min-h-screen pt-24 sm:pt-32 pb-16 sm:pb-24">
            <SEOHead
                title={product.name}
                description={product.description || `${product.name} — fresco y de temporada`}
                image={product.image}
                type="product"
                structuredData={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": product.name,
                    "description": product.description,
                    "image": product.image,
                    "offers": {
                        "@type": "Offer",
                        "price": product.onSale ? product.offerPrice : product.price,
                        "priceCurrency": "EUR",
                        "availability": "https://schema.org/InStock"
                    }
                }}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-forest/40 mb-8 sm:mb-12 overflow-x-auto whitespace-nowrap" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-forest transition-colors">Inicio</Link>
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    <Link to="/catalogo" className="hover:text-forest transition-colors">Catálogo</Link>
                    {family && (
                        <>
                            <ChevronRight className="w-3 h-3 shrink-0" />
                            <Link to={`/catalogo?familia=${family.slug}`} className="hover:text-forest transition-colors">{family.name}</Link>
                        </>
                    )}
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    <span className="text-forest font-black truncate">{product.name}</span>
                </nav>

                {/* Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white shadow-xl border border-forest/5">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Offer badge */}
                            {product.onSale && (
                                <div className="absolute top-4 sm:top-6 left-4 sm:left-6 bg-accent text-forest text-sm sm:text-base font-black px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-forest/5">
                                    <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
                                    -{discount}%
                                </div>
                            )}

                            {/* Cart indicator */}
                            {cartQty > 0 && (
                                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 bg-forest text-accent text-sm font-black px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" />
                                    {cartQty} en cesta
                                </div>
                            )}

                            {/* Weight badge */}
                            {product.weight && (
                                <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 bg-white/90 backdrop-blur-sm text-forest text-xs font-black px-4 py-2 rounded-xl shadow-lg border border-forest/5 uppercase tracking-widest">
                                    {product.weight}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col py-2 lg:py-8">
                        {/* Category */}
                        <span className="text-[9px] sm:text-[10px] font-black text-forest/30 uppercase tracking-[0.3em] mb-4">
                            {family?.name || product.category}
                        </span>

                        {/* Product Name */}
                        <h1 className="text-3xl sm:text-5xl font-display font-black text-forest tracking-tight leading-[1.1] mb-4 sm:mb-6">
                            {product.name}
                        </h1>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-forest/50 leading-relaxed mb-8 font-medium max-w-lg">
                            {product.description || 'Producto fresco de Campifruit, seleccionado con cuidado para garantizar la máxima calidad y frescura.'}
                        </p>

                        {/* Product Details (weight, SKU) */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {product.weight && (
                                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-forest/5 shadow-sm">
                                    <span className="text-[8px] font-black text-forest/30 uppercase tracking-widest">Formato</span>
                                    <span className="text-sm font-black text-forest">{product.weight}</span>
                                </div>
                            )}
                            {product.sku && (
                                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-forest/5 shadow-sm">
                                    <span className="text-[8px] font-black text-forest/30 uppercase tracking-widest">SKU</span>
                                    <span className="text-sm font-bold text-forest/60">{product.sku}</span>
                                </div>
                            )}
                            {product.stock != null && (
                                <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border shadow-sm ${product.stock > 0
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                                    }`}>
                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Stock</span>
                                    <span className="text-sm font-black">
                                        {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Spacer */}
                        <div className="flex-1 min-h-4" />

                        {/* Variant Selector */}
                        {product.has_variants && variants.length > 0 && (
                            <div className="mb-6">
                                <span className="text-[9px] font-black text-forest/30 uppercase tracking-[0.3em] mb-3 block">Formato</span>
                                <div className="flex flex-wrap gap-2">
                                    {variants.map(v => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 border-2 ${selectedVariant?.id === v.id
                                                ? 'bg-forest text-accent border-forest shadow-lg scale-[1.02]'
                                                : 'bg-white text-forest/70 border-forest/10 hover:border-forest/30 hover:bg-forest/5'
                                                }`}
                                        >
                                            {v.name}
                                            <span className="block text-[9px] mt-0.5 font-bold opacity-60">
                                                {formatPrice(v.price, config.currencySymbol)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {loadingVariants && (
                            <div className="mb-6 flex items-center gap-2 text-forest/30">
                                <div className="w-4 h-4 border-2 border-forest/10 border-t-forest rounded-full animate-spin" />
                                <span className="text-xs font-bold">Cargando variantes...</span>
                            </div>
                        )}

                        {/* Price & Add to Cart */}
                        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl border border-forest/5">
                            {/* Price */}
                            <div className="flex items-end gap-4 mb-6">
                                {product.onSale || (selectedVariant && selectedVariant.offer_price && selectedVariant.offer_price < selectedVariant.price) ? (
                                    <>
                                        <span className="text-4xl sm:text-5xl font-black text-forest leading-none">
                                            {formatPrice(selectedVariant ? (selectedVariant.offer_price || selectedVariant.price) : product.offerPrice, config.currencySymbol)}
                                        </span>
                                        <div className="flex flex-col pb-1">
                                            <span className="text-base sm:text-lg font-bold text-forest/20 line-through">
                                                {formatPrice(selectedVariant ? selectedVariant.price : product.price, config.currencySymbol)}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-4xl sm:text-5xl font-black text-forest leading-none">
                                        {formatPrice(selectedVariant ? selectedVariant.price : product.price, config.currencySymbol)}
                                    </span>
                                )}
                            </div>

                            {/* Quantity Selector + Add Button */}
                            <div className="flex items-center gap-4">
                                {/* Quantity Selector */}
                                <div className="flex items-center bg-organic rounded-2xl border border-forest/5">
                                    <button
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-forest/5 rounded-l-2xl transition-colors"
                                        aria-label="Reducir cantidad"
                                    >
                                        <Minus className="w-4 h-4 text-forest" />
                                    </button>
                                    <span className="w-12 sm:w-16 text-center text-lg font-black text-forest">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() => setQty(q => q + 1)}
                                        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center hover:bg-forest/5 rounded-r-2xl transition-colors"
                                        aria-label="Aumentar cantidad"
                                    >
                                        <Plus className="w-4 h-4 text-forest" />
                                    </button>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock != null && product.stock <= 0}
                                    className={`flex-1 h-12 sm:h-14 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.97] shadow-xl flex items-center justify-center gap-2.5 ${product.stock != null && product.stock <= 0
                                        ? 'bg-forest/20 text-forest/40 cursor-not-allowed'
                                        : added
                                            ? 'bg-accent text-forest border border-forest/5'
                                            : 'bg-forest text-accent hover:bg-forest/90 border border-forest/10'
                                        }`}
                                >
                                    {product.stock != null && product.stock <= 0 ? (
                                        <>Agotado</>
                                    ) : added ? (
                                        <><Check className="w-4 h-4 sm:w-5 sm:h-5" /> ¡Añadido!</>
                                    ) : (
                                        <><ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" /> Añadir al Carrito</>
                                    )}
                                </button>
                            </div>

                            {/* Subtotal hint */}
                            {qty > 1 && (
                                <p className="text-xs text-forest/40 font-bold mt-3 text-center">
                                    Subtotal: {formatPrice(effectivePrice * qty, config.currencySymbol)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16 sm:mt-24">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl sm:text-3xl font-display font-black text-forest tracking-tight">
                                Productos Relacionados
                            </h2>
                            <Link
                                to="/catalogo"
                                className="text-xs font-black text-forest/40 uppercase tracking-[0.2em] hover:text-forest transition-colors"
                            >
                                Ver Todos
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            {relatedProducts.map(p => (
                                <Link key={p.id} to={`/producto/${p.slug || p.id}`} className="block">
                                    <ProductCard product={p} />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../context/ProductsContext';
import CategorySection from '../components/CategorySection';
import CartBar from '../components/CartBar';
import OfferCarousel from '../components/OfferCarousel';
import SkeletonCard from '../components/SkeletonCard';
import SEOHead from '../components/SEOHead';
import { Search, ArrowUp, PackageOpen, X } from 'lucide-react';

export default function CatalogPage() {
    const { products, categories, loading } = useProducts();
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showScrollTop, setShowScrollTop] = useState(false);

    // C5: Debounced search (300ms)
    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // C6: Scroll-to-top visibility
    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Filter products by search
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;
        const q = searchTerm.toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.category && p.category.toLowerCase().includes(q))
        );
    }, [products, searchTerm]);

    // Group filtered products by category
    const productsByCategory = useMemo(() => {
        const cats = [...new Set(filteredProducts.map(p => p.category))];
        return cats.reduce((acc, category) => {
            acc[category] = filteredProducts.filter(p => p.category === category);
            return acc;
        }, {});
    }, [filteredProducts]);

    const filteredCategories = Object.keys(productsByCategory);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main id="catalog-section" className="min-h-screen bg-organic pt-32 pb-40 px-6 sm:px-12 lg:px-20 max-w-full">
            <SEOHead
                title="Catálogo"
                description="Descubre nuestra selección de frutas y verduras frescas de temporada. Productos del campo directamente a tu mesa."
            />
            {/* Page header */}
            <div className="max-w-7xl mx-auto mb-12 animate-fade-in relative">
                <div className="absolute -left-10 top-0 w-1 h-32 bg-accent hidden lg:block" />
                <h1 className="text-6xl sm:text-8xl font-display font-black text-forest tracking-tighter mb-6 leading-[0.9]">
                    Nuestra <br className="md:hidden" /> <span className="text-accent-dark">Cosecha</span>
                </h1>
                <div className="flex items-center gap-4">
                    <div className="h-px w-10 bg-forest" />
                    <p className="text-[10px] font-black text-forest uppercase tracking-[0.5em]">
                        {products.length} Joyas de la naturaleza
                    </p>
                </div>
            </div>

            {/* C5: Search bar */}
            <div className="max-w-7xl mx-auto mb-10">
                <div className="relative max-w-xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/25 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar producto, categoría..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-full pl-14 pr-12 py-4 bg-white border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/15 focus:border-accent outline-none transition-all font-bold text-forest shadow-sm placeholder:text-forest/25"
                    />
                    {searchInput && (
                        <button
                            onClick={() => setSearchInput('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl hover:bg-forest/5 transition-colors text-forest/30 hover:text-forest"
                            aria-label="Limpiar búsqueda"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Offer Carousel Section (hide while searching) */}
                {!searchTerm && <OfferCarousel />}

                {/* C1: Skeleton loader */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    /* C2: Empty state */
                    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
                        <div className="w-24 h-24 bg-forest/5 rounded-[2rem] flex items-center justify-center mb-8">
                            <PackageOpen className="w-12 h-12 text-forest/15" />
                        </div>
                        <h3 className="text-2xl font-display font-black text-forest/30 mb-3 tracking-tight">
                            {searchTerm ? 'Sin resultados' : 'Catálogo vacío'}
                        </h3>
                        <p className="text-sm text-forest/30 font-medium max-w-sm">
                            {searchTerm
                                ? `No encontramos productos para "${searchTerm}". Intenta con otro término.`
                                : 'Pronto añadiremos productos frescos a nuestro catálogo.'
                            }
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchInput('')}
                                className="mt-6 px-6 py-3 bg-forest text-accent font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-forest/90 transition-all"
                            >
                                Limpiar búsqueda
                            </button>
                        )}
                    </div>
                ) : (
                    /* Product categories */
                    filteredCategories.map(category => (
                        <CategorySection
                            key={category}
                            title={category}
                            products={productsByCategory[category]}
                        />
                    ))
                )}
            </div>

            {/* Fixed cart bar */}
            <CartBar />

            {/* C6: Scroll-to-top FAB */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-24 right-6 z-40 w-12 h-12 bg-forest text-accent rounded-2xl shadow-xl shadow-forest/20 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                    }`}
                aria-label="Volver arriba"
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </main>
    );
}

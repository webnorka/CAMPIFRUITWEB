import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useFamilies } from '../context/FamiliesContext';
import CategorySection from '../components/CategorySection';
import CartBar from '../components/CartBar';
import OfferCarousel from '../components/OfferCarousel';
import SkeletonCard from '../components/SkeletonCard';
import SEOHead from '../components/SEOHead';
import { Search, ArrowUp, ArrowUpDown, PackageOpen, X } from 'lucide-react';

export default function CatalogPage() {
    const { products, loading } = useProducts();
    const { families } = useFamilies();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState(searchParams.get('familia') || null);

    // C5: Debounced search (300ms)
    useEffect(() => {
        const timer = setTimeout(() => setSearchTerm(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    // Sync URL ?familia= param
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const urlFamily = searchParams.get('familia');
        if (urlFamily) setSelectedFamily(urlFamily);
    }, [searchParams]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleFamilySelect = (familySlug) => {
        if (selectedFamily === familySlug) {
            setSelectedFamily(null);
            setSearchParams({});
        } else {
            setSelectedFamily(familySlug);
            setSearchParams({ familia: familySlug });
        }
    };

    // C6: Scroll-to-top visibility
    useEffect(() => {
        const onScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Only families that have products
    const activeCategories = useMemo(() => {
        if (!families.length || !products.length) return [];
        const familyIds = new Set(products.map(p => p.familyId));
        return families.filter(f => familyIds.has(f.id));
    }, [families, products]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let result = products;

        // Family filter — match by slug
        if (selectedFamily) {
            const matchedFamily = families.find(f => (f.slug || f.id) === selectedFamily);
            if (matchedFamily) {
                result = result.filter(p => p.familyId === matchedFamily.id);
            }
        }

        // Text search
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q)) ||
                (p.category && p.category.toLowerCase().includes(q))
            );
        }

        // Sort
        if (sortBy !== 'default') {
            result = [...result].sort((a, b) => {
                const priceA = a.onSale ? a.offerPrice : a.price;
                const priceB = b.onSale ? b.offerPrice : b.price;
                if (sortBy === 'price-asc') return priceA - priceB;
                if (sortBy === 'price-desc') return priceB - priceA;
                if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
                return 0;
            });
        }

        return result;
    }, [products, searchTerm, selectedFamily, families, sortBy]);

    // Group filtered products by category
    const productsByCategory = useMemo(() => {
        const cats = [...new Set(filteredProducts.map(p => p.category))];
        return cats.reduce((acc, category) => {
            acc[category] = filteredProducts.filter(p => p.category === category);
            return acc;
        }, {});
    }, [filteredProducts]);

    const filteredCats = Object.keys(productsByCategory);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchInput('');
        setSelectedFamily(null);
        setSortBy('default');
        setSearchParams({});
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
                        {filteredProducts.length} {filteredProducts.length === products.length ? 'Joyas de la naturaleza' : `de ${products.length} productos`}
                    </p>
                </div>
            </div>

            {/* Search bar + Sort */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-xl">
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
                    <div className="relative shrink-0">
                        <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/25 pointer-events-none" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-11 pr-10 py-4 bg-white border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/15 focus:border-accent outline-none transition-all font-bold text-sm text-forest shadow-sm cursor-pointer"
                        >
                            <option value="default">Ordenar</option>
                            <option value="price-asc">Precio: menor a mayor</option>
                            <option value="price-desc">Precio: mayor a menor</option>
                            <option value="name-asc">Nombre: A → Z</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Family Filter Chips */}
            {activeCategories.length > 1 && (
                <div className="max-w-7xl mx-auto mb-10">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={clearFilters}
                            className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${!selectedFamily
                                ? 'bg-forest text-accent border-forest shadow-lg shadow-forest/15'
                                : 'bg-white text-forest/50 border-forest/5 hover:bg-forest/5 hover:text-forest'
                                }`}
                        >
                            Todas
                        </button>
                        {activeCategories.map(fam => (
                            <button
                                key={fam.id}
                                onClick={() => handleFamilySelect(fam.slug || fam.id)}
                                className={`shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedFamily === (fam.slug || fam.id)
                                    ? 'bg-forest text-accent border-forest shadow-lg shadow-forest/15'
                                    : 'bg-white text-forest/50 border-forest/5 hover:bg-forest/5 hover:text-forest'
                                    }`}
                            >
                                {fam.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* Offer Carousel Section (hide while searching or filtering) */}
                {!searchTerm && !selectedFamily && <OfferCarousel />}

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
                            {searchTerm || selectedFamily ? 'Sin resultados' : 'Catálogo vacío'}
                        </h3>
                        <p className="text-sm text-forest/30 font-medium max-w-sm">
                            {searchTerm
                                ? `No encontramos productos para "${searchTerm}". Intenta con otro término.`
                                : selectedFamily
                                    ? 'No hay productos en esta categoría actualmente.'
                                    : 'Pronto añadiremos productos frescos a nuestro catálogo.'
                            }
                        </p>
                        {(searchTerm || selectedFamily) && (
                            <button
                                onClick={clearFilters}
                                className="mt-6 px-6 py-3 bg-forest text-accent font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-forest/90 transition-all"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    /* Product categories */
                    filteredCats.map(category => (
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

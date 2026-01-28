import { useMemo } from 'react';
import { useProducts } from '../context/ProductsContext';
import CategorySection from '../components/CategorySection';
import CartBar from '../components/CartBar';
import OfferCarousel from '../components/OfferCarousel';

export default function CatalogPage() {
    const { products, categories } = useProducts();

    // Group products by category
    const productsByCategory = useMemo(() => {
        return categories.reduce((acc, category) => {
            acc[category] = products.filter(p => p.category === category);
            return acc;
        }, {});
    }, [products, categories]);

    return (
        <main id="catalog-section" className="min-h-screen bg-organic pt-32 pb-40 px-6 sm:px-12 lg:px-20 max-w-full">
            {/* Page header */}
            <div className="max-w-7xl mx-auto mb-20 animate-fade-in relative">
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

            <div className="max-w-7xl mx-auto">
                {/* Offer Carousel Section */}
                <OfferCarousel />
                {/* Categories */}
                {categories.map(category => (
                    <CategorySection
                        key={category}
                        title={category}
                        products={productsByCategory[category]}
                    />
                ))}
            </div>

            {/* Fixed cart bar */}
            <CartBar />
        </main>
    );
}

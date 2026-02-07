import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Leaf, Clock, Star } from 'lucide-react';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import SEOHead from '../components/SEOHead';
import { useConfig } from '../context/ConfigContext';
import { useProducts } from '../context/ProductsContext';
import { useFamilies } from '../context/FamiliesContext';

export default function HomePage() {
    const { config } = useConfig();
    const { products, loading } = useProducts();
    const { families } = useFamilies();

    // Featured: products on sale first, then newest, max 6
    const featured = useMemo(() => {
        if (!products.length) return [];
        const onSale = products.filter(p => p.onSale);
        const rest = products.filter(p => !p.onSale);
        return [...onSale, ...rest].slice(0, 6);
    }, [products]);

    // Only families that have products
    const activeCategories = useMemo(() => {
        if (!families.length || !products.length) return [];
        const familyIds = new Set(products.map(p => p.familyId));
        return families.filter(f => familyIds.has(f.id)).slice(0, 6);
    }, [families, products]);

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": config.businessName || "Campifruit",
        "description": "Frutas y verduras frescas del campo a tu mesa",
        "url": window.location.origin
    };

    const benefits = [
        { icon: Leaf, title: 'Del Campo', desc: 'Productos frescos directamente del agricultor' },
        { icon: Truck, title: 'Entrega Rápida', desc: 'Recibe en tu puerta en 24-48h' },
        { icon: Clock, title: 'Temporada', desc: 'Los mejores productos de cada temporada' },
        { icon: Star, title: 'Calidad', desc: 'Seleccionados a mano para garantizar frescura' },
    ];

    return (
        <main className="bg-organic">
            <SEOHead
                description="Frutas y verduras frescas del campo a tu mesa. Productos de temporada, ofertas semanales y envío a domicilio."
                structuredData={structuredData}
            />
            <Hero />

            {/* Benefits Bar */}
            <section className="py-12 sm:py-16 border-b border-forest/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {benefits.map((b, i) => (
                            <div key={i} className="flex items-start gap-4 group">
                                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                                    <b.icon className="w-5 h-5 text-forest" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-forest mb-0.5">{b.title}</h3>
                                    <p className="text-[11px] text-forest/40 font-medium leading-relaxed">{b.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            {!loading && featured.length > 0 && (
                <section className="py-16 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8">
                        <div className="flex items-end justify-between mb-10 sm:mb-14">
                            <div>
                                <p className="text-[10px] font-black text-accent-dark uppercase tracking-[0.3em] mb-2">Selección</p>
                                <h2 className="text-3xl sm:text-4xl font-display font-black text-forest tracking-tight">Productos Destacados</h2>
                            </div>
                            <Link
                                to="/catalogo"
                                className="hidden sm:inline-flex items-center gap-2 text-xs font-black text-forest/50 uppercase tracking-widest hover:text-forest transition-colors"
                            >
                                Ver Todo <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
                            {featured.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        <Link
                            to="/catalogo"
                            className="mt-8 sm:hidden flex items-center justify-center gap-2 text-xs font-black text-forest/50 uppercase tracking-widest hover:text-forest transition-colors"
                        >
                            Ver Todo <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </section>
            )}

            {/* Categories */}
            {activeCategories.length > 0 && (
                <section className="py-16 sm:py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-8">
                        <div className="text-center mb-10 sm:mb-14">
                            <p className="text-[10px] font-black text-accent-dark uppercase tracking-[0.3em] mb-2">Nuestras Familias</p>
                            <h2 className="text-3xl sm:text-4xl font-display font-black text-forest tracking-tight">Explora por Categoría</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                            {activeCategories.map(fam => (
                                <Link
                                    key={fam.id}
                                    to={`/catalogo?familia=${fam.slug || fam.id}`}
                                    className="group relative bg-organic rounded-3xl border border-forest/5 p-6 sm:p-8 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500"
                                >
                                    {fam.image && (
                                        <img
                                            src={fam.image}
                                            alt={fam.name}
                                            className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                                            loading="lazy"
                                        />
                                    )}
                                    <div className="relative z-10">
                                        <h3 className="text-lg sm:text-xl font-display font-black text-forest mb-1">{fam.name}</h3>
                                        <p className="text-[10px] font-bold text-forest/40 uppercase tracking-wider flex items-center gap-1">
                                            {products.filter(p => p.familyId === fam.id).length} productos
                                            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Banner */}
            <section className="py-16 sm:py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-display font-black text-forest tracking-tight mb-4">
                        ¿Listo para probar lo fresco?
                    </h2>
                    <p className="text-forest/40 font-medium mb-8 max-w-lg mx-auto">
                        Haz tu primer pedido y descubre la diferencia de recibir productos directamente del campo.
                    </p>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-3 btn-primary h-16 px-10 text-sm uppercase tracking-[0.2em]"
                    >
                        Explorar Catálogo <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}

import ProductCard from './ProductCard';

export default function CategorySection({ title, products }) {
    if (products.length === 0) return null;

    return (
        <section className="mb-20 last:mb-0">
            {/* Category header */}
            <div className="flex items-center gap-5 mb-10">
                <div className="w-1.5 h-10 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full" />
                <h2 className="text-3xl font-display font-black text-forest tracking-tight">{title}</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-forest/10 to-transparent" />
                <span className="text-[10px] font-black text-forest/20 uppercase tracking-[0.2em]">
                    {products.length} {products.length === 1 ? 'item' : 'items'}
                </span>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}

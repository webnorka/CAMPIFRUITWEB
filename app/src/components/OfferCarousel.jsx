import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useProducts } from '../context/ProductsContext';

export default function OfferCarousel() {
    const { config } = useConfig();
    const { products } = useProducts();
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);

    const offers = products.filter(p => p.onSale);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        if (!config.showCarousel || offers.length === 0) return;

        resetTimeout();
        timeoutRef.current = setTimeout(
            () => setCurrentIndex((prevIndex) => (prevIndex === offers.length - 1 ? 0 : prevIndex + 1)),
            config.carouselSpeed || 3000
        );

        return () => resetTimeout();
    }, [currentIndex, offers.length, config.showCarousel, config.carouselSpeed]);

    if (!config.showCarousel || offers.length === 0) return null;

    const nextSlide = () => setCurrentIndex(prev => (prev === offers.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex(prev => (prev === 0 ? offers.length - 1 : prev - 1));

    return (
        <div className="relative w-full mb-20 group overflow-hidden rounded-[2.5rem] bg-forest/5 p-2 border border-forest/5 shadow-inner">
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-[2.3rem]">
                {offers.map((product, index) => {
                    const discount = product.price > 0 ? Math.round((1 - (product.offerPrice / product.price)) * 100) : 0;

                    return (
                        <div
                            key={product.id}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentIndex ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-105 pointer-events-none'
                                }`}
                        >
                            {/* Background Image */}
                            <img
                                src={product.image || '/placeholder-product.jpg'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/20 to-transparent" />

                            {/* Floating Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="offer-tag flex items-center gap-2 bg-accent text-forest font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-xl animate-bounce-short">
                                        <Tag className="w-4 h-4" />
                                        -{discount}% OFF
                                    </div>
                                    <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        Oferta Destacada
                                    </span>
                                </div>

                                <h3 className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tighter drop-shadow-lg">
                                    {product.name}
                                </h3>

                                <div className="flex items-center gap-4">
                                    <p className="text-2xl md:text-3xl font-black text-accent">
                                        {config.currencySymbol}{product.offerPrice.toLocaleString()}
                                    </p>
                                    <p className="text-lg md:text-xl font-bold text-white/40 line-through">
                                        {config.currencySymbol}{product.price.toLocaleString()}
                                    </p>
                                    <button className="hidden md:flex ml-auto btn-primary h-14 px-8 text-xs uppercase tracking-widest">
                                        Añadir al carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Controls */}
            {offers.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-forest text-accent border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-accent hover:text-forest shadow-2xl z-30"
                    >
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-forest text-accent border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-accent hover:text-forest shadow-2xl z-30"
                    >
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </>
            )}

            {/* Indicators */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {offers.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`transition-all duration-500 rounded-full h-2 ${index === currentIndex ? 'w-12 bg-accent shadow-[0_0_15px_rgba(163,230,53,0.5)]' : 'w-2 bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

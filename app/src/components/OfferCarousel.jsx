import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Tag, ArrowRight } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useProducts } from '../context/ProductsContext';
import { useCarousel } from '../context/CarouselContext';
import { useCart } from '../context/CartContext';

export default function OfferCarousel() {
    const { config } = useConfig();
    const { products } = useProducts();
    const { activeSlides } = useCarousel();
    const { addToCart } = useCart();
    const [currentIndex, setCurrentIndex] = useState(0);
    const timeoutRef = useRef(null);
    const touchStartX = useRef(null);

    // Merge carousel_slides with product data; fallback to on-sale products if no admin slides
    const slides = (activeSlides.length > 0)
        ? activeSlides.map(slide => {
            if (slide.type === 'product' && slide.productId) {
                const product = products.find(p => p.id === slide.productId);
                return { ...slide, product };
            }
            return slide;
        })
        : products.filter(p => p.onSale).map(p => ({
            id: p.id,
            type: 'product',
            title: p.name,
            imageUrl: p.image,
            product: p
        }));

    const resetTimeout = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    useEffect(() => {
        if (!config.showCarousel || slides.length === 0) return;
        resetTimeout();
        timeoutRef.current = setTimeout(
            () => setCurrentIndex(prev => (prev >= slides.length - 1 ? 0 : prev + 1)),
            config.carouselSpeed || 3000
        );
        return resetTimeout;
    }, [currentIndex, slides.length, config.showCarousel, config.carouselSpeed, resetTimeout]);

    // Reset index if slides change
    useEffect(() => {
        if (currentIndex >= slides.length) setCurrentIndex(0);
    }, [slides.length, currentIndex]);

    if (!config.showCarousel || slides.length === 0) return null;

    const nextSlide = () => setCurrentIndex(prev => (prev >= slides.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentIndex(prev => (prev <= 0 ? slides.length - 1 : prev - 1));

    // Touch swipe support (C3)
    const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
        touchStartX.current = null;
    };

    const handleAddToCart = (product) => {
        if (product) addToCart(product);
    };

    return (
        <div
            className="relative w-full mb-20 group overflow-hidden rounded-[2.5rem] bg-forest/5 p-2 border border-forest/5 shadow-inner"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-[2.3rem]">
                {slides.map((slide, index) => {
                    const product = slide.product;
                    const discount = product && product.price > 0
                        ? Math.round((1 - ((product.offerPrice || product.offer_price || product.price) / product.price)) * 100)
                        : 0;
                    const imageUrl = slide.imageUrl || product?.image || '/placeholder-product.jpg';

                    return (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${index === currentIndex ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-105 pointer-events-none'}`}
                        >
                            {/* Background Image */}
                            <img
                                src={imageUrl}
                                alt={slide.title || product?.name || 'Slide'}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />

                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/20 to-transparent" />

                            {/* Floating Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                                <div className="flex items-center gap-3 mb-4">
                                    {slide.type === 'product' && product && discount > 0 && (
                                        <div className="offer-tag flex items-center gap-2 bg-accent text-forest font-black px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-xl animate-bounce-short">
                                            <Tag className="w-4 h-4" />
                                            -{discount}% OFF
                                        </div>
                                    )}
                                    <span className="bg-white/10 backdrop-blur-md text-white/80 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                        {slide.type === 'product' ? 'Oferta Destacada' : (slide.subtitle || 'Destacado')}
                                    </span>
                                </div>

                                <h3 className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tighter drop-shadow-lg">
                                    {slide.title || product?.name}
                                </h3>

                                <div className="flex items-center gap-4">
                                    {slide.type === 'product' && product ? (
                                        <>
                                            <p className="text-2xl md:text-3xl font-black text-accent">
                                                {config.currencySymbol}{(product.offerPrice || product.offer_price || product.price).toLocaleString()}
                                            </p>
                                            {product.onSale && (
                                                <p className="text-lg md:text-xl font-bold text-white/40 line-through">
                                                    {config.currencySymbol}{product.price.toLocaleString()}
                                                </p>
                                            )}
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className="hidden md:flex ml-auto btn-primary h-14 px-8 text-xs uppercase tracking-widest"
                                            >
                                                Añadir al carrito
                                            </button>
                                        </>
                                    ) : slide.ctaUrl ? (
                                        <a
                                            href={slide.ctaUrl}
                                            className="flex items-center gap-3 btn-primary h-14 px-8 text-xs uppercase tracking-widest"
                                        >
                                            {slide.ctaText || 'Ver más'}
                                            <ArrowRight className="w-4 h-4" />
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Navigation Controls */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-forest text-accent border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-accent hover:text-forest shadow-2xl z-30"
                        aria-label="Slide anterior"
                    >
                        <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-forest text-accent border border-white/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-accent hover:text-forest shadow-2xl z-30"
                        aria-label="Siguiente slide"
                    >
                        <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                </>
            )}

            {/* Indicators */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Ir a slide ${index + 1}`}
                        className={`transition-all duration-500 rounded-full h-2 ${index === currentIndex ? 'w-12 bg-accent shadow-[0_0_15px_rgba(163,230,53,0.5)]' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                    />
                ))}
            </div>
        </div>
    );
}

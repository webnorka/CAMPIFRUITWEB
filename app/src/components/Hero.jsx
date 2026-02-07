import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';

export default function Hero() {
    const { config } = useConfig();

    return (
        <section className="relative min-h-[92vh] flex items-center overflow-hidden pt-20">
            {/* Background Image with Dark Professional Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={config.heroImage || "/hero_premium.png"}
                    alt="Premium Tropical Fruits"
                    className="w-full h-full object-cover scale-105"
                    loading="eager"
                />
                {/* Layered Gradient for Readability: Darker on mobile, elegant on desktop */}
                <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/40 to-forest/90 md:bg-gradient-to-r md:from-forest md:via-forest/40 md:to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 w-full">
                <div className="max-w-3xl text-center md:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-4 py-2 sm:px-5 sm:py-2.5 rounded-full border border-white/20 shadow-2xl mb-8 sm:mb-10 animate-fade-in mx-auto md:mx-0">
                        <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-accent rounded-full animate-pulse shadow-[0_0_15px_rgba(163,230,53,0.5)]" />
                        <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-[0.3em]">Cosecha Premium Local</span>
                    </div>

                    {/* Main heading - High impact, high contrast */}
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-display font-black text-white mb-6 sm:mb-8 leading-[1.1] sm:leading-[1] tracking-tight animate-slide-up drop-shadow-2xl">
                        {config.heroTitle || 'La frescura del campo en tu mesa'}
                    </h1>

                    {/* Subtitle - Optimized for readability */}
                    <p className="text-base sm:text-lg md:text-2xl text-white/80 mb-8 sm:mb-12 max-w-xl sm:max-w-2xl font-medium leading-relaxed animate-fade-in drop-shadow-lg mx-auto md:mx-0" style={{ animationDelay: '0.1s' }}>
                        {config.heroSubtitle || 'Frutas tropicales seleccionadas con pasión para deleitar tus sentidos.'}
                    </p>

                    {/* CTA Buttons - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 animate-fade-in mx-auto md:mx-0" style={{ animationDelay: '0.2s' }}>
                        <Link
                            to="/catalogo"
                            className="w-full sm:w-auto btn-primary group h-14 sm:h-16 px-8 sm:px-10 text-xs sm:text-sm uppercase tracking-[0.2em]"
                        >
                            Explorar Catálogo
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <div className="flex items-center gap-3 sm:gap-4 px-5 py-3 sm:px-6 sm:py-4 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl w-full sm:w-auto justify-center sm:justify-start">
                            <div className="flex -space-x-2 sm:-space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-forest bg-accent flex items-center justify-center text-[8px] sm:text-[10px] font-black text-forest">
                                        {i === 3 ? '+80' : ''}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">+80 negocios confían</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Button to Catalog */}
            <Link
                to="/catalogo"
                className="absolute bottom-12 left-1/2 -translate-x-1/2 md:left-20 md:translate-x-0 group flex flex-col items-center gap-4 transition-all hover:translate-y-1 animate-fade-in"
                style={{ animationDelay: '0.5s' }}
            >
                <span className="text-[9px] font-black text-white uppercase tracking-[0.4em] [writing-mode:vertical-lr] mb-2 hidden md:block opacity-50 group-hover:opacity-100 transition-opacity">
                    Ver Catálogo
                </span>
                <div className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center bg-accent text-forest shadow-2xl group-hover:bg-white group-hover:border-white transition-all animate-bounce-short">
                    <ChevronDown className="w-6 h-6" />
                </div>
            </Link>
        </section>
    );
}

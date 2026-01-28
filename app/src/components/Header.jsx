import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';

export default function Header() {
    const { config } = useConfig();
    const { totalItems, openCart } = useCart();
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    const isAdmin = location.pathname.startsWith('/admin');

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass py-3 md:py-5 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo Image */}
                    <Link to="/" className="flex items-center group relative z-10">
                        <img
                            src="/logo_text.png"
                            alt={config.businessName}
                            className="h-10 md:h-12 w-auto group-hover:scale-105 transition-transform duration-500"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-12">
                        <Link
                            to="/"
                            className={`text-[12px] font-black uppercase tracking-[0.25em] transition-all hover:text-accent ${location.pathname === '/' ? 'text-[var(--color-header-text)]' : 'text-[var(--color-header-text)]/70'}`}
                        >
                            Inicio
                        </Link>
                        <Link
                            to="/catalogo"
                            className={`text-[12px] font-black uppercase tracking-[0.25em] transition-all hover:text-accent ${location.pathname === '/catalogo' ? 'text-[var(--color-header-text)]' : 'text-[var(--color-header-text)]/70'}`}
                        >
                            Catálogo
                        </Link>
                        {!isAdmin && (
                            <div className="h-6 w-px bg-forest/10 mx-2" />
                        )}
                        {!isAdmin && (
                            <button
                                onClick={openCart}
                                className="relative p-4 bg-forest text-accent rounded-2xl shadow-2xl transition-all duration-300 group hover:scale-110 active:scale-95 border border-forest/10"
                            >
                                <ShoppingCart className="w-6 h-6 group-hover:rotate-3 transition-transform" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-[24px] h-[24px] px-1 bg-accent text-forest text-[10px] font-black rounded-full flex items-center justify-center shadow-2xl border-2 border-white animate-bounce-short">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        )}
                    </nav>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-4 md:hidden relative z-10">
                        {!isAdmin && (
                            <button
                                onClick={openCart}
                                className="relative p-3.5 bg-forest text-accent rounded-2xl shadow-xl border border-forest/10 active:scale-90 transition-transform"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-accent text-forest text-[10px] font-black rounded-full flex items-center justify-center shadow-md">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className={`p-3.5 border transition-all duration-300 rounded-2xl shadow-xl active:scale-90 ${menuOpen ? 'bg-forest text-white border-forest/10 rotate-90' : 'bg-accent text-forest border-forest/5'}`}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                <div className={`md:hidden fixed inset-x-0 top-0 pt-28 pb-10 px-6 bg-white shadow-2xl transition-all duration-500 ease-in-out border-b border-forest/5 ${menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                    <nav className="flex flex-col gap-4">
                        <Link
                            to="/"
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center justify-between px-8 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${location.pathname === '/' ? 'bg-forest text-accent shadow-xl shadow-forest/20' : 'bg-organic text-forest/60'}`}
                        >
                            Inicio
                            {location.pathname === '/' && <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
                        </Link>
                        <Link
                            to="/catalogo"
                            onClick={() => setMenuOpen(false)}
                            className={`flex items-center justify-between px-8 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${location.pathname === '/catalogo' ? 'bg-forest text-accent shadow-xl shadow-forest/20' : 'bg-organic text-forest/60'}`}
                        >
                            Catálogo
                            {location.pathname === '/catalogo' && <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
}

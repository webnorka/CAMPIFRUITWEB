import { ShoppingCart, Menu, X, User, Heart, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../utils/supabaseClient';
import LoginModal from './LoginModal';

export default function Header() {
    const { config } = useConfig();
    const { totalItems, openCart } = useCart();
    const { isAuthenticated, user, loading: authLoading } = useCustomerAuth();
    const { wishlistCount } = useWishlist();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const location = useLocation();

    const isAdmin = location.pathname.startsWith('/admin');

    // Check if the current user is an admin
    useEffect(() => {
        if (!user) {
            setIsAdminUser(false);
            return;
        }
        supabase
            .from('admin_users')
            .select('id')
            .eq('id', user.id)
            .single()
            .then(({ data, error }) => {
                setIsAdminUser(!error && !!data);
            });
    }, [user]);

    return (
        <>
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
                            {!isAdmin && isAdminUser && (
                                <Link
                                    to="/admin"
                                    className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl hover:bg-amber-500 hover:text-white transition-all duration-300"
                                    aria-label="Panel Admin"
                                    title="Panel Admin"
                                >
                                    <Shield className="w-5 h-5" />
                                </Link>
                            )}
                            {!isAdmin && !authLoading && (
                                isAuthenticated ? (
                                    <Link
                                        to="/cuenta"
                                        className="p-3 bg-forest/5 text-forest rounded-2xl hover:bg-forest hover:text-accent transition-all duration-300"
                                        aria-label="Mi cuenta"
                                    >
                                        <User className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setShowLogin(true)}
                                        className="p-3 bg-forest/5 text-forest rounded-2xl hover:bg-forest hover:text-accent transition-all duration-300"
                                        aria-label="Iniciar sesión"
                                    >
                                        <User className="w-5 h-5" />
                                    </button>
                                )
                            )}
                            {!isAdmin && isAuthenticated && (
                                <Link
                                    to="/favoritos"
                                    className="relative p-3 bg-forest/5 text-forest rounded-2xl hover:bg-forest hover:text-accent transition-all duration-300"
                                    aria-label="Favoritos"
                                >
                                    <Heart className="w-5 h-5" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-accent text-forest text-[8px] font-black rounded-full flex items-center justify-center">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>
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
                        <div className="flex items-center gap-3 md:hidden relative z-10">
                            {!isAdmin && isAuthenticated && (
                                <Link
                                    to="/favoritos"
                                    className="relative p-3 bg-forest/5 text-forest rounded-2xl active:scale-90 transition-transform"
                                    aria-label="Favoritos"
                                >
                                    <Heart className="w-5 h-5" />
                                    {wishlistCount > 0 && (
                                        <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-accent text-forest text-[8px] font-black rounded-full flex items-center justify-center">
                                            {wishlistCount}
                                        </span>
                                    )}
                                </Link>
                            )}
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
                            {!authLoading && (
                                isAuthenticated ? (
                                    <>
                                        {isAdminUser && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setMenuOpen(false)}
                                                className="flex items-center justify-between px-8 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all bg-amber-50 text-amber-600 border border-amber-200"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <Shield className="w-5 h-5" />
                                                    Panel Admin
                                                </span>
                                            </Link>
                                        )}
                                        <Link
                                            to="/cuenta"
                                            onClick={() => setMenuOpen(false)}
                                            className={`flex items-center justify-between px-8 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${location.pathname === '/cuenta' ? 'bg-forest text-accent shadow-xl shadow-forest/20' : 'bg-organic text-forest/60'}`}
                                        >
                                            Mi Cuenta
                                            {location.pathname === '/cuenta' && <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
                                        </Link>
                                        <Link
                                            to="/favoritos"
                                            onClick={() => setMenuOpen(false)}
                                            className={`flex items-center justify-between px-8 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${location.pathname === '/favoritos' ? 'bg-forest text-accent shadow-xl shadow-forest/20' : 'bg-organic text-forest/60'}`}
                                        >
                                            Favoritos
                                            {location.pathname === '/favoritos' && <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />}
                                        </Link>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => { setMenuOpen(false); setShowLogin(true); }}
                                        className="flex items-center justify-between px-8 py-6 rounded-3xl font-black text-sm uppercase tracking-widest transition-all bg-organic text-forest/60"
                                    >
                                        Iniciar Sesión
                                    </button>
                                )
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </>
    );
}

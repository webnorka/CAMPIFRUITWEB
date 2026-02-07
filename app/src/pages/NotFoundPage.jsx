import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import SEOHead from '../components/SEOHead';

export default function NotFoundPage() {
    return (
        <main className="bg-organic min-h-screen pt-32 pb-16 flex items-center">
            <SEOHead title="Página no encontrada" />
            <div className="max-w-2xl mx-auto px-6 text-center animate-fade-in">
                <div className="w-28 h-28 bg-forest/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10">
                    <Search className="w-14 h-14 text-forest/15" />
                </div>
                <p className="text-[10px] font-black text-accent-dark uppercase tracking-[0.3em] mb-4">Error 404</p>
                <h1 className="text-5xl sm:text-7xl font-display font-black text-forest tracking-tighter mb-6 leading-[0.9]">
                    Página no <span className="text-accent-dark">encontrada</span>
                </h1>
                <p className="text-forest/40 font-medium mb-10 max-w-md mx-auto">
                    Lo sentimos, la página que buscas no existe o ha sido movida.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 btn-primary h-14 px-8 text-xs uppercase tracking-[0.2em]"
                    >
                        <Home className="w-4 h-4" /> Ir al Inicio
                    </Link>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-3 h-14 px-8 bg-white border border-forest/10 text-forest font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-forest/5 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Ver Catálogo
                    </Link>
                </div>
            </div>
        </main>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Settings,
    Package,
    LogOut,
    Save,
    Plus,
    Trash2,
    Edit2,
    ChevronRight,
    LayoutDashboard,
    ShoppingBag
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useConfig } from '../context/ConfigContext';
import { useProducts } from '../context/ProductsContext';
import ConfigEditor from './ConfigEditor';
import ProductEditor from './ProductEditor';
import OrdersList from './OrdersList';

export default function AdminPanel() {
    const { logout } = useAuth();
    const { config } = useConfig();
    const [activeTab, setActiveTab] = useState('orders'); // 'config', 'products' or 'orders'
    const navigate = useNavigate();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitPrompt, setShowExitPrompt] = useState(false);

    // Reset unsaved changes when changing tabs (as components unmount)
    useEffect(() => {
        setHasUnsavedChanges(false);
        setShowExitPrompt(false);
    }, [activeTab]);

    const handleLogoClick = () => {
        if (hasUnsavedChanges) {
            setShowExitPrompt(prev => !prev);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-organic flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-forest text-white flex flex-col shadow-2xl z-20">
                <div className="p-8">
                    <div className="relative z-50">
                        <button
                            onClick={handleLogoClick}
                            className="flex items-center gap-4 mb-8 w-full text-left group transition-transform active:scale-95"
                        >
                            <img
                                src="/logo_circular.png"
                                className="w-12 h-12 rounded-2xl shadow-2xl group-hover:shadow-white/10 transition-shadow"
                                alt="Logo"
                            />
                            <div>
                                <span className="block font-display font-black text-lg tracking-tight leading-none mb-1 text-white group-hover:text-accent transition-colors">
                                    {config.businessName}
                                </span>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white/50 transition-colors">Panel Pro</span>
                            </div>
                        </button>

                        {/* Unsaved Changes Context Menu */}
                        {showExitPrompt && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-3xl shadow-2xl p-4 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] font-black text-forest/40 uppercase tracking-widest mb-3 ml-1">
                                    ⚠️ Cambios sin guardar
                                </p>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full text-left px-4 py-3 bg-rose-50 text-rose-500 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-rose-100 transition-colors"
                                    >
                                        Salir sin guardar
                                    </button>
                                    <button
                                        onClick={() => setShowExitPrompt(false)}
                                        className="w-full text-left px-4 py-3 bg-gray-50 text-gray-500 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors"
                                    >
                                        Seguir editando
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <nav className="space-y-3">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'orders'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Pedidos
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'orders' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => setActiveTab('products')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'products'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Package className="w-5 h-5" />
                            Catálogo
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'products' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => setActiveTab('config')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'config'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                            Negocio
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'config' ? 'rotate-90' : ''}`} />
                        </button>
                    </nav>
                </div>

                <div className="mt-auto p-8 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 px-5 py-4 text-rose-400 hover:bg-rose-400/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Desconectar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-6xl mx-auto animate-fade-in">
                    {activeTab === 'orders' && <OrdersList setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'products' && <ProductEditor setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'config' && <ConfigEditor setHasUnsavedChanges={setHasUnsavedChanges} />}
                </div>
            </main>
        </div>
    );
}

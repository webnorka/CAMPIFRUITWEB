import { useState } from 'react';
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

    return (
        <div className="min-h-screen bg-organic flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-72 bg-forest text-white flex flex-col shadow-2xl z-20">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <img
                            src="/logo_circular.png"
                            className="w-12 h-12 rounded-2xl shadow-2xl"
                            alt="Logo"
                        />
                        <div>
                            <span className="block font-display font-black text-lg tracking-tight leading-none mb-1 text-white">
                                {config.businessName}
                            </span>
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Panel Pro</span>
                        </div>
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
                    {activeTab === 'orders' && <OrdersList />}
                    {activeTab === 'products' && <ProductEditor />}
                    {activeTab === 'config' && <ConfigEditor />}
                </div>
            </main>
        </div>
    );
}

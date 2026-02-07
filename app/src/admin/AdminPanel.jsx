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
    ShoppingBag,
    Menu,
    X,
    Layers,
    Image,
    Users,
    Percent,
    Tag,
    Table2,
    BarChart3
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useIsEditor } from './AuthProvider';
import { useConfig } from '../context/ConfigContext';
import ConfigEditor from './ConfigEditor';
import ProductEditor from './ProductEditor';
import OrdersList from './OrdersList';
import FamiliesEditor from './FamiliesEditor';
import CarouselEditor from './CarouselEditor';
import CustomersPanel from './CustomersPanel';
import PromotionsEditor from './PromotionsEditor';
import DiscountCodesEditor from './DiscountCodesEditor';
import AdminDashboard from './AdminDashboard';
import AnalyticsPanel from './AnalyticsPanel';
import BulkImportExport from './BulkImportExport';

export default function AdminPanel() {
    const { logout } = useAuth();
    const isEditor = useIsEditor();
    const { config } = useConfig();
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showExitPrompt, setShowExitPrompt] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Reset unsaved changes when changing tabs (as components unmount)
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        setHasUnsavedChanges(false);
        setShowExitPrompt(false);
    }, [activeTab]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleLogoClick = () => {
        if (hasUnsavedChanges) {
            setShowExitPrompt(prev => !prev);
        } else {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-organic flex flex-col md:flex-row relative">
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-forest text-white shadow-md z-30 relative">
                <div className="flex items-center gap-3">
                    <img src="/logo_circular.png" className="w-8 h-8 rounded-full" alt="Logo" />
                    <span className="font-display font-black text-sm">{config.businessName}</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-20 bg-black/50 backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30 w-72 bg-forest text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-8 flex flex-col h-full">
                    <div className="relative z-50 mb-8 hidden md:block">
                        <button
                            onClick={handleLogoClick}
                            className="flex items-center gap-4 w-full text-left group transition-transform active:scale-95"
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
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] group-hover:text-white/50 transition-colors">
                                    Panel Pro <span className="text-white/10">v{__APP_VERSION__}</span>
                                    {!isEditor && <span className="ml-2 text-[8px] bg-white/10 text-white/60 px-2 py-0.5 rounded-md">Viewer</span>}
                                </span>
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

                    <nav className="space-y-2 flex-1 overflow-y-auto">
                        {/* Section: Ventas */}
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-5 pt-4 pb-2">Ventas</p>

                        <button
                            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'dashboard'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'dashboard' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'orders'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Pedidos
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'orders' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => { setActiveTab('customers'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'customers'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Users className="w-5 h-5" />
                            Clientes
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'customers' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'analytics'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <BarChart3 className="w-5 h-5" />
                            Analíticas
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'analytics' ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Section: Catálogo */}
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-5 pt-6 pb-2">Catálogo</p>

                        <button
                            onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'products'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Package className="w-5 h-5" />
                            Productos
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'products' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => { setActiveTab('families'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'families'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Layers className="w-5 h-5" />
                            Familias
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'families' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => { setActiveTab('import-export'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'import-export'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Table2 className="w-5 h-5" />
                            Import/Export
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'import-export' ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Section: Marketing */}
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-5 pt-6 pb-2">Marketing</p>

                        <button
                            onClick={() => { setActiveTab('carousel'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'carousel'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Image className="w-5 h-5" />
                            Carrusel
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'carousel' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => { setActiveTab('promotions'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'promotions'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Percent className="w-5 h-5" />
                            Promociones
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'promotions' ? 'rotate-90' : ''}`} />
                        </button>

                        <button
                            onClick={() => { setActiveTab('discounts'); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'discounts'
                                ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Tag className="w-5 h-5" />
                            Códigos
                            <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'discounts' ? 'rotate-90' : ''}`} />
                        </button>

                        {/* Section: Configuración */}
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-5 pt-6 pb-2">Sistema</p>

                        {isEditor && (
                            <button
                                onClick={() => { setActiveTab('config'); setMobileMenuOpen(false); }}
                                className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTab === 'config'
                                    ? 'bg-accent text-forest shadow-xl shadow-accent/20'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <Settings className="w-5 h-5" />
                                Negocio
                                <ChevronRight className={`ml-auto w-4 h-4 opacity-50 transition-transform ${activeTab === 'config' ? 'rotate-90' : ''}`} />
                            </button>
                        )}
                    </nav>

                    <div className="pt-8 border-t border-white/5 mt-auto">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-4 px-5 py-4 text-rose-400 hover:bg-rose-400/10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Desconectar
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-12 h-[calc(100vh-64px)] md:h-screen">
                <div className="max-w-6xl mx-auto animate-fade-in pb-20 md:pb-0">
                    {activeTab === 'dashboard' && <AdminDashboard />}
                    {activeTab === 'orders' && <OrdersList setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'customers' && <CustomersPanel />}
                    {activeTab === 'products' && <ProductEditor setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'families' && <FamiliesEditor setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'carousel' && <CarouselEditor setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'promotions' && <PromotionsEditor setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'discounts' && <DiscountCodesEditor setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'import-export' && <BulkImportExport setHasUnsavedChanges={setHasUnsavedChanges} />}
                    {activeTab === 'analytics' && <AnalyticsPanel />}
                    {activeTab === 'config' && isEditor && <ConfigEditor setHasUnsavedChanges={setHasUnsavedChanges} />}
                </div>
            </main>
        </div>
    );
}

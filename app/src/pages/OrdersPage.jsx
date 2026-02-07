import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useConfig } from '../context/ConfigContext';
import { formatPrice } from '../utils/whatsapp';
import SEOHead from '../components/SEOHead';

const statusConfig = {
    nuevo: { label: 'Nuevo', icon: Clock, color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    procesando: { label: 'Procesando', icon: Package, color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    entregado: { label: 'Entregado', icon: CheckCircle2, color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    cancelado: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700', dot: 'bg-red-500' }
};

export default function OrdersPage() {
    const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
    const { config } = useConfig();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        if (!customer?.id) return;

        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customer.id)
                .order('created_at', { ascending: false });

            if (!error) setOrders(data || []);
            setLoading(false);
        };
        fetchOrders();
    }, [customer?.id]);

    if (authLoading) {
        return (
            <main className="bg-organic min-h-screen pt-32 pb-16">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="h-8 w-48 bg-forest/5 rounded-xl animate-pulse mb-8" />
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-white rounded-3xl animate-pulse mb-4" />
                    ))}
                </div>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="bg-organic min-h-screen pt-32 pb-16 flex items-center justify-center">
                <div className="text-center px-4">
                    <Package className="w-16 h-16 text-forest/15 mx-auto mb-4" />
                    <h1 className="text-2xl font-display font-black text-forest mb-2">Mis Pedidos</h1>
                    <p className="text-sm text-forest/40 font-medium mb-6">Inicia sesión para ver tus pedidos</p>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/90 transition-all shadow-xl"
                    >
                        Ir al Catálogo
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-organic min-h-screen pt-24 sm:pt-32 pb-16">
            <SEOHead title="Mis Pedidos" noindex />
            <div className="max-w-3xl mx-auto px-4 sm:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[10px] font-bold text-forest/40 mb-8" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-forest transition-colors">Inicio</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-forest font-black">Mis Pedidos</span>
                </nav>

                <h1 className="text-3xl font-display font-black text-forest tracking-tight mb-8">Mis Pedidos</h1>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse" />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-16 h-16 text-forest/10 mx-auto mb-4" />
                        <p className="text-forest/40 font-medium mb-6">Aún no tienes pedidos</p>
                        <Link
                            to="/catalogo"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/90 transition-all shadow-xl"
                        >
                            Explorar Catálogo
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const status = statusConfig[order.status] || statusConfig.nuevo;
                            const StatusIcon = status.icon;
                            const isExpanded = expanded === order.id;
                            const items = order.items || [];

                            return (
                                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-forest/5 overflow-hidden">
                                    {/* Order Header */}
                                    <button
                                        onClick={() => setExpanded(isExpanded ? null : order.id)}
                                        className="w-full flex items-center gap-4 p-5 sm:p-6 text-left hover:bg-organic/50 transition-colors"
                                    >
                                        <div className={`w-10 h-10 rounded-2xl ${status.color} flex items-center justify-center shrink-0`}>
                                            <StatusIcon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-black text-forest">Pedido #{order.id?.slice(-8)}</span>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-forest/40 font-medium">
                                                {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="text-lg font-black text-forest">
                                            {formatPrice(order.total_price, config.currencySymbol)}
                                        </span>
                                        <ChevronRight className={`w-5 h-5 text-forest/30 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </button>

                                    {/* Order Details (Expanded) */}
                                    {isExpanded && (
                                        <div className="border-t border-forest/5 p-5 sm:p-6 bg-organic/30">
                                            {/* Status Timeline */}
                                            <div className="flex items-center gap-3 mb-6">
                                                {['nuevo', 'procesando', 'entregado'].map((step, i) => {
                                                    const stepConfig = statusConfig[step];
                                                    const isActive = step === order.status;
                                                    const isPast = ['nuevo', 'procesando', 'entregado'].indexOf(order.status) >= i;

                                                    return (
                                                        <div key={step} className="flex items-center gap-2 flex-1">
                                                            <div className={`w-3 h-3 rounded-full ${isPast ? stepConfig.dot : 'bg-forest/10'}`} />
                                                            <span className={`text-[9px] font-black uppercase tracking-wider ${isPast ? 'text-forest' : 'text-forest/20'}`}>
                                                                {stepConfig.label}
                                                            </span>
                                                            {i < 2 && <div className={`flex-1 h-px ${isPast ? 'bg-forest/20' : 'bg-forest/5'}`} />}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Items */}
                                            <div className="space-y-2 mb-4">
                                                {items.map((item, i) => (
                                                    <div key={i} className="flex items-center justify-between py-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold text-forest/40">{item.quantity}×</span>
                                                            <span className="text-sm font-bold text-forest">{item.name}</span>
                                                        </div>
                                                        <span className="text-sm font-bold text-forest/60">
                                                            {formatPrice((item.price || 0) * (item.quantity || 1), config.currencySymbol)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Totals */}
                                            <div className="border-t border-forest/5 pt-4 space-y-1">
                                                {order.discount_amount > 0 && (
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-forest/40 font-medium">Descuento</span>
                                                        <span className="text-green-600 font-bold">-{formatPrice(order.discount_amount, config.currencySymbol)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-black text-forest">Total</span>
                                                    <span className="text-lg font-black text-forest">{formatPrice(order.total_price, config.currencySymbol)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}

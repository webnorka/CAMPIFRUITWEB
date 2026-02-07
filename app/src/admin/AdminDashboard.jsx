import { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, TrendingDown, ShoppingBag, DollarSign,
    Users, Package, AlertTriangle, ArrowUpRight, BarChart3
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useProducts } from '../context/ProductsContext';
import { useConfig } from '../context/ConfigContext';
import { formatPrice } from '../utils/whatsapp';
import { reportError } from '../hooks/useErrorReporter';

export default function AdminDashboard() {
    const { products } = useProducts();
    const { config } = useConfig();
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, customersRes] = await Promise.all([
                    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100),
                    supabase.from('customers').select('id, name, email, created_at')
                ]);
                if (ordersRes.error) throw ordersRes.error;
                if (customersRes.error) throw customersRes.error;
                setOrders(ordersRes.data || []);
                setCustomers(customersRes.data || []);
            } catch (err) {
                reportError(err, { component: 'AdminDashboard', action: 'fetchData' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // KPI Calculations
    const kpis = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay());
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const activeOrders = orders.filter(o => o.status !== 'cancelado');

        const revenueToday = activeOrders
            .filter(o => new Date(o.created_at) >= today)
            .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

        const ordersToday = activeOrders.filter(o => new Date(o.created_at) >= today).length;

        const revenueThisMonth = activeOrders
            .filter(o => new Date(o.created_at) >= thisMonthStart)
            .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

        const revenueLastMonth = activeOrders
            .filter(o => new Date(o.created_at) >= lastMonthStart && new Date(o.created_at) <= lastMonthEnd)
            .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

        const monthGrowth = revenueLastMonth > 0
            ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100).toFixed(1)
            : null;

        const avgOrderValue = activeOrders.length > 0
            ? activeOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0) / activeOrders.length
            : 0;

        const pendingOrders = orders.filter(o => o.status === 'nuevo' || o.status === 'procesando').length;

        return {
            revenueToday,
            ordersToday,
            revenueThisMonth,
            monthGrowth,
            avgOrderValue,
            totalCustomers: customers.length,
            pendingOrders
        };
    }, [orders, customers]);

    // Top Products
    const topProducts = useMemo(() => {
        const productMap = {};
        orders.filter(o => o.status !== 'cancelado').forEach(order => {
            const items = order.items || [];
            items.forEach(item => {
                const id = item.id;
                if (!productMap[id]) {
                    productMap[id] = { id, name: item.name, sold: 0, revenue: 0 };
                }
                productMap[id].sold += item.quantity || 0;
                productMap[id].revenue += (item.quantity || 0) * (item.price || 0);
            });
        });
        return Object.values(productMap).sort((a, b) => b.sold - a.sold).slice(0, 5);
    }, [orders]);

    // Low Stock
    const lowStock = useMemo(() => {
        return products
            .filter(p => p.stock != null && p.stock <= 5)
            .sort((a, b) => (a.stock || 0) - (b.stock || 0))
            .slice(0, 5);
    }, [products]);

    // Recent Orders
    const recentOrders = orders.slice(0, 5);

    // Revenue last 7 days for mini chart
    const last7Days = useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const dayRevenue = orders
                .filter(o => o.status !== 'cancelado')
                .filter(o => {
                    const created = new Date(o.created_at);
                    return created >= dayStart && created < dayEnd;
                })
                .reduce((sum, o) => sum + Number(o.total_price || 0), 0);

            days.push({
                label: dayStart.toLocaleDateString('es-ES', { weekday: 'short' }),
                revenue: dayRevenue
            });
        }
        return days;
    }, [orders]);

    const maxRevenue = Math.max(...last7Days.map(d => d.revenue), 1);

    const statusColors = {
        nuevo: 'bg-blue-100 text-blue-700',
        procesando: 'bg-amber-100 text-amber-700',
        entregado: 'bg-green-100 text-green-700',
        cancelado: 'bg-red-100 text-red-700'
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-forest/5 rounded-xl animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 bg-white rounded-3xl animate-pulse" />
                    <div className="h-64 bg-white rounded-3xl animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-black text-forest tracking-tight">Dashboard</h1>
                <p className="text-sm text-forest/40 font-medium mt-1">
                    Resumen de tu negocio · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue Today */}
                <KPICard
                    icon={<DollarSign className="w-5 h-5" />}
                    label="Ingresos Hoy"
                    value={formatPrice(kpis.revenueToday, config.currencySymbol)}
                    accent="bg-emerald-50 text-emerald-600"
                    iconBg="bg-emerald-100"
                />

                {/* Orders Today */}
                <KPICard
                    icon={<ShoppingBag className="w-5 h-5" />}
                    label="Pedidos Hoy"
                    value={kpis.ordersToday}
                    subtitle={`${kpis.pendingOrders} pendientes`}
                    accent="bg-blue-50 text-blue-600"
                    iconBg="bg-blue-100"
                />

                {/* Revenue This Month */}
                <KPICard
                    icon={<BarChart3 className="w-5 h-5" />}
                    label="Mes Actual"
                    value={formatPrice(kpis.revenueThisMonth, config.currencySymbol)}
                    subtitle={kpis.monthGrowth != null ? (
                        <span className={`flex items-center gap-1 ${Number(kpis.monthGrowth) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {Number(kpis.monthGrowth) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {kpis.monthGrowth}% vs mes anterior
                        </span>
                    ) : null}
                    accent="bg-purple-50 text-purple-600"
                    iconBg="bg-purple-100"
                />

                {/* Customers */}
                <KPICard
                    icon={<Users className="w-5 h-5" />}
                    label="Clientes"
                    value={kpis.totalCustomers}
                    subtitle={`Ticket medio: ${formatPrice(kpis.avgOrderValue, config.currencySymbol)}`}
                    accent="bg-amber-50 text-amber-600"
                    iconBg="bg-amber-100"
                />
            </div>

            {/* Revenue Chart + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart (Last 7 Days) */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-sm font-black text-forest uppercase tracking-widest">Ingresos (7 días)</h2>
                    </div>
                    <div className="flex items-end gap-2 h-40">
                        {last7Days.map((day, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-[9px] font-bold text-forest/40">
                                    {day.revenue > 0 ? formatPrice(day.revenue, config.currencySymbol) : ''}
                                </span>
                                <div
                                    className="w-full bg-gradient-to-t from-forest to-forest/60 rounded-xl transition-all duration-500 min-h-[4px]"
                                    style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 3)}%` }}
                                />
                                <span className="text-[10px] font-bold text-forest/30 uppercase">{day.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5">
                    <h2 className="text-sm font-black text-forest uppercase tracking-widest mb-6">Top Productos</h2>
                    {topProducts.length === 0 ? (
                        <p className="text-sm text-forest/40 font-medium">No hay datos aún</p>
                    ) : (
                        <div className="space-y-3">
                            {topProducts.map((p, i) => (
                                <div key={p.id} className="flex items-center gap-4">
                                    <span className="w-7 h-7 rounded-xl bg-forest/5 flex items-center justify-center text-xs font-black text-forest/40">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-forest truncate">{p.name}</p>
                                        <p className="text-[10px] text-forest/40 font-medium">{p.sold} vendidos</p>
                                    </div>
                                    <span className="text-sm font-black text-forest">
                                        {formatPrice(p.revenue, config.currencySymbol)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Orders + Low Stock */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5">
                    <h2 className="text-sm font-black text-forest uppercase tracking-widest mb-6">Pedidos Recientes</h2>
                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-forest/40 font-medium">No hay pedidos aún</p>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map(order => (
                                <div key={order.id} className="flex items-center gap-4 p-3 bg-organic rounded-2xl">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-forest truncate">{order.customer_name}</p>
                                        <p className="text-[10px] text-forest/40 font-medium">
                                            {new Date(order.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                        {order.status}
                                    </span>
                                    <span className="text-sm font-black text-forest min-w-[60px] text-right">
                                        {formatPrice(order.total_price, config.currencySymbol)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-forest/5">
                    <div className="flex items-center gap-2 mb-6">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <h2 className="text-sm font-black text-forest uppercase tracking-widest">Stock Bajo</h2>
                    </div>
                    {lowStock.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="w-10 h-10 text-forest/10 mx-auto mb-3" />
                            <p className="text-sm text-forest/40 font-medium">Todo el stock está bien 👍</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {lowStock.map(p => (
                                <div key={p.id} className="flex items-center gap-4 p-3 bg-organic rounded-2xl">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-forest/5 shrink-0">
                                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-forest truncate">{p.name}</p>
                                    </div>
                                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${p.stock === 0
                                        ? 'bg-red-100 text-red-600'
                                        : 'bg-amber-100 text-amber-600'
                                        }`}>
                                        {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KPICard({ icon, label, value, subtitle, accent, iconBg }) {
    return (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-forest/5 flex flex-col">
            <div className={`w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center mb-4 ${accent.split(' ').pop()}`}>
                {icon}
            </div>
            <span className="text-[9px] font-black text-forest/30 uppercase tracking-[0.2em] mb-1">{label}</span>
            <span className="text-2xl font-black text-forest leading-none mb-1">{value}</span>
            {subtitle && (
                <span className="text-[10px] font-medium text-forest/40 mt-1">{typeof subtitle === 'string' ? subtitle : subtitle}</span>
            )}
        </div>
    );
}

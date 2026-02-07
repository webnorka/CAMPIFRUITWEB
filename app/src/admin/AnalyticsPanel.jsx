import { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Calendar, ArrowUp, ArrowDown, Package } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useConfig } from '../context/ConfigContext';
import { formatPrice } from '../utils/whatsapp';

// eslint-disable-next-line no-unused-vars
const KpiCard = ({ icon: Icon, label, value, sub, color = 'text-forest' }) => (
    <div className="card-bento p-6 bg-white">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color === 'text-accent-dark' ? 'bg-accent/20' : color === 'text-indigo-600' ? 'bg-indigo-50' : color === 'text-emerald-600' ? 'bg-emerald-50' : 'bg-forest/5'}`}>
                <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-[9px] font-black text-forest/30 uppercase tracking-[0.2em]">{label}</p>
        </div>
        <p className={`text-2xl font-display font-black ${color} mb-1`}>{value}</p>
        {sub && <p className="text-[10px] font-bold text-forest/30">{sub}</p>}
    </div>
);

const PERIODS = [
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: '90d', label: '90 días' },
    { key: 'all', label: 'Todo' },
];

export default function AnalyticsPanel() {
    const { config } = useConfig();
    const [orders, setOrders] = useState([]);
    const [_products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [ordersRes, productsRes] = await Promise.all([
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('products').select('id, name, price, offer_price, on_sale, image, category'),
            ]);
            setOrders(ordersRes.data || []);
            setProducts(productsRes.data || []);
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredOrders = useMemo(() => {
        if (period === 'all') return orders;
        const days = parseInt(period);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        return orders.filter(o => new Date(o.created_at) >= cutoff);
    }, [orders, period]);

    const stats = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const totalOrders = filteredOrders.length;
        const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const paidOrders = filteredOrders.filter(o => o.payment_status === 'paid').length;
        const pendingOrders = filteredOrders.filter(o => o.status === 'nuevo').length;
        const deliveredOrders = filteredOrders.filter(o => o.status === 'entregado').length;

        // Revenue by day (last 7 entries)
        const revenueByDay = {};
        filteredOrders.forEach(o => {
            const day = new Date(o.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            revenueByDay[day] = (revenueByDay[day] || 0) + (o.total_price || 0);
        });
        const dailyRevenue = Object.entries(revenueByDay).slice(-7);
        const maxDailyRevenue = Math.max(...dailyRevenue.map(([, v]) => v), 1);

        // Top products by order frequency
        const productCounts = {};
        filteredOrders.forEach(o => {
            (o.items || []).forEach(item => {
                const name = item.name || 'Desconocido';
                productCounts[name] = (productCounts[name] || 0) + (item.quantity || 1);
            });
        });
        const topProducts = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        const maxProductCount = Math.max(...topProducts.map(([, v]) => v), 1);

        // Orders by status
        const statusCounts = {};
        filteredOrders.forEach(o => {
            statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });

        return { totalRevenue, totalOrders, avgTicket, paidOrders, pendingOrders, deliveredOrders, dailyRevenue, maxDailyRevenue, topProducts, maxProductCount, statusCounts };
    }, [filteredOrders]);

    if (loading) {
        return (
            <div className="animate-fade-in space-y-6">
                <div className="h-8 w-48 bg-forest/5 rounded-xl animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1, 2].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse" />)}
                </div>
            </div>
        );
    }


    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-display font-black text-forest tracking-tight">Analíticas</h2>
                    <p className="text-[10px] font-black text-forest/30 uppercase tracking-[0.3em] mt-1">Resumen de rendimiento</p>
                </div>
                <div className="flex bg-white rounded-2xl border border-forest/5 p-1 shadow-sm">
                    {PERIODS.map(p => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === p.key ? 'bg-forest text-accent shadow-lg' : 'text-forest/40 hover:text-forest'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <KpiCard icon={DollarSign} label="Facturación" value={formatPrice(stats.totalRevenue, config.currencySymbol)} sub={`${stats.totalOrders} pedidos`} color="text-accent-dark" />
                <KpiCard icon={ShoppingBag} label="Ticket Medio" value={formatPrice(stats.avgTicket, config.currencySymbol)} color="text-indigo-600" />
                <KpiCard icon={TrendingUp} label="Entregados" value={stats.deliveredOrders} sub={`de ${stats.totalOrders}`} color="text-emerald-600" />
                <KpiCard icon={Package} label="Pendientes" value={stats.pendingOrders} sub="Nuevos pedidos" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart (CSS bars) */}
                <div className="card-bento p-8 bg-white">
                    <h3 className="text-sm font-black text-forest mb-6 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-accent-dark" /> Facturación por Día
                    </h3>
                    {stats.dailyRevenue.length === 0 ? (
                        <p className="text-sm text-forest/30 text-center py-12">Sin datos en este periodo</p>
                    ) : (
                        <div className="flex items-end gap-3 h-48">
                            {stats.dailyRevenue.map(([day, revenue]) => (
                                <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                    <span className="text-[9px] font-black text-forest/40">
                                        {formatPrice(revenue, config.currencySymbol)}
                                    </span>
                                    <div
                                        className="w-full bg-gradient-to-t from-accent to-accent/40 rounded-xl transition-all duration-500"
                                        style={{ height: `${Math.max((revenue / stats.maxDailyRevenue) * 100, 8)}%` }}
                                    />
                                    <span className="text-[8px] font-black text-forest/30 uppercase tracking-wider">{day}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Top Products (horizontal bars) */}
                <div className="card-bento p-8 bg-white">
                    <h3 className="text-sm font-black text-forest mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" /> Productos Más Vendidos
                    </h3>
                    {stats.topProducts.length === 0 ? (
                        <p className="text-sm text-forest/30 text-center py-12">Sin datos en este periodo</p>
                    ) : (
                        <div className="space-y-4">
                            {stats.topProducts.map(([name, count], i) => (
                                <div key={name}>
                                    <div className="flex justify-between mb-1.5">
                                        <span className="text-xs font-black text-forest truncate pr-4">{name}</span>
                                        <span className="text-[10px] font-black text-forest/40 tabular-nums">{count} uds</span>
                                    </div>
                                    <div className="h-3 bg-organic rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${i === 0 ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : i === 1 ? 'bg-gradient-to-r from-indigo-400 to-violet-400' : 'bg-indigo-200'}`}
                                            style={{ width: `${(count / stats.maxProductCount) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Status Distribution */}
            <div className="card-bento p-8 bg-white mt-6">
                <h3 className="text-sm font-black text-forest mb-6 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-forest/40" /> Distribución por Estado
                </h3>
                <div className="flex gap-4 flex-wrap">
                    {Object.entries(stats.statusCounts).map(([status, count]) => {
                        const colors = {
                            nuevo: 'bg-blue-100 text-blue-700 border-blue-200',
                            procesando: 'bg-amber-100 text-amber-700 border-amber-200',
                            entregado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                            cancelado: 'bg-rose-100 text-rose-700 border-rose-200',
                        };
                        return (
                            <div key={status} className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                <span className="text-2xl font-display font-black">{count}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">{status}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Download,
    Filter,
    Eye,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Calendar,
    User,
    DollarSign,
    ShoppingBag
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { formatPrice } from '../utils/whatsapp';
import { useConfig } from '../context/ConfigContext';

export default function OrdersList() {
    const { config } = useConfig();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching orders:', error);
        else setOrders(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) console.error('Error updating status:', error);
        else {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => ({ ...prev, status: newStatus }));
            }
        }
    };

    const exportToCSV = () => {
        const headers = ["ID", "Fecha", "Cliente", "Total", "Estado", "Productos", "Notas"];
        const rows = filteredOrders.map(o => [
            o.id,
            new Date(o.created_at).toLocaleString(),
            o.customer_name,
            o.total_price,
            o.status,
            o.items.map(i => `${i.quantity}x ${i.name}`).join('; '),
            o.notes || ''
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `pedidos_campifruit_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'nuevo': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'procesando': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'entregado': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'cancelado': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-display font-black text-forest tracking-tight">Registro de Pedidos</h2>
                    <p className="text-forest/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Gestiona las ventas de tu negocio</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-3 bg-white border border-forest/5 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-forest/60 hover:text-forest hover:shadow-xl transition-all"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                    <button
                        onClick={fetchOrders}
                        className="bg-forest text-accent p-4 rounded-2xl shadow-xl shadow-forest/20 hover:scale-105 transition-all"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Filters bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/20" />
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white border border-forest/5 rounded-[2rem] focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 bg-white px-6 rounded-[2rem] border border-forest/5 shadow-sm">
                    <Filter className="w-4 h-4 text-forest/20" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-transparent border-none outline-none py-5 font-black text-[10px] uppercase tracking-widest text-forest active:ring-0 focus:ring-0"
                    >
                        <option value="todos">Todos los Estados</option>
                        <option value="nuevo">Nuevos</option>
                        <option value="procesando">Procesando</option>
                        <option value="entregado">Entregados</option>
                        <option value="cancelado">Cancelados</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card-bento bg-white">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-forest/30">Cargando pedidos...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-20 text-center">
                        <ShoppingBag className="w-16 h-16 text-forest/5 mx-auto mb-6" />
                        <p className="font-black text-forest/20 uppercase tracking-widest text-sm">No se encontraron pedidos</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-organic/50 border-b border-forest/5">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Cliente</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Fecha</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Total</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Estado</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-forest/5">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-organic/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-forest/5 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-forest/40" />
                                                </div>
                                                <span className="font-black text-forest">{order.customer_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-forest">
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-[10px] font-medium text-forest/40">
                                                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-lg font-black text-forest">
                                                {formatPrice(order.total_price, config.currencySymbol)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-3 hover:bg-forest hover:text-white rounded-xl transition-all text-forest/40"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Detalle */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-forest/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up">
                        <div className="p-10">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h3 className="text-3xl font-display font-black text-forest">Detalle del Pedido</h3>
                                    <p className="text-[10px] font-black text-forest/40 uppercase tracking-[0.2em] mt-1">ID: {selectedOrder.id.split('-')[0]}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(selectedOrder.status)}`}>
                                    {selectedOrder.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest flex items-center gap-2">
                                        <User className="w-3 h-3" /> Cliente
                                    </p>
                                    <p className="font-black text-lg text-forest">{selectedOrder.customer_name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Fecha
                                    </p>
                                    <p className="font-black text-lg text-forest">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="border border-forest/5 rounded-[2rem] overflow-hidden mb-10">
                                <table className="w-full">
                                    <thead className="bg-organic/50 h-12">
                                        <tr>
                                            <th className="px-6 text-[10px] font-black uppercase tracking-widest text-forest/40 text-left">Producto</th>
                                            <th className="px-6 text-[10px] font-black uppercase tracking-widest text-forest/40 text-center">Cant.</th>
                                            <th className="px-6 text-[10px] font-black uppercase tracking-widest text-forest/40 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-forest/5">
                                        {selectedOrder.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4 font-bold text-forest text-sm">{item.name}</td>
                                                <td className="px-6 py-4 text-center font-black text-xs text-forest/60">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right font-black text-sm text-forest">
                                                    {formatPrice((item.onSale ? item.offerPrice : item.price) * item.quantity, config.currencySymbol)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="bg-forest p-8 flex justify-between items-center text-white">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Total del Pedido</span>
                                    <span className="text-3xl font-display font-black text-accent">{formatPrice(selectedOrder.total_price, config.currencySymbol)}</span>
                                </div>
                            </div>

                            {selectedOrder.notes && (
                                <div className="mb-10 space-y-2">
                                    <p className="text-[10px] font-black text-forest/30 uppercase tracking-widest">Notas del Cliente</p>
                                    <div className="p-6 bg-organic rounded-2xl border border-forest/5 italic text-sm text-forest/60">
                                        "{selectedOrder.notes}"
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleUpdateStatus(selectedOrder.id, 'procesando')}
                                    className="flex-1 bg-amber-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Clock className="w-4 h-4" /> Procesar
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedOrder.id, 'entregado')}
                                    className="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Entregado
                                </button>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-8 bg-forest/5 text-forest/40 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-forest/10 transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

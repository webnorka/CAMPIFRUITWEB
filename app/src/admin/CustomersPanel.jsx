import { useState, useEffect, useMemo } from 'react';
import { useConfirm } from '../components/ConfirmModal';
import {
    Search,
    Download,
    Eye,
    User,
    Mail,
    Phone,
    Calendar,
    ShoppingBag,
    DollarSign,
    X,
    Edit2,
    Trash2,
    Save
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { formatPrice } from '../utils/whatsapp';
import { useConfig } from '../context/ConfigContext';

export default function CustomersPanel() {
    const { config } = useConfig();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerOrders, setCustomerOrders] = useState([]);
    const [editingNotes, setEditingNotes] = useState(false);
    const [notes, setNotes] = useState('');

    const fetchCustomers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching customers:', error);
        else setCustomers(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (c.phone && c.phone.includes(searchTerm))
        );
    }, [customers, searchTerm]);

    const handleViewCustomer = async (customer) => {
        setSelectedCustomer(customer);
        setNotes(customer.notes || '');
        setEditingNotes(false);

        // Fetch orders for this customer
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', customer.id)
            .order('created_at', { ascending: false });

        setCustomerOrders(data || []);
    };

    const handleSaveNotes = async () => {
        const { error } = await supabase
            .from('customers')
            .update({ notes })
            .eq('id', selectedCustomer.id);

        if (!error) {
            setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, notes } : c));
            setSelectedCustomer(prev => ({ ...prev, notes }));
            setEditingNotes(false);
        }
    };

    const confirm = useConfirm();

    const handleDeleteCustomer = async (id) => {
        if (!await confirm('¿Eliminar este cliente? Sus pedidos se mantendrán pero perderán la asociación.')) return;

        const { error } = await supabase.from('customers').delete().eq('id', id);
        if (!error) {
            setCustomers(prev => prev.filter(c => c.id !== id));
            if (selectedCustomer?.id === id) setSelectedCustomer(null);
        }
    };

    const escapeCSV = (val) => {
        const str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const exportToCSV = () => {
        const headers = ["Nombre", "Email", "Teléfono", "Total Pedidos", "Total Gastado", "Fecha Registro", "Notas"];
        const rows = filteredCustomers.map(c => [
            escapeCSV(c.name),
            escapeCSV(c.email || ''),
            escapeCSV(c.phone || ''),
            escapeCSV(c.total_orders || 0),
            escapeCSV(c.total_spent || 0),
            escapeCSV(new Date(c.created_at).toLocaleDateString()),
            escapeCSV(c.notes || '')
        ]);

        const csvContent = [headers.map(escapeCSV), ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `clientes_campifruit_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-display font-black text-forest tracking-tight">Clientes</h2>
                    <p className="text-forest/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        {customers.length} clientes registrados
                    </p>
                </div>

                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-3 bg-white border border-forest/5 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-forest/60 hover:text-forest hover:shadow-xl transition-all"
                >
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </div>

            {/* Search */}
            <div className="mb-8 relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/20" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-white border border-forest/5 rounded-[2rem] focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest shadow-sm"
                />
            </div>

            {/* Customers Table */}
            <div className="card-bento bg-white">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-forest/30">Cargando clientes...</p>
                    </div>
                ) : filteredCustomers.length === 0 ? (
                    <div className="py-20 text-center">
                        <User className="w-16 h-16 text-forest/5 mx-auto mb-6" />
                        <p className="font-black text-forest/20 uppercase tracking-widest text-sm">No se encontraron clientes</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-organic/50 border-b border-forest/5">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Cliente</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Contacto</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Pedidos</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Total Gastado</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40">Registro</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-forest/40 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-forest/5">
                                {filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-organic/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-forest/5 rounded-full flex items-center justify-center">
                                                    <User className="w-5 h-5 text-forest/40" />
                                                </div>
                                                <span className="font-black text-forest">{customer.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                {customer.email && (
                                                    <div className="flex items-center gap-2 text-sm text-forest/60">
                                                        <Mail className="w-3 h-3" />
                                                        {customer.email}
                                                    </div>
                                                )}
                                                {customer.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-forest/60">
                                                        <Phone className="w-3 h-3" />
                                                        {customer.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-forest">{customer.total_orders || 0}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-forest">
                                                {formatPrice(customer.total_spent || 0, config.currencySymbol)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-sm text-forest/60">
                                                {new Date(customer.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewCustomer(customer)}
                                                    className="p-3 hover:bg-forest hover:text-white rounded-xl transition-all text-forest/40"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer.id)}
                                                    className="p-3 hover:bg-rose-50 rounded-xl transition-all text-rose-300 hover:text-rose-500"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-forest/80 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)} />
                    <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col">
                        <div className="p-10 overflow-y-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-forest/5 rounded-2xl flex items-center justify-center">
                                        <User className="w-8 h-8 text-forest/40" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-display font-black text-forest">{selectedCustomer.name}</h3>
                                        <p className="text-[10px] font-black text-forest/40 uppercase tracking-[0.2em] mt-1">
                                            Cliente desde {new Date(selectedCustomer.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedCustomer(null)} className="p-3 hover:bg-gray-100 rounded-xl">
                                    <X className="w-6 h-6 text-forest/40" />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 mb-10">
                                <div className="bg-organic rounded-2xl p-6 text-center">
                                    <ShoppingBag className="w-6 h-6 text-forest/20 mx-auto mb-2" />
                                    <p className="text-3xl font-black text-forest">{selectedCustomer.total_orders || 0}</p>
                                    <p className="text-[10px] font-black text-forest/40 uppercase tracking-widest">Pedidos</p>
                                </div>
                                <div className="bg-organic rounded-2xl p-6 text-center">
                                    <DollarSign className="w-6 h-6 text-forest/20 mx-auto mb-2" />
                                    <p className="text-3xl font-black text-forest">{formatPrice(selectedCustomer.total_spent || 0, config.currencySymbol)}</p>
                                    <p className="text-[10px] font-black text-forest/40 uppercase tracking-widest">Total Gastado</p>
                                </div>
                                <div className="bg-organic rounded-2xl p-6 text-center">
                                    <Calendar className="w-6 h-6 text-forest/20 mx-auto mb-2" />
                                    <p className="text-lg font-black text-forest">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                                    <p className="text-[10px] font-black text-forest/40 uppercase tracking-widest">Registro</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-organic rounded-2xl p-6 mb-10">
                                <h4 className="font-black text-forest mb-4">Información de Contacto</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-forest/20" />
                                        <span className="text-forest">{selectedCustomer.email || 'No proporcionado'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-forest/20" />
                                        <span className="text-forest">{selectedCustomer.phone || 'No proporcionado'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-black text-forest">Notas Internas</h4>
                                    {!editingNotes && (
                                        <button onClick={() => setEditingNotes(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                                            <Edit2 className="w-4 h-4 text-forest/40" />
                                        </button>
                                    )}
                                </div>
                                {editingNotes ? (
                                    <div className="space-y-4">
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows={4}
                                            className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-medium text-forest resize-none"
                                            placeholder="Añade notas sobre este cliente..."
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleSaveNotes}
                                                className="flex items-center gap-2 bg-forest text-accent px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest"
                                            >
                                                <Save className="w-4 h-4" />
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => { setEditingNotes(false); setNotes(selectedCustomer.notes || ''); }}
                                                className="px-6 py-3 text-forest/40 font-black text-[10px] uppercase tracking-widest"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-forest/60 italic bg-organic rounded-2xl p-4">
                                        {selectedCustomer.notes || 'Sin notas'}
                                    </p>
                                )}
                            </div>

                            {/* Order History */}
                            <div>
                                <h4 className="font-black text-forest mb-4">Historial de Pedidos</h4>
                                {customerOrders.length === 0 ? (
                                    <p className="text-forest/40 italic">Este cliente aún no tiene pedidos.</p>
                                ) : (
                                    <div className="border border-forest/5 rounded-2xl overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-organic/50">
                                                <tr>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-forest/40 text-left">Fecha</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-forest/40 text-left">Total</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-forest/40 text-left">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-forest/5">
                                                {customerOrders.map(order => (
                                                    <tr key={order.id}>
                                                        <td className="px-6 py-4 text-sm text-forest">{new Date(order.created_at).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 font-black text-forest">{formatPrice(order.total_price, config.currencySymbol)}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === 'entregado' ? 'bg-emerald-100 text-emerald-600' :
                                                                order.status === 'nuevo' ? 'bg-blue-100 text-blue-600' :
                                                                    order.status === 'procesando' ? 'bg-amber-100 text-amber-600' :
                                                                        'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

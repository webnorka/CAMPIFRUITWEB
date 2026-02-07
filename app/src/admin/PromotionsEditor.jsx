import { useState, useEffect } from 'react';
import { useConfirm } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Save,
    Percent,
    DollarSign,
    Gift,
    Calendar,
    CheckCircle2,
    Eye,
    EyeOff
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function PromotionsEditor() {
    const confirm = useConfirm();
    const toast = useToast();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'percentage',
        value: '',
        min_purchase: '',
        start_date: '',
        end_date: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchPromotions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('promotions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching promotions:', error);
        else setPromotions(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleAdd = () => {
        setIsAdding(true);
        setEditingPromotion(null);
        setFormData({
            name: '',
            type: 'percentage',
            value: '',
            min_purchase: '',
            start_date: '',
            end_date: ''
        });
    };

    const handleEdit = (promo) => {
        setEditingPromotion(promo);
        setIsAdding(false);
        setFormData({
            name: promo.name,
            type: promo.type,
            value: promo.value,
            min_purchase: promo.min_purchase || '',
            start_date: promo.start_date ? promo.start_date.split('T')[0] : '',
            end_date: promo.end_date ? promo.end_date.split('T')[0] : ''
        });
    };

    const handleCancel = () => {
        setEditingPromotion(null);
        setIsAdding(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.value) return;

        const promoData = {
            name: formData.name,
            type: formData.type,
            value: Number(formData.value),
            min_purchase: formData.min_purchase ? Number(formData.min_purchase) : null,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null,
            active: true
        };

        try {
            if (isAdding) {
                const { data, error } = await supabase
                    .from('promotions')
                    .insert([{ id: crypto.randomUUID(), ...promoData }])
                    .select();
                if (error) throw error;
                setPromotions(prev => [data[0], ...prev]);
            } else {
                const { error } = await supabase
                    .from('promotions')
                    .update(promoData)
                    .eq('id', editingPromotion.id);
                if (error) throw error;
                setPromotions(prev => prev.map(p => p.id === editingPromotion.id ? { ...p, ...promoData } : p));
            }
            handleCancel();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch {
            toast.error('Error al guardar la promoción');
        }
    };

    const handleDelete = async (id) => {
        if (!await confirm('¿Eliminar esta promoción? Los códigos de descuento asociados también se eliminarán.')) return;
        const { error } = await supabase.from('promotions').delete().eq('id', id);
        if (!error) setPromotions(prev => prev.filter(p => p.id !== id));
    };

    const handleToggleActive = async (promo) => {
        const { error } = await supabase
            .from('promotions')
            .update({ active: !promo.active })
            .eq('id', promo.id);
        if (!error) setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, active: !p.active } : p));
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'percentage': return Percent;
            case 'fixed_amount': return DollarSign;
            case 'buy_x_get_y': return Gift;
            default: return Percent;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'percentage': return 'Porcentaje';
            case 'fixed_amount': return 'Cantidad Fija';
            case 'buy_x_get_y': return 'Compra X Lleva Y';
            default: return type;
        }
    };

    const formatValue = (promo) => {
        if (promo.type === 'percentage') return `${promo.value}%`;
        if (promo.type === 'fixed_amount') return `$${promo.value}`;
        return promo.value;
    };

    const isExpired = (promo) => {
        if (!promo.end_date) return false;
        return new Date(promo.end_date) < new Date();
    };

    const isUpcoming = (promo) => {
        if (!promo.start_date) return false;
        return new Date(promo.start_date) > new Date();
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-display font-black text-forest tracking-tight">Promociones</h2>
                    <p className="text-forest/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        Gestiona ofertas y descuentos
                    </p>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-3 bg-forest text-accent px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-forest/20 hover:scale-105 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nueva Promoción
                </button>
            </div>

            {/* Success toast */}
            {showSuccess && (
                <div className="fixed top-8 right-8 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-xl flex items-center gap-3 animate-slide-up z-50">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Guardado correctamente</span>
                </div>
            )}

            {/* Add/Edit Form */}
            {(isAdding || editingPromotion) && (
                <div className="card-bento bg-white mb-8 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-display font-black text-forest">
                                {isAdding ? 'Nueva Promoción' : 'Editar Promoción'}
                            </h3>
                            <button type="button" onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-forest/40" />
                            </button>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                Nombre de la Promoción *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                placeholder="Ej: Descuento de Bienvenida"
                                required
                            />
                        </div>

                        {/* Type Selector */}
                        <div>
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-3">
                                Tipo de Descuento
                            </label>
                            <div className="flex gap-4">
                                {[
                                    { value: 'percentage', icon: Percent, label: 'Porcentaje' },
                                    { value: 'fixed_amount', icon: DollarSign, label: 'Cantidad Fija' }
                                ].map(type => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: type.value })}
                                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${formData.type === type.value
                                            ? 'border-accent bg-accent/10 text-forest'
                                            : 'border-forest/5 text-forest/40 hover:border-forest/20'
                                            }`}
                                    >
                                        <type.icon className="w-5 h-5" />
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Valor del Descuento *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-forest/40 font-bold">
                                        {formData.type === 'percentage' ? '%' : '$'}
                                    </span>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                        placeholder={formData.type === 'percentage' ? '10' : '5000'}
                                        min="0"
                                        max={formData.type === 'percentage' ? '100' : undefined}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Compra Mínima (opcional)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-forest/40 font-bold">$</span>
                                    <input
                                        type="number"
                                        value={formData.min_purchase}
                                        onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                        placeholder="0"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Fecha de Inicio (opcional)
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Fecha de Fin (opcional)
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-8 py-4 text-forest/40 font-black uppercase tracking-widest hover:bg-gray-100 rounded-2xl transition-all text-[10px]"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-3 bg-forest text-accent px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-forest/20 hover:scale-105 transition-all"
                            >
                                <Save className="w-4 h-4" />
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Promotions List */}
            <div className="card-bento bg-white">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-forest/30">Cargando promociones...</p>
                    </div>
                ) : promotions.length === 0 ? (
                    <div className="py-20 text-center">
                        <Percent className="w-16 h-16 text-forest/5 mx-auto mb-6" />
                        <p className="font-black text-forest/20 uppercase tracking-widest text-sm mb-6">No hay promociones creadas</p>
                        <button onClick={handleAdd} className="text-accent-dark font-bold hover:underline">
                            Crear la primera promoción
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-forest/5">
                        {promotions.map(promo => {
                            const TypeIcon = getTypeIcon(promo.type);
                            const expired = isExpired(promo);
                            const upcoming = isUpcoming(promo);

                            return (
                                <div
                                    key={promo.id}
                                    className={`flex items-center gap-6 p-6 hover:bg-organic/30 transition-all ${!promo.active || expired ? 'opacity-50' : ''
                                        }`}
                                >
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${promo.type === 'percentage' ? 'bg-blue-100' :
                                        promo.type === 'fixed_amount' ? 'bg-emerald-100' :
                                            'bg-purple-100'
                                        }`}>
                                        <TypeIcon className={`w-6 h-6 ${promo.type === 'percentage' ? 'text-blue-600' :
                                            promo.type === 'fixed_amount' ? 'text-emerald-600' :
                                                'text-purple-600'
                                            }`} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-forest truncate">{promo.name}</h4>
                                            {expired && (
                                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-md text-[8px] font-black uppercase">
                                                    Expirado
                                                </span>
                                            )}
                                            {upcoming && (
                                                <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-md text-[8px] font-black uppercase">
                                                    Próximamente
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-forest/40">
                                            <span className="font-bold">{getTypeLabel(promo.type)}</span>
                                            <span className="font-black text-accent-dark">{formatValue(promo)}</span>
                                            {promo.min_purchase && (
                                                <span>Min: ${promo.min_purchase}</span>
                                            )}
                                        </div>
                                        {(promo.start_date || promo.end_date) && (
                                            <div className="flex items-center gap-2 text-[10px] text-forest/30 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {promo.start_date && new Date(promo.start_date).toLocaleDateString()}
                                                {promo.start_date && promo.end_date && ' - '}
                                                {promo.end_date && new Date(promo.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(promo)}
                                            className={`p-3 rounded-xl transition-all ${promo.active ? 'hover:bg-emerald-50 text-emerald-500' : 'hover:bg-gray-100 text-forest/20'
                                                }`}
                                        >
                                            {promo.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(promo)}
                                            className="p-3 hover:bg-forest/5 rounded-xl transition-all text-forest/40 hover:text-forest"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promo.id)}
                                            className="p-3 hover:bg-rose-50 rounded-xl transition-all text-rose-300 hover:text-rose-500"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

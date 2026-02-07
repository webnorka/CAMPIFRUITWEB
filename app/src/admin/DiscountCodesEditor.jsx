import { useState, useEffect } from 'react';
import { useConfirm } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import {
    Plus,
    Trash2,
    Edit2,
    X,
    Save,
    Tag,
    Copy,
    CheckCircle2,
    Eye,
    EyeOff,
    RefreshCw
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function DiscountCodesEditor({ setHasUnsavedChanges }) {
    const confirm = useConfirm();
    const toast = useToast();
    const [codes, setCodes] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCode, setEditingCode] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        promotion_id: '',
        max_uses: ''
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    const fetchData = async () => {
        setLoading(true);

        const [codesRes, promosRes] = await Promise.all([
            supabase.from('discount_codes').select('*').order('created_at', { ascending: false }),
            supabase.from('promotions').select('*').eq('active', true)
        ]);

        if (codesRes.error) console.error('Error fetching codes:', codesRes.error);
        else setCodes(codesRes.data || []);

        if (promosRes.error) console.error('Error fetching promotions:', promosRes.error);
        else setPromotions(promosRes.data || []);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
    };

    const handleAdd = () => {
        setIsAdding(true);
        setEditingCode(null);
        setFormData({ code: '', promotion_id: '', max_uses: '' });
        generateCode();
    };

    const handleEdit = (code) => {
        setEditingCode(code);
        setIsAdding(false);
        setFormData({
            code: code.code,
            promotion_id: code.promotion_id || '',
            max_uses: code.max_uses || ''
        });
    };

    const handleCancel = () => {
        setEditingCode(null);
        setIsAdding(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code.trim() || !formData.promotion_id) return;

        const codeData = {
            code: formData.code.toUpperCase().trim(),
            promotion_id: formData.promotion_id,
            max_uses: formData.max_uses ? Number(formData.max_uses) : null,
            active: true
        };

        try {
            if (isAdding) {
                const { data, error } = await supabase
                    .from('discount_codes')
                    .insert([{ id: crypto.randomUUID(), current_uses: 0, ...codeData }])
                    .select();
                if (error) throw error;
                setCodes(prev => [data[0], ...prev]);
            } else {
                const { error } = await supabase
                    .from('discount_codes')
                    .update(codeData)
                    .eq('id', editingCode.id);
                if (error) throw error;
                setCodes(prev => prev.map(c => c.id === editingCode.id ? { ...c, ...codeData } : c));
            }
            handleCancel();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            if (error.code === '23505') {
                toast.error('Este código ya existe. Por favor, genera uno diferente.');
            } else {
                toast.error('Error al guardar el código');
            }
        }
    };

    const handleDelete = async (id) => {
        if (!await confirm('¿Eliminar este código de descuento?')) return;
        const { error } = await supabase.from('discount_codes').delete().eq('id', id);
        if (!error) setCodes(prev => prev.filter(c => c.id !== id));
    };

    const handleToggleActive = async (code) => {
        const { error } = await supabase
            .from('discount_codes')
            .update({ active: !code.active })
            .eq('id', code.id);
        if (!error) setCodes(prev => prev.map(c => c.id === code.id ? { ...c, active: !c.active } : c));
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const getPromotion = (promotionId) => {
        return promotions.find(p => p.id === promotionId);
    };

    const isExhausted = (code) => {
        return code.max_uses && code.current_uses >= code.max_uses;
    };

    return (
        <div className="animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-display font-black text-forest tracking-tight">Códigos de Descuento</h2>
                    <p className="text-forest/40 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
                        Genera códigos para tus promociones
                    </p>
                </div>

                <button
                    onClick={handleAdd}
                    className="flex items-center gap-3 bg-forest text-accent px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-forest/20 hover:scale-105 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Código
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
            {(isAdding || editingCode) && (
                <div className="card-bento bg-white mb-8 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-display font-black text-forest">
                                {isAdding ? 'Nuevo Código' : 'Editar Código'}
                            </h3>
                            <button type="button" onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="w-5 h-5 text-forest/40" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Código *
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="flex-1 px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-black text-forest uppercase tracking-widest"
                                        placeholder="CODIGO10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="p-4 bg-forest/5 hover:bg-forest/10 rounded-2xl transition-all"
                                        title="Generar código aleatorio"
                                    >
                                        <RefreshCw className="w-5 h-5 text-forest/60" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                    Promoción Asociada *
                                </label>
                                <select
                                    value={formData.promotion_id}
                                    onChange={(e) => setFormData({ ...formData, promotion_id: e.target.value })}
                                    className="w-full px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                    required
                                >
                                    <option value="">Selecciona una promoción...</option>
                                    {promotions.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.type === 'percentage' ? `${p.value}%` : `$${p.value}`})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-forest/40 uppercase tracking-widest mb-2">
                                Límite de Usos (opcional)
                            </label>
                            <input
                                type="number"
                                value={formData.max_uses}
                                onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                className="w-full max-w-xs px-6 py-4 bg-organic border border-forest/5 rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-forest"
                                placeholder="Sin límite"
                                min="1"
                            />
                            <p className="text-[10px] text-forest/30 mt-2">Deja vacío para usos ilimitados</p>
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

            {/* Codes List */}
            <div className="card-bento bg-white">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                        <p className="font-black text-[10px] uppercase tracking-widest text-forest/30">Cargando códigos...</p>
                    </div>
                ) : codes.length === 0 ? (
                    <div className="py-20 text-center">
                        <Tag className="w-16 h-16 text-forest/5 mx-auto mb-6" />
                        <p className="font-black text-forest/20 uppercase tracking-widest text-sm mb-6">No hay códigos creados</p>
                        {promotions.length === 0 ? (
                            <p className="text-forest/40">Primero crea una promoción para asociar códigos</p>
                        ) : (
                            <button onClick={handleAdd} className="text-accent-dark font-bold hover:underline">
                                Crear el primer código
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-forest/5">
                        {codes.map(code => {
                            const promo = getPromotion(code.promotion_id);
                            const exhausted = isExhausted(code);

                            return (
                                <div
                                    key={code.id}
                                    className={`flex items-center gap-6 p-6 hover:bg-organic/30 transition-all ${!code.active || exhausted ? 'opacity-50' : ''
                                        }`}
                                >
                                    {/* Code Badge */}
                                    <div className="flex items-center gap-3">
                                        <div className="bg-forest px-4 py-2 rounded-xl">
                                            <span className="font-black text-accent text-lg tracking-widest">{code.code}</span>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(code.code)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                                            title="Copiar código"
                                        >
                                            {copiedCode === code.code ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-forest/40" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {promo ? (
                                                <span className="text-forest font-bold">{promo.name}</span>
                                            ) : (
                                                <span className="text-forest/40 italic">Promoción no encontrada</span>
                                            )}
                                            {exhausted && (
                                                <span className="px-2 py-0.5 bg-rose-100 text-rose-600 rounded-md text-[8px] font-black uppercase">
                                                    Agotado
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-forest/40">
                                            {promo && (
                                                <span className="font-bold text-accent-dark">
                                                    {promo.type === 'percentage' ? `${promo.value}%` : `$${promo.value}`}
                                                </span>
                                            )}
                                            <span>
                                                Usos: {code.current_uses || 0}
                                                {code.max_uses ? ` / ${code.max_uses}` : ' (ilimitado)'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(code)}
                                            className={`p-3 rounded-xl transition-all ${code.active ? 'hover:bg-emerald-50 text-emerald-500' : 'hover:bg-gray-100 text-forest/20'
                                                }`}
                                        >
                                            {code.active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleEdit(code)}
                                            className="p-3 hover:bg-forest/5 rounded-xl transition-all text-forest/40 hover:text-forest"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(code.id)}
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

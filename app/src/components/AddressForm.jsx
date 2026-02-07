import { useState, useEffect, useCallback } from 'react';
import { MapPin, Plus, Trash2, Check, Home, Building2, Star, X, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useCustomerAuth } from '../context/CustomerAuthContext';

/**
 * AddressForm — Reusable address CRUD component
 * Features:
 *   - List saved addresses
 *   - Add/edit/delete addresses
 *   - Set default address
 *   - Select address (for checkout flow)
 *
 * Props:
 *   - mode: 'manage' (full CRUD in account page) | 'select' (pick address during checkout)
 *   - onSelect: callback(address) when address chosen in 'select' mode
 *   - selectedId: currently selected address id (for 'select' mode)
 */
export default function AddressForm({ mode = 'manage', onSelect, selectedId }) {
    const { customer, isAuthenticated } = useCustomerAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | 'new' | addressId
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        label: 'Casa',
        street: '',
        city: '',
        postal_code: '',
        province: '',
        country: 'España',
        is_default: false
    });

    const LABELS = [
        { value: 'Casa', icon: Home },
        { value: 'Trabajo', icon: Building2 },
        { value: 'Otro', icon: MapPin }
    ];

    const fetchAddresses = useCallback(async () => {
        if (!isAuthenticated || !customer?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('customer_addresses')
                .select('*')
                .eq('customer_id', customer.id)
                .order('is_default', { ascending: false });
            if (error) throw error;
            setAddresses(data || []);
        } catch (err) {
            console.error('Error fetching addresses:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, customer?.id]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    const resetForm = () => {
        setForm({ label: 'Casa', street: '', city: '', postal_code: '', province: '', country: 'España', is_default: false });
        setEditing(null);
    };

    const handleEdit = (address) => {
        setForm({
            label: address.label || 'Casa',
            street: address.street || '',
            city: address.city || '',
            postal_code: address.postal_code || '',
            province: address.province || '',
            country: address.country || 'España',
            is_default: address.is_default || false
        });
        setEditing(address.id);
    };

    const handleSave = async () => {
        if (!form.street.trim() || !form.city.trim()) return;
        setSaving(true);
        try {
            // If setting as default, unset all others first
            if (form.is_default) {
                await supabase
                    .from('customer_addresses')
                    .update({ is_default: false })
                    .eq('customer_id', customer.id);
            }

            if (editing === 'new') {
                const { error } = await supabase
                    .from('customer_addresses')
                    .insert([{ ...form, customer_id: customer.id }]);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('customer_addresses')
                    .update(form)
                    .eq('id', editing);
                if (error) throw error;
            }
            await fetchAddresses();
            resetForm();
        } catch (err) {
            console.error('Error saving address:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await supabase.from('customer_addresses').delete().eq('id', id);
            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            console.error('Error deleting address:', err);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            await supabase
                .from('customer_addresses')
                .update({ is_default: false })
                .eq('customer_id', customer.id);
            await supabase
                .from('customer_addresses')
                .update({ is_default: true })
                .eq('id', id);
            await fetchAddresses();
        } catch (err) {
            console.error('Error setting default:', err);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="text-center py-6 text-forest/40">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold">Inicia sesión para gestionar direcciones</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-forest/20" />
            </div>
        );
    }

    // SELECT MODE — compact address picker for checkout
    if (mode === 'select') {
        return (
            <div className="space-y-3">
                {addresses.length === 0 && !editing && (
                    <div className="text-center py-4 bg-organic rounded-2xl border-2 border-dashed border-forest/10">
                        <MapPin className="w-6 h-6 mx-auto mb-2 text-forest/20" />
                        <p className="text-xs font-bold text-forest/30 mb-2">Sin direcciones guardadas</p>
                    </div>
                )}

                {addresses.map(addr => (
                    <button
                        key={addr.id}
                        onClick={() => onSelect?.(addr)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${selectedId === addr.id
                            ? 'border-forest bg-forest/5 shadow-sm'
                            : 'border-forest/10 bg-white hover:border-forest/30'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedId === addr.id ? 'border-forest bg-forest' : 'border-forest/20'
                                }`}>
                                {selectedId === addr.id && <Check className="w-3 h-3 text-accent" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-black text-forest uppercase tracking-wider">{addr.label || 'Dirección'}</span>
                                    {addr.is_default && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                </div>
                                <p className="text-sm text-forest/60 font-medium truncate">{addr.street}</p>
                                <p className="text-xs text-forest/40 font-medium">{addr.postal_code} {addr.city}{addr.province ? `, ${addr.province}` : ''}</p>
                            </div>
                        </div>
                    </button>
                ))}

                {editing ? (
                    <div className="bg-organic rounded-2xl p-4 border border-forest/10 space-y-3">
                        {renderForm()}
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || !form.street.trim() || !form.city.trim()}
                                className="flex-1 h-10 bg-forest text-accent rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all"
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                                onClick={resetForm}
                                className="px-4 h-10 bg-forest/5 text-forest rounded-xl font-black text-[10px] uppercase tracking-widest"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setEditing('new')}
                        className="w-full h-10 border-2 border-dashed border-forest/10 rounded-2xl text-forest/30 font-black text-[10px] uppercase tracking-widest hover:border-primary-300 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-3.5 h-3.5" /> Nueva Dirección
                    </button>
                )}
            </div>
        );
    }

    // MANAGE MODE — full CRUD for account page
    function renderForm() {
        return (
            <>
                {/* Label selector */}
                <div className="flex gap-2">
                    {LABELS.map(l => {
                        const Icon = l.icon;
                        return (
                            <button
                                key={l.value}
                                type="button"
                                onClick={() => setForm(f => ({ ...f, label: l.value }))}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${form.label === l.value
                                    ? 'bg-forest text-accent border-forest'
                                    : 'bg-white text-forest/40 border-forest/10 hover:border-forest/20'
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {l.value}
                            </button>
                        );
                    })}
                </div>

                <input
                    type="text"
                    value={form.street}
                    onChange={e => setForm(f => ({ ...f, street: e.target.value }))}
                    placeholder="Calle, número, piso..."
                    className="w-full px-4 py-3 bg-white rounded-xl border border-forest/5 text-sm text-forest font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={form.city}
                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                        placeholder="Ciudad"
                        className="px-4 py-3 bg-white rounded-xl border border-forest/5 text-sm text-forest font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                    <input
                        type="text"
                        value={form.postal_code}
                        onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
                        placeholder="Código Postal"
                        className="px-4 py-3 bg-white rounded-xl border border-forest/5 text-sm text-forest font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="text"
                        value={form.province}
                        onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                        placeholder="Provincia"
                        className="px-4 py-3 bg-white rounded-xl border border-forest/5 text-sm text-forest font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                    <input
                        type="text"
                        value={form.country}
                        onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                        placeholder="País"
                        className="px-4 py-3 bg-white rounded-xl border border-forest/5 text-sm text-forest font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                </div>
            </>
        );
    }

    return (
        <div className="space-y-4">
            {addresses.length === 0 && !editing && (
                <div className="text-center py-8 bg-white/50 rounded-3xl border-2 border-dashed border-forest/10">
                    <MapPin className="w-10 h-10 mx-auto mb-3 text-forest/15" />
                    <p className="text-sm font-bold text-forest/30">No tienes direcciones guardadas</p>
                    <p className="text-xs text-forest/20 font-medium mt-1">Añade una dirección de envío</p>
                </div>
            )}

            {addresses.map(addr => (
                <div
                    key={addr.id}
                    className={`bg-white rounded-2xl p-5 border shadow-sm transition-all ${addr.is_default ? 'border-primary-200 ring-1 ring-primary-100' : 'border-forest/5'
                        }`}
                >
                    {editing === addr.id ? (
                        <div className="space-y-3">
                            {renderForm()}
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !form.street.trim() || !form.city.trim()}
                                    className="flex-1 h-10 bg-forest text-accent rounded-xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button onClick={resetForm} className="px-4 h-10 bg-forest/5 text-forest rounded-xl font-black text-[10px] uppercase tracking-widest">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-black text-forest uppercase tracking-wider">{addr.label || 'Dirección'}</span>
                                    {addr.is_default && (
                                        <span className="text-[8px] font-black text-primary-500 bg-primary-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                            Predeterminada
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-forest/70 font-medium">{addr.street}</p>
                                <p className="text-xs text-forest/40 font-medium mt-0.5">
                                    {addr.postal_code} {addr.city}{addr.province ? `, ${addr.province}` : ''} — {addr.country}
                                </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {!addr.is_default && (
                                    <button
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="p-2 text-forest/20 hover:text-amber-500 rounded-lg transition-colors"
                                        title="Establecer como predeterminada"
                                    >
                                        <Star className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEdit(addr)}
                                    className="p-2 text-forest/20 hover:text-forest rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <MapPin className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(addr.id)}
                                    className="p-2 text-forest/20 hover:text-rose-500 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {editing === 'new' ? (
                <div className="bg-white rounded-2xl p-5 border border-forest/5 shadow-sm space-y-3">
                    <span className="text-[10px] font-black text-forest/30 uppercase tracking-widest">Nueva Dirección</span>
                    {renderForm()}
                    <div className="flex items-center gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.is_default}
                                onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                                className="rounded border-forest/20"
                            />
                            <span className="text-[10px] font-black text-forest/40 uppercase tracking-wider">Predeterminada</span>
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={saving || !form.street.trim() || !form.city.trim()}
                            className="flex-1 h-11 bg-forest text-accent rounded-xl font-black text-xs uppercase tracking-[0.15em] disabled:opacity-50 transition-all"
                        >
                            {saving ? 'Guardando...' : 'Guardar Dirección'}
                        </button>
                        <button
                            onClick={resetForm}
                            className="px-5 h-11 bg-forest/5 text-forest rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/10 transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setEditing('new')}
                    className="w-full h-12 border-2 border-dashed border-forest/10 rounded-2xl text-forest/30 font-black text-xs uppercase tracking-widest hover:border-primary-300 hover:text-primary-500 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Añadir Dirección
                </button>
            )}
        </div>
    );
}

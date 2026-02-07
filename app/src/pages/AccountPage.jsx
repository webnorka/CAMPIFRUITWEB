import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ChevronRight, LogOut, Package, Heart } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import AddressForm from '../components/AddressForm';
import SEOHead from '../components/SEOHead';

export default function AccountPage() {
    const { customer, isAuthenticated, loading, signOut, updateProfile } = useCustomerAuth();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');

    if (loading) {
        return (
            <main className="bg-organic min-h-screen pt-32 pb-16">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="h-48 bg-white rounded-3xl animate-pulse" />
                </div>
            </main>
        );
    }

    if (!isAuthenticated) {
        return (
            <main className="bg-organic min-h-screen pt-32 pb-16 flex items-center justify-center">
                <div className="text-center px-4">
                    <User className="w-16 h-16 text-forest/15 mx-auto mb-4" />
                    <h1 className="text-2xl font-display font-black text-forest mb-2">Mi Cuenta</h1>
                    <p className="text-sm text-forest/40 font-medium">Inicia sesión para gestionar tu cuenta</p>
                </div>
            </main>
        );
    }

    const handleEdit = () => {
        setForm({
            name: customer?.name || '',
            email: customer?.email || '',
            phone: customer?.phone || ''
        });
        setEditing(true);
        setSuccess('');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateProfile(form);
            setEditing(false);
            setSuccess('Perfil actualizado');
            setTimeout(() => setSuccess(''), 3000);
        } catch {
            // Error handled by context
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className="bg-organic min-h-screen pt-24 sm:pt-32 pb-16">
            <SEOHead title="Mi Cuenta" noindex />
            <div className="max-w-2xl mx-auto px-4 sm:px-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[10px] font-bold text-forest/40 mb-8" aria-label="Breadcrumb">
                    <Link to="/" className="hover:text-forest transition-colors">Inicio</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-forest font-black">Mi Cuenta</span>
                </nav>

                <h1 className="text-3xl font-display font-black text-forest tracking-tight mb-8">Mi Cuenta</h1>

                {/* Profile Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-forest/5 p-6 sm:p-8 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-forest/5 rounded-2xl flex items-center justify-center">
                            <User className="w-8 h-8 text-forest/30" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-forest">{customer?.name}</h2>
                            <p className="text-sm text-forest/40 font-medium">{customer?.email}</p>
                        </div>
                    </div>

                    {success && (
                        <div className="px-4 py-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-100 mb-4">
                            {success}
                        </div>
                    )}

                    {editing ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/30" />
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-4 bg-organic rounded-2xl border border-forest/5 text-forest font-medium text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                                    placeholder="Nombre"
                                />
                            </div>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/30" />
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full pl-12 pr-4 py-4 bg-organic rounded-2xl border border-forest/5 text-forest font-medium text-sm focus:outline-none focus:ring-2 focus:ring-forest/20"
                                    placeholder="Teléfono"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 h-12 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/90 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button
                                    onClick={() => setEditing(false)}
                                    className="px-6 h-12 bg-forest/5 text-forest rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/10 transition-all"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-forest/30" />
                                <span className="text-forest/60 font-medium">{customer?.email || '—'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-forest/30" />
                                <span className="text-forest/60 font-medium">{customer?.phone || '—'}</span>
                            </div>
                            <button
                                onClick={handleEdit}
                                className="mt-4 px-5 py-2.5 bg-forest/5 text-forest rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-forest/10 transition-colors"
                            >
                                Editar Perfil
                            </button>
                        </div>
                    )}
                </div>

                {/* Addresses Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <MapPin className="w-5 h-5 text-forest/30" />
                        <h2 className="text-lg font-display font-black text-forest">Mis Direcciones</h2>
                    </div>
                    <AddressForm mode="manage" />
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Link
                        to="/mis-pedidos"
                        className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-forest/5 hover:bg-organic transition-colors"
                    >
                        <Package className="w-6 h-6 text-forest/40" />
                        <div className="flex-1">
                            <span className="text-sm font-black text-forest">Mis Pedidos</span>
                            <p className="text-[10px] text-forest/30 font-medium">Ver historial y estado</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-forest/20" />
                    </Link>
                    <Link
                        to="/favoritos"
                        className="flex items-center gap-4 bg-white rounded-2xl p-5 shadow-sm border border-forest/5 hover:bg-organic transition-colors"
                    >
                        <Heart className="w-6 h-6 text-forest/40" />
                        <div className="flex-1">
                            <span className="text-sm font-black text-forest">Favoritos</span>
                            <p className="text-[10px] text-forest/30 font-medium">Productos guardados</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-forest/20" />
                    </Link>
                </div>

                {/* Logout */}
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-sm border border-forest/5 text-red-500 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                </button>
            </div>
        </main>
    );
}

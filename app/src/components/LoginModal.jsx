import { useState, useEffect, useCallback } from 'react';
import { X, Mail, Lock, User, ArrowRight, KeyRound } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

export default function LoginModal({ onClose }) {
    const { signIn, signUp, resetPassword } = useCustomerAuth();
    const [mode, setMode] = useState('login'); // login | register | reset
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'login') {
                await signIn(email, password);
                onClose();
            } else if (mode === 'register') {
                await signUp(email, password, name);
                setSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
            } else if (mode === 'reset') {
                await resetPassword(email);
                setSuccess('Te hemos enviado un email para restablecer tu contraseña.');
            }
        } catch (err) {
            const msg = err.message || 'Error inesperado';
            if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos');
            else if (msg.includes('already registered')) setError('Este email ya está registrado');
            else if (msg.includes('Password')) setError('La contraseña debe tener al menos 6 caracteres');
            else setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const titles = {
        login: 'Iniciar Sesión',
        register: 'Crear Cuenta',
        reset: 'Restablecer Contraseña'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-forest/70 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-forest/5 rounded-2xl flex items-center justify-center hover:bg-forest hover:text-white transition-all"
                    aria-label="Cerrar"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 sm:p-10">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-2xl sm:text-3xl font-display font-black text-forest tracking-tight">
                            {titles[mode]}
                        </h2>
                        <p className="text-sm text-forest/40 font-medium mt-1">
                            {mode === 'login' && 'Accede a tu cuenta para ver pedidos y favoritos'}
                            {mode === 'register' && 'Crea una cuenta para gestionar tus pedidos'}
                            {mode === 'reset' && 'Te enviaremos un email para restablecer tu contraseña'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/30" />
                                <input
                                    type="text"
                                    placeholder="Tu nombre"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-organic rounded-2xl border border-forest/5 text-forest font-medium text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/20 placeholder:text-forest/30"
                                    required
                                />
                            </div>
                        )}

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/30" />
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-organic rounded-2xl border border-forest/5 text-forest font-medium text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/20 placeholder:text-forest/30"
                                required
                            />
                        </div>

                        {mode !== 'reset' && (
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/30" />
                                <input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-organic rounded-2xl border border-forest/5 text-forest font-medium text-sm focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/20 placeholder:text-forest/30"
                                    required
                                    minLength={6}
                                />
                            </div>
                        )}

                        {error && (
                            <div className="px-4 py-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="px-4 py-3 bg-green-50 text-green-600 text-xs font-bold rounded-xl border border-green-100">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-forest text-accent rounded-2xl font-black text-xs uppercase tracking-[0.15em] hover:bg-forest/90 transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' && <><ArrowRight className="w-4 h-4" /> Entrar</>}
                                    {mode === 'register' && <><User className="w-4 h-4" /> Crear Cuenta</>}
                                    {mode === 'reset' && <><KeyRound className="w-4 h-4" /> Enviar Email</>}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-6 space-y-3 text-center">
                        {mode === 'login' && (
                            <>
                                <button
                                    onClick={() => { setMode('reset'); setError(''); setSuccess(''); }}
                                    className="text-xs font-bold text-forest/40 hover:text-forest transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                                <p className="text-xs text-forest/30">
                                    ¿No tienes cuenta?{' '}
                                    <button
                                        onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                                        className="font-black text-forest hover:text-forest/70 transition-colors"
                                    >
                                        Regístrate
                                    </button>
                                </p>
                            </>
                        )}
                        {mode === 'register' && (
                            <p className="text-xs text-forest/30">
                                ¿Ya tienes cuenta?{' '}
                                <button
                                    onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                    className="font-black text-forest hover:text-forest/70 transition-colors"
                                >
                                    Inicia sesión
                                </button>
                            </p>
                        )}
                        {mode === 'reset' && (
                            <button
                                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                                className="text-xs font-black text-forest hover:text-forest/70 transition-colors"
                            >
                                Volver a iniciar sesión
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

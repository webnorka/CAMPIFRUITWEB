import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { useConfig } from '../context/ConfigContext';

export default function AdminLogin() {
    const { config } = useConfig();
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/admin" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await login(email, password);

        if (success) {
            navigate('/admin', { replace: true });
        } else {
            setError('Credenciales incorrectas');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Panel Admin</h1>
                        <p className="text-gray-500 mt-1">{config.businessName}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@campifrut.com"
                                className="input-field"
                                autoFocus
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingresa la contraseña"
                                className="input-field"
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={loading || !password || !email}
                            className="w-full bg-forest text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                </div>

                {/* Back link */}
                <p className="text-center mt-6 text-gray-500 text-sm">
                    <a href="/" className="text-primary-600 hover:underline">
                        ← Volver al sitio
                    </a>
                </p>
            </div>
        </div>
    );
}

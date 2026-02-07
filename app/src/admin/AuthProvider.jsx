import { useState, createContext, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const checkAdminStatus = async (userId) => {
        if (!userId) {
            setIsAdmin(false);
            setRole(null);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('admin_users')
                .select('id, role')
                .eq('id', userId)
                .single();

            setIsAdmin(!error && !!data);
            setRole(!error && data ? data.role : null);
        } catch {
            setIsAdmin(false);
            setRole(null);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setIsAuthenticated(!!session);
            if (currentUser) {
                checkAdminStatus(currentUser.id).then(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            setIsAuthenticated(!!session);
            if (currentUser) {
                checkAdminStatus(currentUser.id).then(() => setLoading(false));
            } else {
                setIsAdmin(false);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return false;

        // Check admin status after login
        await checkAdminStatus(data.user?.id);
        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setIsAdmin(false);
        setRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAdmin, role, user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useIsEditor() {
    const { role } = useAuth();
    return role === 'admin';
}

export function ProtectedRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-lg max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔒</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso Restringido</h2>
                    <p className="text-gray-500 mb-6">No tienes permisos de administrador para acceder a este panel.</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-forest text-white rounded-2xl font-bold hover:opacity-90 transition-all"
                    >
                        Volver a la tienda
                    </button>
                </div>
            </div>
        );
    }

    return children;
}

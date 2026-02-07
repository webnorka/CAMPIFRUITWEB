import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { reportError } from '../hooks/useErrorReporter';

const CustomerAuthContext = createContext();

export function CustomerAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch or create customer record linked to auth user
    const fetchCustomer = useCallback(async (authUser) => {
        if (!authUser) {
            setCustomer(null);
            return;
        }
        try {
            // Check if customer record exists
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('auth_user_id', authUser.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setCustomer(data);
            } else {
                // Create customer record for new auth user
                const { data: newCustomer, error: insertError } = await supabase
                    .from('customers')
                    .insert([{
                        name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Cliente',
                        email: authUser.email,
                        phone: authUser.user_metadata?.phone || '',
                        auth_user_id: authUser.id
                    }])
                    .select()
                    .single();

                if (insertError) throw insertError;
                setCustomer(newCustomer);
            }
        } catch (err) {
            reportError(err, { component: 'CustomerAuthContext', action: 'fetchCustomer' });
        }
    }, []);

    // Listen for auth state changes
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const authUser = session?.user || null;
            setUser(authUser);

            if (authUser) {
                await fetchCustomer(authUser);
            } else {
                setCustomer(null);
            }
            setLoading(false);
        });

        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            const authUser = session?.user || null;
            setUser(authUser);
            if (authUser) {
                fetchCustomer(authUser);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [fetchCustomer]);

    const signUp = async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName }
            }
        });
        if (error) throw error;
        return data;
    };

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
        setCustomer(null);
    };

    const resetPassword = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
    };

    const updateProfile = async (updates) => {
        if (!customer) return;
        const { error } = await supabase
            .from('customers')
            .update(updates)
            .eq('id', customer.id);

        if (error) throw error;
        setCustomer(prev => ({ ...prev, ...updates }));
    };

    return (
        <CustomerAuthContext.Provider value={{
            user,
            customer,
            loading,
            isAuthenticated: !!user,
            signUp,
            signIn,
            signOut,
            resetPassword,
            updateProfile
        }}>
            {children}
        </CustomerAuthContext.Provider>
    );
}

export function useCustomerAuth() {
    const context = useContext(CustomerAuthContext);
    if (!context) {
        throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
    }
    return context;
}

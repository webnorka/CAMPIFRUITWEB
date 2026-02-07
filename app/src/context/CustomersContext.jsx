import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { reportError } from '../hooks/useErrorReporter';

const CustomersContext = createContext();

export function CustomersProvider({ children }) {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCustomers = async () => {
        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Normalize — DB has 'name' (single field), totalOrders, totalSpent
            const normalizedData = (data || []).map(customer => ({
                ...customer,
                totalOrders: customer.total_orders || 0,
                totalSpent: customer.total_spent || 0,
                createdAt: customer.created_at
            }));

            setCustomers(normalizedData);
        } catch (err) {
            reportError(err, { component: 'CustomersContext', action: 'fetchCustomers' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const addCustomer = async (customer) => {
        const customerToInsert = {
            id: crypto.randomUUID(),
            name: customer.name || '',
            email: customer.email || null,
            phone: customer.phone || null,
            notes: customer.notes || null,
            total_orders: 0,
            total_spent: 0
        };

        const { data, error } = await supabase
            .from('customers')
            .insert([customerToInsert])
            .select();

        if (error) {
            reportError(error, { component: 'CustomersContext', action: 'addCustomer' });
            throw error;
        }

        const normalized = {
            ...data[0],
            totalOrders: data[0].total_orders,
            totalSpent: data[0].total_spent,
            createdAt: data[0].created_at
        };

        setCustomers(prev => [normalized, ...prev]);
        return normalized;
    };

    const editCustomer = async (id, updatedCustomer) => {
        const customerToUpdate = { ...updatedCustomer };

        // Remove camelCase aliases before sending to DB
        delete customerToUpdate.totalOrders;
        delete customerToUpdate.totalSpent;
        delete customerToUpdate.createdAt;

        const { error } = await supabase
            .from('customers')
            .update(customerToUpdate)
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'CustomersContext', action: 'editCustomer', meta: { id } });
            throw error;
        }

        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updatedCustomer } : c));
    };

    const deleteCustomer = async (id) => {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'CustomersContext', action: 'deleteCustomer', meta: { id } });
            throw error;
        }

        setCustomers(prev => prev.filter(c => c.id !== id));
    };

    // Find or create customer by email
    const findOrCreateCustomer = async (customerData) => {
        try {
            // Check if customer exists by email
            const { data: existing, error: searchError } = await supabase
                .from('customers')
                .select('*')
                .eq('email', customerData.email)
                .single();

            if (searchError && searchError.code !== 'PGRST116') {
                throw searchError;
            }

            if (existing) {
                return {
                    ...existing,
                    totalOrders: existing.total_orders,
                    totalSpent: existing.total_spent,
                    createdAt: existing.created_at
                };
            }

            // Customer doesn't exist, create new
            return await addCustomer(customerData);
        } catch (error) {
            reportError(error, { component: 'CustomersContext', action: 'findOrCreateCustomer' });
            throw error;
        }
    };

    // Update customer stats after order
    const updateCustomerStats = async (customerId, orderTotal) => {
        try {
            const customer = customers.find(c => c.id === customerId);
            if (!customer) return;

            const updates = {
                total_orders: (customer.totalOrders || 0) + 1,
                total_spent: (customer.totalSpent || 0) + orderTotal
            };

            const { error } = await supabase
                .from('customers')
                .update(updates)
                .eq('id', customerId);

            if (error) throw error;

            setCustomers(prev => prev.map(c => c.id === customerId ? {
                ...c,
                totalOrders: updates.total_orders,
                totalSpent: updates.total_spent
            } : c));
        } catch (error) {
            reportError(error, { component: 'CustomersContext', action: 'updateCustomerStats', meta: { customerId } });
            throw error;
        }
    };

    return (
        <CustomersContext.Provider value={{
            customers,
            loading,
            addCustomer,
            editCustomer,
            deleteCustomer,
            findOrCreateCustomer,
            updateCustomerStats,
            refreshCustomers: fetchCustomers
        }}>
            {children}
        </CustomersContext.Provider>
    );
}

export function useCustomers() {
    const context = useContext(CustomersContext);
    if (!context) {
        throw new Error('useCustomers must be used within a CustomersProvider');
    }
    return context;
}

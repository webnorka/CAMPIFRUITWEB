import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * Hook for fetching customer orders.
 * Centralises the orders query so components don't import supabase directly.
 */
export function useCustomerOrders(customerId) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        if (!customerId) {
            setOrders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('orders')
                .select('*')
                .eq('customer_id', customerId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setOrders(data || []);
        } catch (err) {
            setError(err.message);
            console.error('useCustomerOrders error:', err);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return { orders, loading, error, refetch: fetchOrders };
}

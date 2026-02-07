import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useCustomerAuth } from './CustomerAuthContext';
import { reportError } from '../hooks/useErrorReporter';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const { customer, isAuthenticated } = useCustomerAuth();
    const [wishlistIds, setWishlistIds] = useState(new Set());
    const [loading, setLoading] = useState(false);

    // Fetch wishlist items for logged-in user (uses customer.id, not auth user.id)
    const fetchWishlist = useCallback(async () => {
        if (!customer?.id) {
            setWishlistIds(new Set());
            return;
        }
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('wishlist_items')
                .select('product_id')
                .eq('customer_id', customer.id);

            if (error) throw error;
            setWishlistIds(new Set((data || []).map(item => item.product_id)));
        } catch (err) {
            reportError(err, { component: 'WishlistContext', action: 'fetch' });
        } finally {
            setLoading(false);
        }
    }, [customer?.id]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const toggleWishlist = useCallback(async (productId) => {
        if (!isAuthenticated || !customer?.id) return false;

        const isWishlisted = wishlistIds.has(productId);

        try {
            if (isWishlisted) {
                const { error } = await supabase
                    .from('wishlist_items')
                    .delete()
                    .eq('customer_id', customer.id)
                    .eq('product_id', productId);
                if (error) throw error;

                setWishlistIds(prev => {
                    const next = new Set(prev);
                    next.delete(productId);
                    return next;
                });
            } else {
                const { error } = await supabase
                    .from('wishlist_items')
                    .insert([{ customer_id: customer.id, product_id: productId }]);
                if (error) throw error;

                setWishlistIds(prev => new Set([...prev, productId]));
            }
            return true;
        } catch (err) {
            reportError(err, { component: 'WishlistContext', action: 'toggle' });
            return false;
        }
    }, [isAuthenticated, customer?.id, wishlistIds]);

    const isInWishlist = useCallback((productId) => {
        return wishlistIds.has(productId);
    }, [wishlistIds]);

    return (
        <WishlistContext.Provider value={{
            wishlistIds,
            loading,
            toggleWishlist,
            isInWishlist,
            wishlistCount: wishlistIds.size
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}

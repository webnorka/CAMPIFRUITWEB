import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * Hook for fetching product variants.
 * Centralises the variant query so pages don't import supabase directly.
 * Normalises snake_case DB columns to camelCase JS properties.
 */
export function useProductVariants(productId, hasVariants) {
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!productId || !hasVariants) {
            setVariants([]);
            return;
        }

        setLoading(true);

        supabase
            .from('product_variants')
            .select('*')
            .eq('product_id', productId)
            .eq('active', true)
            .order('name')
            .then(({ data, error }) => {
                if (!error && data) {
                    // Normalise snake_case → camelCase
                    const normalised = data.map(v => ({
                        id: v.id,
                        productId: v.product_id,
                        name: v.name,
                        price: v.price,
                        offerPrice: v.offer_price ?? null,
                        onSale: v.on_sale ?? false,
                        stock: v.stock,
                        weight: v.weight,
                        active: v.active,
                    }));
                    setVariants(normalised);
                } else {
                    setVariants([]);
                }
                setLoading(false);
            });
    }, [productId, hasVariants]);
    /* eslint-enable react-hooks/set-state-in-effect */

    return { variants, loading };
}

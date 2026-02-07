import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { reportError } from '../hooks/useErrorReporter';

const PromotionsContext = createContext();

export function PromotionsProvider({ children }) {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPromotions = async () => {
        try {
            const { data, error } = await supabase
                .from('promotions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Normalize: DB has 'type'/'value', frontend uses 'discountType'/'discountValue'
            const normalizedData = (data || []).map(promo => ({
                ...promo,
                discountType: promo.type,
                discountValue: promo.value,
                minPurchase: promo.min_purchase,
                startDate: promo.start_date,
                endDate: promo.end_date,
                createdAt: promo.created_at
            }));

            setPromotions(normalizedData);
        } catch (err) {
            reportError(err, { component: 'PromotionsContext', action: 'fetchPromotions' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const addPromotion = async (promotion) => {
        const promoToInsert = {
            id: crypto.randomUUID(),
            name: promotion.name,
            type: promotion.discountType, // 'percentage' or 'fixed_amount'
            value: Number(promotion.discountValue),
            min_purchase: promotion.minPurchase ? Number(promotion.minPurchase) : null,
            start_date: promotion.startDate || null,
            end_date: promotion.endDate || null,
            active: promotion.active !== undefined ? promotion.active : true
        };

        const { data, error } = await supabase
            .from('promotions')
            .insert([promoToInsert])
            .select();

        if (error) {
            reportError(error, { component: 'PromotionsContext', action: 'addPromotion' });
            throw error;
        }

        const normalized = {
            ...data[0],
            discountType: data[0].type,
            discountValue: data[0].value,
            minPurchase: data[0].min_purchase,
            startDate: data[0].start_date,
            endDate: data[0].end_date,
            createdAt: data[0].created_at
        };

        setPromotions(prev => [normalized, ...prev]);
    };

    const editPromotion = async (id, updatedPromotion) => {
        const promoToUpdate = { ...updatedPromotion };

        // Convert camelCase to snake_case (DB columns)
        if ('discountType' in promoToUpdate) {
            promoToUpdate.type = promoToUpdate.discountType;
            delete promoToUpdate.discountType;
        }
        if ('discountValue' in promoToUpdate) {
            promoToUpdate.value = Number(promoToUpdate.discountValue);
            delete promoToUpdate.discountValue;
        }
        if ('minPurchase' in promoToUpdate) {
            promoToUpdate.min_purchase = promoToUpdate.minPurchase ? Number(promoToUpdate.minPurchase) : null;
            delete promoToUpdate.minPurchase;
        }
        if ('startDate' in promoToUpdate) {
            promoToUpdate.start_date = promoToUpdate.startDate;
            delete promoToUpdate.startDate;
        }
        if ('endDate' in promoToUpdate) {
            promoToUpdate.end_date = promoToUpdate.endDate;
            delete promoToUpdate.endDate;
        }
        // Remove camelCase aliases
        delete promoToUpdate.createdAt;

        const { error } = await supabase
            .from('promotions')
            .update(promoToUpdate)
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'PromotionsContext', action: 'editPromotion', meta: { id } });
            throw error;
        }

        setPromotions(prev => prev.map(p => p.id === id ? { ...p, ...updatedPromotion } : p));
    };

    const deletePromotion = async (id) => {
        const { error } = await supabase
            .from('promotions')
            .delete()
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'PromotionsContext', action: 'deletePromotion', meta: { id } });
            throw error;
        }

        setPromotions(prev => prev.filter(p => p.id !== id));
    };

    // Get active promotions (considering dates and active status)
    const getActivePromotions = () => {
        const now = new Date();
        return promotions.filter(promo => {
            if (!promo.active) return false;

            const startDate = promo.startDate ? new Date(promo.startDate) : null;
            const endDate = promo.endDate ? new Date(promo.endDate) : null;

            if (startDate && now < startDate) return false;
            if (endDate && now > endDate) return false;

            return true;
        });
    };

    // Calculate best promotion for a given cart total
    const getBestPromotion = (cartTotal) => {
        const activePromos = getActivePromotions();
        const applicablePromos = activePromos.filter(promo =>
            !promo.minPurchase || cartTotal >= promo.minPurchase
        );

        if (applicablePromos.length === 0) return null;

        // Calculate discount for each and return the best one
        return applicablePromos.reduce((best, current) => {
            const currentDiscount = current.discountType === 'percentage'
                ? (cartTotal * current.discountValue / 100)
                : current.discountValue;

            const bestDiscount = best ? (
                best.discountType === 'percentage'
                    ? (cartTotal * best.discountValue / 100)
                    : best.discountValue
            ) : 0;

            return currentDiscount > bestDiscount ? current : best;
        }, null);
    };

    // Calculate discount amount
    const calculateDiscount = (promotion, cartTotal) => {
        if (!promotion) return 0;
        if (promotion.minPurchase && cartTotal < promotion.minPurchase) return 0;

        if (promotion.discountType === 'percentage') {
            return Math.min(cartTotal * promotion.discountValue / 100, cartTotal);
        } else {
            return Math.min(promotion.discountValue, cartTotal);
        }
    };

    return (
        <PromotionsContext.Provider value={{
            promotions,
            loading,
            addPromotion,
            editPromotion,
            deletePromotion,
            getActivePromotions,
            getBestPromotion,
            calculateDiscount,
            refreshPromotions: fetchPromotions
        }}>
            {children}
        </PromotionsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePromotions() {
    const context = useContext(PromotionsContext);
    if (!context) {
        throw new Error('usePromotions must be used within a PromotionsProvider');
    }
    return context;
}

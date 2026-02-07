import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { reportError } from '../hooks/useErrorReporter';

const DiscountCodesContext = createContext();

export function DiscountCodesProvider({ children }) {
    const [discountCodes, setDiscountCodes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDiscountCodes = async () => {
        try {
            const { data, error } = await supabase
                .from('discount_codes')
                .select(`
                    *,
                    promotions (*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Normalize: DB has max_uses/current_uses, frontend uses usageLimit/usedCount
            const normalizedData = (data || []).map(code => ({
                ...code,
                promotionId: code.promotion_id,
                usageLimit: code.max_uses,
                usedCount: code.current_uses,
                createdAt: code.created_at,
                promotion: code.promotions ? {
                    ...code.promotions,
                    discountType: code.promotions.type,
                    discountValue: code.promotions.value,
                    minPurchase: code.promotions.min_purchase,
                    startDate: code.promotions.start_date,
                    endDate: code.promotions.end_date
                } : null
            }));

            setDiscountCodes(normalizedData);
        } catch (err) {
            reportError(err, { component: 'DiscountCodesContext', action: 'fetchDiscountCodes' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscountCodes();
    }, []);

    const addDiscountCode = async (discountCode) => {
        const codeToInsert = {
            id: crypto.randomUUID(),
            code: discountCode.code.toUpperCase().trim(),
            promotion_id: discountCode.promotionId,
            max_uses: discountCode.usageLimit ? Number(discountCode.usageLimit) : null,
            current_uses: 0,
            active: discountCode.active !== undefined ? discountCode.active : true
        };

        const { data, error } = await supabase
            .from('discount_codes')
            .insert([codeToInsert])
            .select(`
                *,
                promotions (*)
            `);

        if (error) {
            reportError(error, { component: 'DiscountCodesContext', action: 'addDiscountCode' });
            throw error;
        }

        const normalized = {
            ...data[0],
            promotionId: data[0].promotion_id,
            usageLimit: data[0].max_uses,
            usedCount: data[0].current_uses,
            createdAt: data[0].created_at,
            promotion: data[0].promotions ? {
                ...data[0].promotions,
                discountType: data[0].promotions.type,
                discountValue: data[0].promotions.value,
                minPurchase: data[0].promotions.min_purchase,
                startDate: data[0].promotions.start_date,
                endDate: data[0].promotions.end_date
            } : null
        };

        setDiscountCodes(prev => [normalized, ...prev]);
    };

    const editDiscountCode = async (id, updatedCode) => {
        const codeToUpdate = { ...updatedCode };

        // Convert camelCase to snake_case
        if ('promotionId' in codeToUpdate) {
            codeToUpdate.promotion_id = codeToUpdate.promotionId;
            delete codeToUpdate.promotionId;
        }
        if ('usageLimit' in codeToUpdate) {
            codeToUpdate.max_uses = codeToUpdate.usageLimit ? Number(codeToUpdate.usageLimit) : null;
            delete codeToUpdate.usageLimit;
        }
        if ('usedCount' in codeToUpdate) {
            codeToUpdate.current_uses = Number(codeToUpdate.usedCount);
            delete codeToUpdate.usedCount;
        }
        if ('code' in codeToUpdate) {
            codeToUpdate.code = codeToUpdate.code.toUpperCase().trim();
        }
        // Remove aliases
        delete codeToUpdate.createdAt;

        const { error } = await supabase
            .from('discount_codes')
            .update(codeToUpdate)
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'DiscountCodesContext', action: 'editDiscountCode', meta: { id } });
            throw error;
        }

        setDiscountCodes(prev => prev.map(c => c.id === id ? { ...c, ...updatedCode } : c));
    };

    const deleteDiscountCode = async (id) => {
        const { error } = await supabase
            .from('discount_codes')
            .delete()
            .eq('id', id);

        if (error) {
            reportError(error, { component: 'DiscountCodesContext', action: 'deleteDiscountCode', meta: { id } });
            throw error;
        }

        setDiscountCodes(prev => prev.filter(c => c.id !== id));
    };

    // Validate and retrieve discount code
    const validateDiscountCode = async (code, cartTotal) => {
        const upperCode = code.toUpperCase().trim();
        const discountCode = discountCodes.find(dc => dc.code === upperCode);

        if (!discountCode) {
            return { valid: false, message: 'Código no válido' };
        }

        if (!discountCode.active) {
            return { valid: false, message: 'Código inactivo' };
        }

        // Check usage limit
        if (discountCode.usageLimit && discountCode.usedCount >= discountCode.usageLimit) {
            return { valid: false, message: 'Código ya no disponible' };
        }

        // Check promotion active and dates
        const promotion = discountCode.promotion;
        if (!promotion || !promotion.active) {
            return { valid: false, message: 'Promoción no disponible' };
        }

        const now = new Date();
        if (promotion.startDate && now < new Date(promotion.startDate)) {
            return { valid: false, message: 'Promoción aún no comenzó' };
        }
        if (promotion.endDate && now > new Date(promotion.endDate)) {
            return { valid: false, message: 'Promoción expirada' };
        }

        // Check minimum purchase
        if (promotion.minPurchase && cartTotal < promotion.minPurchase) {
            return {
                valid: false,
                message: `Compra mínima: ${promotion.minPurchase}€`
            };
        }

        // Calculate discount
        const discountAmount = promotion.discountType === 'percentage'
            ? (cartTotal * promotion.discountValue / 100)
            : promotion.discountValue;

        return {
            valid: true,
            discountCode,
            promotion,
            discountAmount: Math.min(discountAmount, cartTotal)
        };
    };

    // Increment usage count after successful order
    const incrementUsage = async (codeId) => {
        try {
            const code = discountCodes.find(c => c.id === codeId);
            if (!code) return;

            const { error } = await supabase
                .from('discount_codes')
                .update({ current_uses: (code.usedCount || 0) + 1 })
                .eq('id', codeId);

            if (error) throw error;

            setDiscountCodes(prev => prev.map(c =>
                c.id === codeId ? { ...c, usedCount: (c.usedCount || 0) + 1 } : c
            ));
        } catch (error) {
            reportError(error, { component: 'DiscountCodesContext', action: 'incrementUsage', meta: { codeId } });
            throw error;
        }
    };

    // Generate random code
    const generateCode = (length = 8) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    return (
        <DiscountCodesContext.Provider value={{
            discountCodes,
            loading,
            addDiscountCode,
            editDiscountCode,
            deleteDiscountCode,
            validateDiscountCode,
            incrementUsage,
            generateCode,
            refreshDiscountCodes: fetchDiscountCodes
        }}>
            {children}
        </DiscountCodesContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDiscountCodes() {
    const context = useContext(DiscountCodesContext);
    if (!context) {
        throw new Error('useDiscountCodes must be used within a DiscountCodesProvider');
    }
    return context;
}

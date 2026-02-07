import { supabase } from '../utils/supabaseClient';

/**
 * Validates and atomically consumes a discount code on the server.
 * Server handles: active check, date window, min purchase, max uses, row locking.
 * 
 * @param {string} code - The discount code
 * @param {number} orderTotal - The current order total
 * @returns {Object} { success, discount_amount, promotion_name, ... } or { success: false, error }
 */
export async function validateAndConsumeDiscount(code, orderTotal) {
    const { data, error } = await supabase.rpc('validate_and_consume_discount', {
        p_code: code,
        p_order_total: orderTotal,
    });

    if (error) {
        throw new Error(error.message || 'Error al validar el código');
    }

    return data;
}

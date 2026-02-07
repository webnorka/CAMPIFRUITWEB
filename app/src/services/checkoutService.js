import { supabase } from '../utils/supabaseClient';

/**
 * Secure checkout service — calls server-side RPC for order creation.
 * The server computes totals from DB prices, preventing client manipulation.
 */
export async function createSecureOrder({ items, customerName, notes, discountCode, discountAmount, shippingAddress, customerId }) {
    const orderItems = items.map(item => ({
        id: item.id,
        quantity: item.quantity
    }));

    const { data, error } = await supabase.rpc('create_order', {
        p_items: orderItems,
        p_customer_name: customerName,
        p_notes: notes || null,
        p_customer_id: customerId || null,
        p_discount_code: discountCode || null,
        p_discount_amount: discountAmount || 0,
        p_idempotency_key: null,
        p_shipping_address: shippingAddress || null
    });

    if (error) {
        console.error('RPC create_order error:', error);
        throw new Error(error.message || 'Error al crear el pedido');
    }

    if (data && !data.success) {
        throw new Error(data.error || 'Error al crear el pedido');
    }

    return data;
}


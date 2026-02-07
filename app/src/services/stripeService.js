import { supabase } from '../utils/supabaseClient';

/**
 * Stripe checkout service — invokes the Supabase Edge Function
 * to create a Stripe checkout session.
 */
export async function createStripeCheckoutSession({
    items,
    customerName,
    customerEmail,
    customerId,
    notes,
    discountCode,
    discountAmount,
    shippingAddress,
    successUrl,
    cancelUrl
}) {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
            items: items.map(i => ({ id: i.id, quantity: i.quantity })),
            customerName,
            customerEmail,
            customerId,
            notes,
            discountCode,
            discountAmount,
            shippingAddress,
            successUrl,
            cancelUrl,
        }
    });

    if (error) throw error;

    if (!data?.sessionUrl) {
        throw new Error('No se recibió la URL de pago');
    }

    return data;
}


import { supabase } from '../utils/supabaseClient';

/**
 * Update sort order for a list of items using a batch RPC transaction.
 * Prevents N+1 network requests.
 * 
 * @param {string} table - 'families' or 'carousel_slides'
 * @param {Array<{id: string, sort_order: number}>} items 
 */
export async function batchReorder(table, items) {
    const { data, error } = await supabase.rpc('reorder_items', {
        p_table: table,
        p_items: items.map(i => ({ id: i.id, sort_order: i.sort_order }))
    });

    if (error) throw error;
    return data;
}

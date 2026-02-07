import { supabase } from '../utils/supabaseClient';

const DEFAULT_PAGE_SIZE = 25;

/**
 * Generic paginated query helper for Supabase tables.
 * 
 * @param {string} table - Table name
 * @param {Object} options
 * @param {string} options.select - Column selection (default: '*')
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} options.pageSize - Items per page
 * @param {string} options.orderBy - Column to order by
 * @param {boolean} options.ascending - Sort direction
 * @param {Object} options.filters - Key-value filters to apply
 * @returns {Promise<{data, count, page, pageSize, totalPages}>}
 */
export async function paginatedQuery(table, options = {}) {
    const {
        select = '*',
        page = 1,
        pageSize = DEFAULT_PAGE_SIZE,
        orderBy = 'created_at',
        ascending = false,
        filters = {},
    } = options;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .order(orderBy, { ascending })
        .range(from, to);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value);
        }
    });

    const { data, error, count } = await query;

    if (error) throw error;

    return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
    };
}

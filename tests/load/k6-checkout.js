import http from 'k6/http';
import { check, sleep } from 'k6';

// Checkout flow load test
// Run: k6 run tests/load/k6-checkout.js

const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://fopjqjoxwelmrrfowbmv.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || '';

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 20 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
};

export default function () {
    // 1. Browse products first
    const products = http.get(
        `${SUPABASE_URL}/rest/v1/products?select=id&limit=5`,
        { headers }
    );
    check(products, { 'products 200': (r) => r.status === 200 });

    const productList = JSON.parse(products.body || '[]');
    if (productList.length === 0) {
        sleep(2);
        return;
    }

    // 2. Create order via secure RPC
    const orderPayload = {
        p_items: productList.slice(0, 2).map(p => ({ id: p.id, quantity: 1 })),
        p_customer_name: `LoadTest User ${__VU}`,
        p_notes: 'k6 load test order',
    };

    const order = http.post(
        `${SUPABASE_URL}/rest/v1/rpc/create_order`,
        JSON.stringify(orderPayload),
        { headers }
    );

    check(order, {
        'order created': (r) => r.status === 200,
        'order success': (r) => {
            try { return JSON.parse(r.body).success === true; } catch { return false; }
        },
    });

    sleep(3);
}

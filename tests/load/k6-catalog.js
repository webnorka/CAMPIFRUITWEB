import http from 'k6/http';
import { check, sleep } from 'k6';

// Catalog browsing load test
// Run: k6 run tests/load/k6-catalog.js

const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://fopjqjoxwelmrrfowbmv.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || '';

export const options = {
    stages: [
        { duration: '30s', target: 10 },   // Ramp up
        { duration: '1m', target: 20 },    // Sustained load
        { duration: '30s', target: 50 },   // Peak
        { duration: '30s', target: 0 },    // Ramp down
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
    // Browse products
    const products = http.get(
        `${SUPABASE_URL}/rest/v1/products?select=id,name,price,offer_price,on_sale,category,image,weight&order=created_at.desc&limit=25`,
        { headers }
    );
    check(products, { 'products 200': (r) => r.status === 200 });

    sleep(1);

    // Browse families
    const families = http.get(
        `${SUPABASE_URL}/rest/v1/families?select=id,name,slug,image,sort_order&active=eq.true&order=sort_order`,
        { headers }
    );
    check(families, { 'families 200': (r) => r.status === 200 });

    sleep(1);

    // Load config
    const config = http.get(
        `${SUPABASE_URL}/rest/v1/config?select=*&limit=1`,
        { headers }
    );
    check(config, { 'config 200': (r) => r.status === 200 });

    sleep(2);
}

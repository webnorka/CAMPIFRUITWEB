# Checkout Flow Architecture

## Secure Order Creation

```
Client (CartModal)                     Server (Supabase RPC)
─────────────────                      ───────────────────
1. User clicks "Confirm"
2. Send: product IDs + quantities  ──▶ create_order(items, name, notes)
   (NO prices sent!)                   3. Look up REAL prices from products table
                                       4. Compute server-authoritative total
                                       5. INSERT into orders with real total
                                       6. Return { success, order_id, total }
7. Open WhatsApp URL             ◀──
8. Clear cart
```

## Key Security Properties
- Client NEVER sets `total_price` — server computes it
- Product prices are fetched from DB inside the RPC function
- RPC runs as `SECURITY DEFINER` (bypasses RLS for insert)
- Orders table INSERT for anon is still allowed (for the RPC path)
- Direct `.from('orders').insert()` still technically works but won't be used by the app

## Future: Tighten Further
When ready, remove the "Anon insert orders" RLS policy and make the RPC the ONLY insert path.

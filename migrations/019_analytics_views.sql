-- Daily revenue aggregation view
CREATE OR REPLACE VIEW daily_revenue AS
SELECT DATE(created_at) as date, COUNT(*) as order_count, COALESCE(SUM(total_price), 0) as revenue,
  COALESCE(AVG(total_price), 0) as avg_order_value, COALESCE(SUM(discount_amount), 0) as total_discounts
FROM orders WHERE status != 'cancelado' GROUP BY DATE(created_at) ORDER BY date DESC;

-- Top selling products view
CREATE OR REPLACE VIEW top_products AS
SELECT item->>'id' as product_id, item->>'name' as product_name,
  SUM((item->>'quantity')::int) as total_sold,
  SUM((item->>'quantity')::int * COALESCE((item->>'price')::numeric, 0)) as total_revenue
FROM orders, jsonb_array_elements(items) as item
WHERE status != 'cancelado' GROUP BY item->>'id', item->>'name' ORDER BY total_sold DESC;

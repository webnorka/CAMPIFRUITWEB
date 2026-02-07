-- Check if tables exist and are populated
SELECT 
    tablename,
    (SELECT COUNT(*) FROM families) as families_count,
    (SELECT COUNT(*) FROM carousel_slides) as carousel_count,
    (SELECT COUNT(*) FROM customers) as customers_count,
    (SELECT COUNT(*) FROM promotions) as promotions_count,
    (SELECT COUNT(*) FROM discount_codes) as discount_codes_count
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('families', 'carousel_slides', 'customers', 'promotions', 'discount_codes')
LIMIT 1;

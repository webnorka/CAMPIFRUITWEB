-- Migration 013: Order Enhancements
-- Adds customer_id, discount tracking to orders table
-- Updates create_order RPC to accept these new fields
-- ROLLBACK: ALTER TABLE orders DROP COLUMN IF EXISTS customer_id, DROP COLUMN IF EXISTS discount_code, DROP COLUMN IF EXISTS discount_amount;
--           DROP FUNCTION IF EXISTS public.create_order(JSONB, TEXT, TEXT, UUID, TEXT, NUMERIC);

-- 1) Add new columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discount_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 2) Replace create_order RPC with enhanced version
DROP FUNCTION IF EXISTS public.create_order(JSONB, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.create_order(
  p_items JSONB,
  p_customer_name TEXT,
  p_notes TEXT DEFAULT NULL,
  p_customer_id UUID DEFAULT NULL,
  p_discount_code TEXT DEFAULT NULL,
  p_discount_amount NUMERIC DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_total NUMERIC := 0;
  v_item JSONB;
  v_product RECORD;
  v_computed_items JSONB := '[]'::JSONB;
  v_item_price NUMERIC;
  v_final_total NUMERIC;
BEGIN
  -- Validate inputs
  IF p_customer_name IS NULL OR trim(p_customer_name) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'El nombre del cliente es obligatorio');
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'El carrito está vacío');
  END IF;

  -- Process each item — compute prices from DB (server truth)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id, name, price, offer_price, on_sale, image, weight
    INTO v_product
    FROM products
    WHERE id = v_item->>'id';

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'Producto no encontrado: ' || (v_item->>'id'));
    END IF;

    -- Use offer_price if on sale, otherwise regular price
    IF v_product.on_sale AND v_product.offer_price IS NOT NULL AND v_product.offer_price > 0 THEN
      v_item_price := v_product.offer_price;
    ELSE
      v_item_price := v_product.price;
    END IF;

    v_total := v_total + (v_item_price * COALESCE((v_item->>'quantity')::int, 1));

    -- Build computed item with server prices
    v_computed_items := v_computed_items || jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'offerPrice', v_product.offer_price,
      'onSale', v_product.on_sale,
      'image', v_product.image,
      'weight', v_product.weight,
      'quantity', COALESCE((v_item->>'quantity')::int, 1)
    );
  END LOOP;

  -- Apply discount (clamped to subtotal)
  v_final_total := GREATEST(v_total - COALESCE(p_discount_amount, 0), 0);

  -- Insert order with server-computed total
  INSERT INTO orders (customer_name, items, total_price, notes, status, customer_id, discount_code, discount_amount)
  VALUES (trim(p_customer_name), v_computed_items, v_final_total, p_notes, 'nuevo', p_customer_id, p_discount_code, COALESCE(p_discount_amount, 0))
  RETURNING id INTO v_order_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'total_price', v_final_total,
    'items_count', jsonb_array_length(v_computed_items),
    'discount_applied', COALESCE(p_discount_amount, 0)
  );
END;
$$;

-- Grant execute to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.create_order(JSONB, TEXT, TEXT, UUID, TEXT, NUMERIC) TO anon;
GRANT EXECUTE ON FUNCTION public.create_order(JSONB, TEXT, TEXT, UUID, TEXT, NUMERIC) TO authenticated;

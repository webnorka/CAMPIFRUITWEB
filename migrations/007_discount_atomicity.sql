-- Migration 007: Atomic Discount Code Consumption
-- Row-level locking prevents race conditions on concurrent coupon usage
-- ROLLBACK: DROP FUNCTION IF EXISTS public.validate_and_consume_discount(TEXT, NUMERIC);

CREATE OR REPLACE FUNCTION public.validate_and_consume_discount(
  p_code TEXT,
  p_order_total NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_discount RECORD;
  v_promotion RECORD;
  v_discount_amount NUMERIC := 0;
BEGIN
  -- Validate code exists and is active (with row lock to prevent race)
  SELECT dc.*, dc.id as dc_id
  INTO v_discount
  FROM discount_codes dc
  WHERE dc.code = upper(trim(p_code))
    AND dc.active = true
  FOR UPDATE;  -- Row-level lock

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Código de descuento no válido');
  END IF;

  -- Check max uses
  IF v_discount.max_uses IS NOT NULL AND v_discount.current_uses >= v_discount.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Este código ya ha alcanzado el máximo de usos');
  END IF;

  -- Get linked promotion
  SELECT * INTO v_promotion
  FROM promotions
  WHERE id = v_discount.promotion_id
    AND active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'La promoción asociada no está activa');
  END IF;

  -- Check date window
  IF v_promotion.start_date IS NOT NULL AND now() < v_promotion.start_date THEN
    RETURN jsonb_build_object('success', false, 'error', 'Esta promoción aún no ha comenzado');
  END IF;

  IF v_promotion.end_date IS NOT NULL AND now() > v_promotion.end_date THEN
    RETURN jsonb_build_object('success', false, 'error', 'Esta promoción ha expirado');
  END IF;

  -- Check minimum purchase
  IF v_promotion.min_purchase IS NOT NULL AND p_order_total < v_promotion.min_purchase THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'El pedido mínimo para este descuento es ' || v_promotion.min_purchase::text || '€'
    );
  END IF;

  -- Calculate discount amount
  CASE v_promotion.type
    WHEN 'percentage' THEN
      v_discount_amount := p_order_total * (v_promotion.value / 100);
    WHEN 'fixed_amount' THEN
      v_discount_amount := LEAST(v_promotion.value, p_order_total);
    ELSE
      v_discount_amount := 0;
  END CASE;

  -- Round to 2 decimal places
  v_discount_amount := round(v_discount_amount, 2);

  -- Atomic increment of current_uses
  UPDATE discount_codes
  SET current_uses = current_uses + 1
  WHERE id = v_discount.dc_id;

  RETURN jsonb_build_object(
    'success', true,
    'discount_amount', v_discount_amount,
    'promotion_name', v_promotion.name,
    'promotion_type', v_promotion.type,
    'promotion_value', v_promotion.value,
    'code', upper(trim(p_code))
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_and_consume_discount(TEXT, NUMERIC) TO anon;
GRANT EXECUTE ON FUNCTION public.validate_and_consume_discount(TEXT, NUMERIC) TO authenticated;

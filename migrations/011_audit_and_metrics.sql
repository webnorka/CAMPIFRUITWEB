-- Migration 011: Audit Trail and Metrics
-- Track sensitive mutations for accountability
-- ROLLBACK: DROP TABLE IF EXISTS audit_log; DROP FUNCTION IF EXISTS public.audit_trigger_fn();

-- ============================================
-- 1. Audit Log table
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS — only admins can read audit logs
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read audit log" ON audit_log
  FOR SELECT USING (public.is_admin());

-- No public writes — only triggers/functions insert
-- The trigger function uses SECURITY DEFINER to bypass RLS

-- ============================================
-- 2. Generic audit trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO audit_log (actor_id, actor_email, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::text
      ELSE NEW.id::text
    END,
    CASE
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
      ELSE to_jsonb(NEW)
    END
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. Attach audit triggers to sensitive tables
-- ============================================
DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders
  AFTER UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_discount_codes ON discount_codes;
CREATE TRIGGER audit_discount_codes
  AFTER INSERT OR UPDATE OR DELETE ON discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_promotions ON promotions;
CREATE TRIGGER audit_promotions
  AFTER INSERT OR UPDATE OR DELETE ON promotions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

DROP TRIGGER IF EXISTS audit_config ON config;
CREATE TRIGGER audit_config
  AFTER UPDATE ON config
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

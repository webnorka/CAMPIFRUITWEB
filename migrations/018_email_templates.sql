-- Email templates for transactional messages
CREATE TABLE IF NOT EXISTS email_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  type TEXT NOT NULL UNIQUE CHECK (type IN ('order_confirmation', 'status_update', 'welcome', 'delivery_notification')),
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "email_templates_admin_all" ON email_templates FOR ALL USING (public.is_admin());

INSERT INTO email_templates (type, subject, body_html) VALUES
  ('order_confirmation', 'Pedido confirmado #{{order_id}}', '<h1>¡Gracias por tu pedido, {{customer_name}}!</h1><p>Tu pedido <strong>#{{order_id}}</strong> ha sido recibido.</p>{{items_html}}<p><strong>Total: {{total}}</strong></p>'),
  ('status_update', 'Tu pedido #{{order_id}} - {{status}}', '<h1>Actualización de tu pedido</h1><p>Hola {{customer_name}}, tu pedido <strong>#{{order_id}}</strong> ha cambiado a estado: <strong>{{status}}</strong>.</p>'),
  ('welcome', '¡Bienvenido/a a {{business_name}}!', '<h1>¡Bienvenido/a, {{customer_name}}!</h1><p>Gracias por crear tu cuenta en {{business_name}}.</p>'),
  ('delivery_notification', 'Tu pedido #{{order_id}} ha sido entregado', '<h1>¡Pedido entregado!</h1><p>Tu pedido <strong>#{{order_id}}</strong> ha sido marcado como entregado.</p>')
ON CONFLICT (type) DO NOTHING;

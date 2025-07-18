-- Email logs schema för att spåra email-statistik
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'sent', 'failed', 'pending'
  service VARCHAR(20) NOT NULL DEFAULT 'sendgrid', -- 'sendgrid', 'resend', 'nodemailer'
  message_id VARCHAR(255),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_type ON email_logs(template_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_service ON email_logs(service);

-- RLS policies
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admins kan se alla email-loggar
CREATE POLICY "admin_read_all_email_logs" ON email_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins kan skapa email-loggar
CREATE POLICY "admin_create_email_logs" ON email_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- System kan skapa email-loggar (för automatiska processer)
CREATE POLICY "system_create_email_logs" ON email_logs
  FOR INSERT
  WITH CHECK (true);

-- Lägg till några test-loggar för att visa statistik
INSERT INTO email_logs (template_type, recipient_email, subject, status, service, message_id) VALUES
('order_confirmation', 'test@example.com', 'Orderbekräftelse #TEST-001', 'sent', 'resend', 'resend-msg-001'),
('order_confirmation', 'test2@example.com', 'Orderbekräftelse #TEST-002', 'sent', 'sendgrid', 'sendgrid-msg-001'),
('booking_confirmation', 'test3@example.com', 'Bokningsbekräftelse', 'failed', 'resend', NULL),
('order_confirmation', 'test4@example.com', 'Orderbekräftelse #TEST-003', 'sent', 'resend', 'resend-msg-002'),
('contact_notification', 'admin@example.com', 'Nytt kontaktmeddelande', 'sent', 'sendgrid', 'sendgrid-msg-002')
ON CONFLICT (id) DO NOTHING; 
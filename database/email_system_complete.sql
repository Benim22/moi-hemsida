-- Email Templates Schema
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'booking_confirmation', 'welcome', 'test_email', etc.
  name VARCHAR(100) NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  location VARCHAR(50), -- NULL för global templates
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  UNIQUE(type, location)
);

-- Email Logs Schema
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_type VARCHAR(50),
  recipient VARCHAR(255) NOT NULL,
  subject TEXT,
  status VARCHAR(20) NOT NULL, -- 'sent', 'failed', 'pending'
  message_id VARCHAR(255),
  error_message TEXT,
  location VARCHAR(50),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Settings Schema (för dynamiska SMTP-inställningar om behövs)
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(50) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- RLS Policies för Email Templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Alla kan läsa aktiva templates
CREATE POLICY "Everyone can read active email templates" ON email_templates
FOR SELECT USING (is_active = true);

-- Endast admins kan hantera templates
CREATE POLICY "Only admins can manage email templates" ON email_templates
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- RLS Policies för Email Logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Endast admins kan läsa email logs
CREATE POLICY "Only admins can read email logs" ON email_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Service role kan alltid skriva till logs
CREATE POLICY "Service role can insert email logs" ON email_logs
FOR INSERT WITH CHECK (true);

-- RLS Policies för Email Settings
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Endast admins kan hantera email settings
CREATE POLICY "Only admins can manage email settings" ON email_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Standard Email Templates
INSERT INTO email_templates (type, name, subject, html_content, text_content) VALUES
('order_confirmation', 'Orderbekräftelse', 'Orderbekräftelse #{{order_number}} - {{restaurant_name}}', 
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Orderbekräftelse</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .order-items { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .total { font-size: 18px; font-weight: bold; color: #d32f2f; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{restaurant_name}}</h1>
            <p>Tack för din beställning!</p>
        </div>
        <div class="content">
            <h2>Hej {{customer_name}}!</h2>
            <p>Vi har mottagit din beställning och den är nu bekräftad.</p>
            
            <h3>Orderdetaljer:</h3>
            <p><strong>Ordernummer:</strong> {{order_number}}</p>
            <p><strong>Datum:</strong> {{order_date}}</p>
            <p><strong>Leveransmetod:</strong> {{delivery_method}}</p>
            <p><strong>Beräknad tid:</strong> {{estimated_time}}</p>
            
            <div class="order-items">
                <h3>Dina varor:</h3>
                <pre>{{order_items}}</pre>
                <div class="total">Total: {{total_amount}} kr</div>
            </div>
            
            <p><strong>Restauranginfo:</strong><br>
            {{restaurant_name}}<br>
            {{restaurant_address}}<br>
            Telefon: {{restaurant_phone}}</p>
            
            <p>Vi ser fram emot att servera dig!</p>
        </div>
        <div class="footer">
            <p>Detta är ett automatiskt meddelande från {{restaurant_name}}</p>
        </div>
    </div>
</body>
</html>',
'Orderbekräftelse #{{order_number}} - {{restaurant_name}}

Hej {{customer_name}}!

Vi har mottagit din beställning och den är nu bekräftad.

Orderdetaljer:
- Ordernummer: {{order_number}}
- Datum: {{order_date}}
- Leveransmetod: {{delivery_method}}
- Beräknad tid: {{estimated_time}}

Dina varor:
{{order_items}}

Total: {{total_amount}} kr

Restauranginfo:
{{restaurant_name}}
{{restaurant_address}}
Telefon: {{restaurant_phone}}

Vi ser fram emot att servera dig!

---
Detta är ett automatiskt meddelande från {{restaurant_name}}'),

('booking_confirmation', 'Bokningsbekräftelse', 'Bokningsbekräftelse - {{restaurant_name}}',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Bokningsbekräftelse</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .booking-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{restaurant_name}}</h1>
            <p>Din bokning är bekräftad!</p>
        </div>
        <div class="content">
            <h2>Hej {{customer_name}}!</h2>
            <p>Vi ser fram emot ditt besök!</p>
            
            <div class="booking-details">
                <h3>Bokningsdetaljer:</h3>
                <p><strong>Datum:</strong> {{booking_date}}</p>
                <p><strong>Tid:</strong> {{booking_time}}</p>
                <p><strong>Antal personer:</strong> {{party_size}}</p>
            </div>
            
            <p><strong>Restauranginfo:</strong><br>
            {{restaurant_name}}<br>
            {{restaurant_address}}<br>
            Telefon: {{restaurant_phone}}</p>
            
            <p>Vi ser fram emot ditt besök!</p>
        </div>
        <div class="footer">
            <p>Detta är ett automatiskt meddelande från {{restaurant_name}}</p>
        </div>
    </div>
</body>
</html>',
'Bokningsbekräftelse - {{restaurant_name}}

Hej {{customer_name}}!

Din bokning är bekräftad!

Bokningsdetaljer:
- Datum: {{booking_date}}
- Tid: {{booking_time}}
- Antal personer: {{party_size}}

Restauranginfo:
{{restaurant_name}}
{{restaurant_address}}
Telefon: {{restaurant_phone}}

Vi ser fram emot ditt besök!

---
Detta är ett automatiskt meddelande från {{restaurant_name}}'),

('test_email', 'Test Email', 'Test Email - {{restaurant_name}}',
'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Test Email</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{restaurant_name}}</h1>
            <p>Test Email</p>
        </div>
        <div class="content">
            <h2>Hej {{customer_name}}!</h2>
            <p>{{test_message}}</p>
            <p>Om du ser detta meddelande fungerar email-systemet korrekt!</p>
        </div>
        <div class="footer">
            <p>Detta är ett test-meddelande från {{restaurant_name}}</p>
        </div>
    </div>
</body>
</html>',
'Test Email - {{restaurant_name}}

Hej {{customer_name}}!

{{test_message}}

Om du ser detta meddelande fungerar email-systemet korrekt!

---
Detta är ett test-meddelande från {{restaurant_name}}');

-- Standard Email Settings (om man vill använda databasbaserade inställningar)
INSERT INTO email_settings (setting_key, setting_value, description) VALUES
('smtp_host', 'mailout.one.com', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_secure', 'false', 'Use SSL/TLS (true for port 465, false for 587)'),
('from_name', 'Moi Sushi & Poké Bowl', 'Sender name'),
('from_email', 'info@moisushi.se', 'Sender email address')
ON CONFLICT (setting_key) DO NOTHING;

-- Indexes för prestanda
CREATE INDEX idx_email_templates_type ON email_templates(type);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX idx_email_settings_key ON email_settings(setting_key); 
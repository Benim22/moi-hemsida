-- Email Templates System
-- Skapad för Moi Sushi e-posthantering

-- Tabell för e-postmallar
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  template_key VARCHAR(100) UNIQUE NOT NULL, -- t.ex. 'order_confirmation', 'welcome_email'
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb, -- Lista över tillgängliga variabler
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id)
);

-- Tabell för e-postloggar
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed, bounced
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Extra data som order_id, user_id etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabell för e-postinställningar
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Index för prestanda
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_email_settings_key ON email_settings(setting_key);

-- Trigger för updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_settings_updated_at 
    BEFORE UPDATE ON email_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sätt in grundläggande e-postmallar
INSERT INTO email_templates (name, subject, template_key, html_content, text_content, variables) VALUES
(
  'Orderbekräftelse',
  'Tack för din beställning #{order_number}!',
  'order_confirmation',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #000; color: #e4d699; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Moi Sushi</h1>
        <p>Tack för din beställning!</p>
    </div>
    <div class="content">
        <h2>Hej #{customer_name}!</h2>
        <p>Vi har mottagit din beställning och förbereder den nu. Här är detaljerna:</p>
        
        <div class="order-details">
            <h3>Beställning #{order_number}</h3>
            <p><strong>Datum:</strong> #{order_date}</p>
            <p><strong>Totalt:</strong> #{total_amount} kr</p>
            <p><strong>Leveransadress:</strong> #{delivery_address}</p>
            <p><strong>Beräknad leveranstid:</strong> #{estimated_delivery}</p>
        </div>
        
        <h3>Dina varor:</h3>
        #{order_items}
        
        <p>Vi skickar ett nytt meddelande när din beställning är på väg!</p>
        
        <p>Tack för att du valde Moi Sushi!</p>
    </div>
    <div class="footer">
        <p>Moi Sushi | info@moisushi.se | 040-123 45 67</p>
        <p>Utvecklad av <a href="https://skaply.se">Skaply</a></p>
    </div>
</body>
</html>',
  'Hej #{customer_name}!

Tack för din beställning hos Moi Sushi!

Beställning: #{order_number}
Datum: #{order_date}
Totalt: #{total_amount} kr
Leveransadress: #{delivery_address}
Beräknad leveranstid: #{estimated_delivery}

Dina varor:
#{order_items}

Vi skickar ett nytt meddelande när din beställning är på väg!

Tack för att du valde Moi Sushi!

---
Moi Sushi
info@moisushi.se
040-123 45 67',
  '["customer_name", "order_number", "order_date", "total_amount", "delivery_address", "estimated_delivery", "order_items"]'::jsonb
),
(
  'Välkomstmail',
  'Välkommen till Moi Sushi, #{customer_name}!',
  'welcome_email',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #000; color: #e4d699; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .welcome-bonus { background: #e4d699; color: #000; padding: 15px; margin: 20px 0; border-radius: 5px; text-align: center; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Välkommen till Moi Sushi!</h1>
    </div>
    <div class="content">
        <h2>Hej #{customer_name}!</h2>
        <p>Välkommen till Moi Sushi-familjen! Vi är glada att ha dig som kund.</p>
        
        <div class="welcome-bonus">
            <h3>🎉 Välkomstbonus!</h3>
            <p>Som ny kund får du <strong>10% rabatt</strong> på din första beställning!</p>
            <p>Använd koden: <strong>VÄLKOMMEN10</strong></p>
        </div>
        
        <p>Hos oss hittar du:</p>
        <ul>
            <li>Färsk sushi gjord dagligen</li>
            <li>Hälsosamma poké bowls</li>
            <li>Snabb leverans</li>
            <li>Autentiska japanska smaker</li>
        </ul>
        
        <p>Besök vår webbplats för att se hela menyn och beställa!</p>
        
        <p>Arigatou gozaimasu! 🍣</p>
    </div>
    <div class="footer">
        <p>Moi Sushi | info@moisushi.se | 040-123 45 67</p>
        <p>Utvecklad av <a href="https://skaply.se">Skaply</a></p>
    </div>
</body>
</html>',
  'Hej #{customer_name}!

Välkommen till Moi Sushi-familjen! Vi är glada att ha dig som kund.

🎉 VÄLKOMSTBONUS! 🎉
Som ny kund får du 10% rabatt på din första beställning!
Använd koden: VÄLKOMMEN10

Hos oss hittar du:
- Färsk sushi gjord dagligen
- Hälsosamma poké bowls  
- Snabb leverans
- Autentiska japanska smaker

Besök vår webbplats för att se hela menyn och beställa!

Arigatou gozaimasu! 🍣

---
Moi Sushi
info@moisushi.se
040-123 45 67',
  '["customer_name"]'::jsonb
);

-- Sätt in grundläggande e-postinställningar
INSERT INTO email_settings (setting_key, setting_value, description) VALUES
('smtp_host', 'smtp.gmail.com', 'SMTP server host'),
('smtp_port', '587', 'SMTP server port'),
('smtp_username', 'info@moisushi.se', 'SMTP username'),
('smtp_password', '', 'SMTP password (krypterat)'),
('from_email', 'info@moisushi.se', 'Standard avsändaradress'),
('from_name', 'Moi Sushi', 'Standard avsändarnamn'),
('reply_to', 'info@moisushi.se', 'Reply-to adress'),
('enable_emails', 'true', 'Aktivera/inaktivera e-postsändning'),
('test_mode', 'false', 'Testläge - skicka bara till testadresser');

-- Kommentar
COMMENT ON TABLE email_templates IS 'Mallar för e-postmeddelanden som skickas till kunder';
COMMENT ON TABLE email_logs IS 'Logg över skickade e-postmeddelanden';
COMMENT ON TABLE email_settings IS 'Inställningar för e-postsystemet'; 
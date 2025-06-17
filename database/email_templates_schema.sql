-- Email Templates Schema
-- Hanterar email-mallar för beställningar, bordsbokningar och andra meddelanden

-- Skapa enum för email-typer
CREATE TYPE email_template_type AS ENUM (
  'order_confirmation',
  'booking_confirmation', 
  'order_status_update',
  'booking_reminder',
  'promotional',
  'welcome',
  'password_reset'
);

-- Skapa email_templates tabell
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type email_template_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]'::jsonb, -- Lista över tillgängliga variabler
  is_active BOOLEAN DEFAULT true,
  location VARCHAR(50), -- NULL för globala templates, specifik location för lokala
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  UNIQUE(type, location) -- En aktiv template per typ och location
);

-- Skapa index
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_location ON email_templates(location);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

-- Aktivera RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can manage email templates" ON email_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Skapa trigger för updated_at
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_email_templates_updated_at();

-- Sätt created_by automatiskt
CREATE OR REPLACE FUNCTION set_email_template_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_email_template_created_by
  BEFORE INSERT ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION set_email_template_created_by();

-- Lägg till standard email-templates
INSERT INTO email_templates (type, name, subject, html_content, text_content, variables) VALUES 
(
  'order_confirmation',
  'Beställningsbekräftelse',
  'Tack för din beställning #{orderNumber}!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #e4d699, #d4c589); padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .order-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .item { border-bottom: 1px solid #eee; padding: 10px 0; }
    .total { font-weight: bold; font-size: 18px; color: #e4d699; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍱 Moi Sushi</h1>
    <h2>Tack för din beställning!</h2>
  </div>
  
  <div class="content">
    <p>Hej <strong>{{customerName}}</strong>!</p>
    
    <p>Vi har mottagit din beställning och den förbereds nu. Här är detaljerna:</p>
    
    <div class="order-details">
      <h3>📋 Beställningsdetaljer</h3>
      <p><strong>Ordernummer:</strong> #{{orderNumber}}</p>
      <p><strong>Datum:</strong> {{orderDate}}</p>
      <p><strong>Typ:</strong> {{orderType}}</p>
      <p><strong>Restaurang:</strong> {{location}}</p>
      {{#if deliveryAddress}}
      <p><strong>Leveransadress:</strong> {{deliveryAddress}}</p>
      {{/if}}
      <p><strong>Hämtningstid:</strong> {{pickupTime}}</p>
    </div>
    
    <div class="order-details">
      <h3>🍱 Dina varor</h3>
      {{#each items}}
      <div class="item">
        <strong>{{quantity}}x {{name}}</strong> - {{price}} kr
        {{#if extras}}
        <br><small>Tillval: {{extras}}</small>
        {{/if}}
      </div>
      {{/each}}
      
      <div class="total">
        <p>Totalt: {{totalPrice}} kr</p>
      </div>
    </div>
    
    {{#if specialInstructions}}
    <div class="order-details">
      <h3>📝 Specialinstruktioner</h3>
      <p>{{specialInstructions}}</p>
    </div>
    {{/if}}
    
    <p>Vi skickar ett meddelande när din beställning är klar för avhämtning/leverans.</p>
    
    <p>Har du frågor? Kontakta oss på <strong>{{restaurantPhone}}</strong></p>
  </div>
  
  <div class="footer">
    <p>🍱 Moi Sushi - Japansk mat med kärlek</p>
    <p>{{restaurantAddress}}</p>
  </div>
</body>
</html>',
  'Hej {{customerName}}!

Vi har mottagit din beställning och den förbereds nu.

Beställningsdetaljer:
- Ordernummer: #{{orderNumber}}
- Datum: {{orderDate}}
- Typ: {{orderType}}
- Restaurang: {{location}}
- Hämtningstid: {{pickupTime}}

Dina varor:
{{#each items}}
- {{quantity}}x {{name}} - {{price}} kr
{{/each}}

Totalt: {{totalPrice}} kr

{{#if specialInstructions}}
Specialinstruktioner: {{specialInstructions}}
{{/if}}

Vi skickar ett meddelande när din beställning är klar.

Moi Sushi
{{restaurantAddress}}
{{restaurantPhone}}',
  '[
    {"name": "customerName", "description": "Kundens namn", "required": true},
    {"name": "orderNumber", "description": "Ordernummer", "required": true},
    {"name": "orderDate", "description": "Beställningsdatum", "required": true},
    {"name": "orderType", "description": "Avhämtning eller leverans", "required": true},
    {"name": "location", "description": "Restaurangnamn", "required": true},
    {"name": "deliveryAddress", "description": "Leveransadress (om leverans)", "required": false},
    {"name": "pickupTime", "description": "Hämtningstid", "required": true},
    {"name": "items", "description": "Lista över beställda varor", "required": true},
    {"name": "totalPrice", "description": "Totalpris", "required": true},
    {"name": "specialInstructions", "description": "Specialinstruktioner", "required": false},
    {"name": "restaurantPhone", "description": "Restaurangens telefonnummer", "required": true},
    {"name": "restaurantAddress", "description": "Restaurangens adress", "required": true}
  ]'
),
(
  'booking_confirmation',
  'Bordsbokningsbekräftelse',
  'Din bordsbokning hos Moi Sushi är bekräftad!',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #e4d699, #d4c589); padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .booking-details { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0; }
    .highlight { color: #e4d699; font-weight: bold; font-size: 18px; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🍱 Moi Sushi</h1>
    <h2>Din bordsbokning är bekräftad!</h2>
  </div>
  
  <div class="content">
    <p>Hej <strong>{{customerName}}</strong>!</p>
    
    <p>Vi ser fram emot att välkomna dig till Moi Sushi. Här är detaljerna för din bokning:</p>
    
    <div class="booking-details">
      <h3>📅 Bokningsdetaljer</h3>
      <p><strong>Bokningsnummer:</strong> #{{bookingNumber}}</p>
      <p><strong>Datum:</strong> {{bookingDate}}</p>
      <p><strong>Tid:</strong> {{bookingTime}}</p>
      <p><strong>Antal personer:</strong> {{partySize}}</p>
      <p><strong>Restaurang:</strong> {{location}}</p>
      <p><strong>Adress:</strong> {{restaurantAddress}}</p>
    </div>
    
    {{#if specialRequests}}
    <div class="booking-details">
      <h3>📝 Specialönskemål</h3>
      <p>{{specialRequests}}</p>
    </div>
    {{/if}}
    
    <div class="highlight">
      <p>⏰ Kom gärna 5-10 minuter före bokad tid</p>
    </div>
    
    <p>Behöver du ändra eller avboka? Kontakta oss på <strong>{{restaurantPhone}}</strong> minst 2 timmar i förväg.</p>
    
    <p>Vi ser fram emot att servera dig vår fantastiska japanska mat!</p>
  </div>
  
  <div class="footer">
    <p>🍱 Moi Sushi - Japansk mat med kärlek</p>
    <p>{{restaurantAddress}} | {{restaurantPhone}}</p>
  </div>
</body>
</html>',
  'Hej {{customerName}}!

Din bordsbokning hos Moi Sushi är bekräftad!

Bokningsdetaljer:
- Bokningsnummer: #{{bookingNumber}}
- Datum: {{bookingDate}}
- Tid: {{bookingTime}}
- Antal personer: {{partySize}}
- Restaurang: {{location}}
- Adress: {{restaurantAddress}}

{{#if specialRequests}}
Specialönskemål: {{specialRequests}}
{{/if}}

Kom gärna 5-10 minuter före bokad tid.

Behöver du ändra eller avboka? Kontakta oss på {{restaurantPhone}} minst 2 timmar i förväg.

Vi ser fram emot att servera dig!

Moi Sushi
{{restaurantAddress}}
{{restaurantPhone}}',
  '[
    {"name": "customerName", "description": "Kundens namn", "required": true},
    {"name": "bookingNumber", "description": "Bokningsnummer", "required": true},
    {"name": "bookingDate", "description": "Bokningsdatum", "required": true},
    {"name": "bookingTime", "description": "Bokningstid", "required": true},
    {"name": "partySize", "description": "Antal personer", "required": true},
    {"name": "location", "description": "Restaurangnamn", "required": true},
    {"name": "restaurantAddress", "description": "Restaurangens adress", "required": true},
    {"name": "restaurantPhone", "description": "Restaurangens telefonnummer", "required": true},
    {"name": "specialRequests", "description": "Specialönskemål", "required": false}
  ]'
);

-- Aktivera real-time för email_templates
ALTER PUBLICATION supabase_realtime ADD TABLE email_templates;

-- Grant permissions
GRANT ALL ON email_templates TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated; 
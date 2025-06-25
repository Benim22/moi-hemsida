-- Lägg till test_email mall i email_templates tabellen
INSERT INTO email_templates (
  name, 
  subject, 
  template_key, 
  type,
  html_content, 
  text_content, 
  variables, 
  is_active
) VALUES (
  'Test Email',
  'Test från {{restaurant_name}} - One.com SMTP',
  'test_email',
  'test_email',
  '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #000; color: #e4d699; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .test-box { background: #f0f8ff; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #0066cc; }
        .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{restaurant_name}}</h1>
        <p>🧪 Test Email System</p>
    </div>
    <div class="content">
        <h2>Hej {{customer_name}}!</h2>
        <p>{{test_message}}</p>
        
        <div class="test-box">
            <h3>📧 Email System Test</h3>
            <p>Om du ser detta meddelande betyder det att vårt One.com SMTP email-system fungerar korrekt!</p>
            <p><strong>Status:</strong> ✅ Fungerande</p>
            <p><strong>SMTP Server:</strong> One.com</p>
            <p><strong>Tid:</strong> Nu</p>
        </div>
        
        <p>Detta är ett automatiskt test-email från vårt system.</p>
        
        <p>Med vänliga hälsningar,<br>{{restaurant_name}} Team</p>
    </div>
    <div class="footer">
        <p>{{restaurant_name}} | info@moisushi.se</p>
        <p>Utvecklad av <a href="https://skaply.se">Skaply</a></p>
    </div>
</body>
</html>',
  'Hej {{customer_name}}!

{{test_message}}

📧 EMAIL SYSTEM TEST 📧

Om du ser detta meddelande betyder det att vårt One.com SMTP email-system fungerar korrekt!

Status: ✅ Fungerande
SMTP Server: One.com
Tid: Nu

Detta är ett automatiskt test-email från vårt system.

Med vänliga hälsningar,
{{restaurant_name}} Team

---
{{restaurant_name}}
info@moisushi.se',
  '["customer_name", "restaurant_name", "test_message"]'::jsonb,
  true
);

-- Kontrollera att mallen lades till
SELECT * FROM email_templates WHERE template_key = 'test_email'; 
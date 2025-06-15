# Email Setup för Moi Sushi

## Miljövariabler som behövs

Lägg till följande variabler i din `.env.local` fil:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# Restaurant Email (där notifikationer skickas)
RESTAURANT_EMAIL=info@moisushi.se
```

## Gmail Setup

För att använda Gmail som SMTP-server:

1. Aktivera 2-faktor-autentisering på ditt Gmail-konto
2. Gå till Google Account Settings > Security > App passwords
3. Skapa ett nytt app-lösenord för "Mail"
4. Använd detta app-lösenord som `SMTP_PASS`

## Email-funktioner

### 1. Orderbekräftelser
- Skickas automatiskt till kunder när de lägger en beställning
- Innehåller orderdetaljer, totalpris, leverans/avhämtningsinformation
- Restaurangen får också en notifikation om nya beställningar

### 2. Bokningsbekräftelser
- Skickas till kunder när de bokar bord
- Innehåller bokningsdetaljer och restauranginformation
- Restaurangen får också en notifikation om nya bokningar

### 3. Kontaktformulär
- När kunder skickar meddelanden via kontaktformuläret
- Restaurangen får en notifikation med kundens meddelande
- Möjlighet att svara direkt på kundens email

## API Endpoints

- `POST /api/send-order-confirmation` - Skicka orderbekräftelse
- `POST /api/send-booking-confirmation` - Skicka bokningsbekräftelse  
- `POST /api/send-contact-notification` - Skicka kontaktnotifikation

## Användning i kod

```typescript
// Orderbekräftelse
const orderData = {
  customerName: "John Doe",
  customerEmail: "john@example.com",
  orderNumber: "12345",
  items: [{ name: "California Roll", quantity: 2, price: 89 }],
  totalPrice: 178,
  location: "Trelleborg",
  orderType: "delivery",
  phone: "0701234567"
}

const response = await fetch('/api/send-order-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
})

// Bokningsbekräftelse
const bookingData = {
  customerName: "Jane Doe",
  customerEmail: "jane@example.com",
  customerPhone: "0701234567",
  date: "2024-01-15",
  time: "19:00",
  guests: "4",
  location: "Malmö"
}

const response = await fetch('/api/send-booking-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(bookingData)
})
```

## Email Templates

Alla emails använder Moi Sushis branding med:
- Svart bakgrund med guld accenter (#e4d699)
- Responsiv design som fungerar på alla enheter
- Både HTML och text-versioner
- Svensk text och formatering

## Testning

För att testa email-funktionaliteten finns en test-endpoint:

```bash
# Testa email-anslutning
GET /api/test-email

# Testa orderbekräftelse
POST /api/test-email
{
  "type": "order"
}

# Testa bokningsbekräftelse
POST /api/test-email
{
  "type": "booking"
}

# Testa kontaktnotifikation
POST /api/test-email
{
  "type": "contact"
}
```

## Felsökning

Om emails inte skickas, kontrollera:
1. Att alla miljövariabler är korrekt inställda
2. Att Gmail app-lösenordet är korrekt
3. Att SMTP-inställningarna stämmer
4. Kontrollera server-logs för felmeddelanden
5. Använd test-endpointen för att verifiera anslutningen 
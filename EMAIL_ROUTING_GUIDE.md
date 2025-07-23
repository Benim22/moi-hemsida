# Smart Email Routing System

Detta dokument beskriver det nya smarta email-routing systemet som automatiskt väljer den bästa email-leverantören baserat på mottagarens domän.

## Översikt

Det smarta email-routing systemet använder domän-baserad logik för att automatiskt välja mellan Resend och SendGrid som email-leverantör. Detta optimerar leveransraten och säkerställer att emails når fram till mottagarna.

## Routing Logik

### Resend (Prioriterad för)
- **Outlook domäner**: `outlook.com`, `outlook.se`, `hotmail.com`, `hotmail.se`, `live.com`, `live.se`, `msn.com`
- **Svenska domäner**: `gmail.se`, `telia.com`, `bredband2.com`, `comhem.se`, `bahnhof.se`, `spray.se`, `passagen.se`, `swipnet.se`, `tele2.se`, `telenor.se`, `tre.se`, `halebop.se`
- **Engelska domäner**: `gmail.com`, `yahoo.com`, `yahoo.co.uk`, `btinternet.com`, `virginmedia.com`, `sky.com`, `talktalk.net`, `aol.com`, `icloud.com`, `me.com`, `mac.com`

### SendGrid (Prioriterad för)
- Alla andra domäner som inte matchar Resend-listan

### Fallback Logik
- Om den primära tjänsten misslyckas, försöker systemet automatiskt med den andra tjänsten
- Detta säkerställer hög leveransrate även om en tjänst har problem

## Implementering

### Huvudfunktioner

#### `sendEmailWithSmartRouting(emailData)`
Huvudfunktionen som hanterar smart routing för alla emails.

```typescript
const result = await sendEmailWithSmartRouting({
  to: 'kund@outlook.com',
  subject: 'Test Email',
  html: '<h1>Test</h1>',
  text: 'Test'
})
```

#### `sendOrderConfirmationWithSmartRouting(orderData)`
Skickar orderbekräftelser med smart routing.

```typescript
const result = await sendOrderConfirmationWithSmartRouting({
  customerName: 'John Doe',
  customerEmail: 'john@gmail.com',
  orderNumber: 'ORD-123',
  // ... övriga orderdata
})
```

#### `sendBookingConfirmationWithSmartRouting(bookingData)`
Skickar bokningsbekräftelser med smart routing.

```typescript
const result = await sendBookingConfirmationWithSmartRouting({
  customerName: 'Jane Doe',
  customerEmail: 'jane@hotmail.com',
  bookingDate: '2024-01-15',
  // ... övriga bokningsdata
})
```

#### `sendDelayNotificationWithSmartRouting(data)`
Skickar förseningsmeddelanden med smart routing.

```typescript
const result = await sendDelayNotificationWithSmartRouting({
  customerEmail: 'customer@telia.com',
  customerName: 'Kund',
  orderNumber: 'ORD-123',
  delayMinutes: 15,
  newPickupTime: '18:30',
  location: 'trelleborg'
})
```

### API Endpoints som använder Smart Routing

1. **Order Confirmation**: `/api/orders/confirm`
2. **Booking Confirmation**: `/api/bookings/confirm`
3. **Send Order Confirmation**: `/api/send-order-confirmation`
4. **Send Booking Confirmation**: `/api/send-booking-confirmation`
5. **Delay Notification**: `/api/orders/delay-notification`

### Test API

För att testa systemet finns en dedikerad test-endpoint:

```bash
POST /api/test-smart-routing
{
  "email": "test@outlook.com",
  "testType": "domain-routing"
}
```

## Loggning och Monitoring

Systemet loggar detaljerad information om routing-beslut:

```
🔍 [Email Router] Domain routing decision: {
  email: 'customer@outlook.com',
  domain: 'outlook.com',
  service: 'resend',
  matchedDomain: 'outlook.com'
}
```

### Email Logs
Alla emails loggas i `email_logs` tabellen med:
- `recipient_email`
- `subject`
- `status`
- `service` (resend/sendgrid)
- `message_id`

## Konfiguration

### Resend Inställningar
Konfigureras via `email_settings` tabellen:
- `resend_api_key`
- `resend_from_email`
- `resend_enabled`

### SendGrid Inställningar
Konfigureras via `email_settings` tabellen:
- `sendgrid_api_key`
- `sendgrid_from_email`
- `sendgrid_enabled`

## Fördelar

1. **Optimerad Leverans**: Använder den bästa tjänsten för varje domän
2. **Hög Tillförlitlighet**: Automatisk fallback om en tjänst misslyckas
3. **Outlook Optimering**: Prioriterar Resend för Outlook-domäner som ofta har problem med SendGrid
4. **Lokal Optimering**: Prioriterar Resend för svenska domäner
5. **Transparent Logging**: Detaljerad loggning för debugging och monitoring

## Migration från Gamla Systemet

Systemet ersätter:
- `email-backup-service.ts` funktioner
- Direkta anrop till `sendgrid-service.ts`
- Manuell tjänstval

Alla befintliga API endpoints har uppdaterats för att använda det nya systemet automatiskt.

## Exempel på Routing

| Email Domain | Primär Tjänst | Fallback |
|--------------|---------------|----------|
| user@outlook.com | Resend | SendGrid |
| customer@gmail.com | Resend | SendGrid |
| info@company.com | SendGrid | Resend |
| test@telia.com | Resend | SendGrid |
| admin@yahoo.com | Resend | SendGrid |

## Troubleshooting

### Om emails inte skickas
1. Kontrollera att båda tjänsterna är konfigurerade
2. Verifiera API-nycklar i `email_settings`
3. Kontrollera `email_logs` för felmeddelanden
4. Använd test-API:et för att verifiera funktionalitet

### Debugging
Aktivera detaljerad loggning genom att söka efter `[Email Router]` i loggarna.

## Framtida Förbättringar

1. **Machine Learning**: Lär systemet vilken tjänst som fungerar bäst för olika domäner
2. **Geolokalisering**: Routing baserat på mottagarens geografiska plats
3. **Prestanda Monitoring**: Real-time monitoring av leveransrater per tjänst
4. **A/B Testing**: Testa olika routing-strategier 
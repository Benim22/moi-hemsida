# 🖨️ Webhook Printer Setup Guide

## Problemet
Din molnapp (Vercel/Netlify) kan inte nå din lokala skrivare på `192.168.1.103:9100` eftersom:
- Molnservrar kan inte nå privata IP-adresser
- Firewall-begränsningar blockerar TCP-anslutningar
- Olika nätverk (molnserver vs lokalt nätverk)

## Lösningen: Webhook-server
En lokal server som tar emot utskriftskommandon från molnappen och skickar dem till din skrivare.

## 📋 Installationsguide

### Steg 1: Skapa webhook-server mapp
```bash
mkdir webhook-printer
cd webhook-printer
```

### Steg 2: Kopiera filerna
Kopiera dessa filer till `webhook-printer` mappen:
- `webhook-printer-server.js`
- `webhook-package.json` (döp om till `package.json`)

### Steg 3: Installera dependencies
```bash
npm install
```

### Steg 4: Konfigurera skrivaren
Öppna `webhook-printer-server.js` och uppdatera:
```javascript
// Ändra till din skrivares IP-adress
const PRINTER_IP = '192.168.1.103'; // Din skrivares IP
const PRINTER_PORT = 9100;
```

### Steg 5: Starta servern
```bash
npm start
```

Du ska se:
```
🖨️ Webhook-server kör på port 3001
📡 Skrivare: 192.168.1.103:9100
🌐 Webhook URL: http://localhost:3001/webhook/print
```

## 🌐 Konfigurera din molnapp

### Alternativ 1: Via miljövariabler (Rekommenderat)
Lägg till dessa miljövariabler i din hosting-tjänst:
```
PRINTER_WEBHOOK_URL=http://DIN_EXTERNA_IP:3001/webhook/print
PRINTER_WEBHOOK_TOKEN=din_hemliga_token_här
```

### Alternativ 2: Via kod
Uppdatera `DEFAULT_PRINTER_SETTINGS` i `app/api/printer/route.ts`:
```javascript
webhookUrl: 'http://DIN_EXTERNA_IP:3001/webhook/print',
webhookToken: 'din_hemliga_token_här'
```

## 🔑 Säkerhet och extern åtkomst

### Hitta din externa IP-adress
```bash
# Windows
curl ifconfig.me

# Mac/Linux
curl ifconfig.me
```

### Öppna port i router
1. Logga in på din router (vanligtvis 192.168.1.1)
2. Hitta "Port Forwarding" eller "NAT"
3. Lägg till regel:
   - **Externa port**: 3001
   - **Interna port**: 3001
   - **IP-adress**: [Din dators IP]
   - **Protokoll**: TCP

### Säkerhet
Byt ut `YOUR_SECRET_TOKEN` till något säkert:
```javascript
// I webhook-printer-server.js
if (authToken !== 'ditt_riktiga_säkra_token_här') {
  return res.status(401).json({ error: 'Obehörig' });
}
```

## 🧪 Testa installationen

### Test 1: Lokal server
```bash
curl http://localhost:3001/health
```

Förväntat svar:
```json
{
  "status": "OK",
  "printer": "192.168.1.103:9100",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

### Test 2: Extern åtkomst
```bash
curl http://DIN_EXTERNA_IP:3001/health
```

### Test 3: Webhook-utskrift
```bash
curl -X POST http://localhost:3001/webhook/print \
  -H "Content-Type: application/json" \
  -d '{
    "authToken": "YOUR_SECRET_TOKEN",
    "order": {
      "order_number": "TEST123",
      "customer_name": "Test Kund",
      "created_at": "2024-01-20T10:30:00.000Z",
      "cart_items": [
        {
          "name": "California Roll",
          "quantity": 2,
          "price": 95
        }
      ],
      "total_amount": 190
    }
  }'
```

## 🔧 Felsökning

### Problem: "Kan inte ansluta till skrivaren"
```bash
# Kontrollera att skrivaren svarar
ping 192.168.1.103
telnet 192.168.1.103 9100
```

### Problem: "Webhook timeout"
- Kontrollera att webhook-servern kör: `curl http://localhost:3001/health`
- Kontrollera extern åtkomst: `curl http://DIN_EXTERNA_IP:3001/health`
- Kontrollera router port forwarding

### Problem: "Obehörig"
- Kontrollera att `authToken` matchar i både molnapp och webhook-server
- Kontrollera miljövariabler: `PRINTER_WEBHOOK_TOKEN`

## 📊 Hur det fungerar

```
Molnapp (Vercel) → Internet → Din router → Webhook-server → Skrivare
     ↓                                            ↓
"Skriv ut kvitto"                        TCP 192.168.1.103:9100
     ↓                                            ↓
HTTP POST /webhook/print                   Epson TM-T20III
```

## 🚀 Produktionsmiljö

### Automatisk start (Windows)
Skapa `start-webhook.bat`:
```batch
@echo off
cd /d "C:\path\to\webhook-printer"
npm start
pause
```

### Automatisk start (Mac/Linux)
Skapa systemd service eller använd PM2:
```bash
npm install -g pm2
pm2 start webhook-printer-server.js --name "webhook-printer"
pm2 save
pm2 startup
```

### Backup-metod
Om webhook-servern inte fungerar kan du fortfarande använda textkvitton som backup.

## 🎯 Resultat

Nu kommer din molnapp att:
1. ✅ Först försöka direkt TCP-anslutning
2. ✅ Om det misslyckas i produktion → Använd webhook
3. ✅ Webhook-servern skriver ut kvittot lokalt
4. ✅ Allt fungerar seamless för användaren

**Gratulationer! Nu fungerar utskrivning både lokalt och i produktion!** 🎉 
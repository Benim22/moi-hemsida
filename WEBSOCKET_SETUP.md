# WebSocket-baserad Orderutskrift - Installationsguide

## 📋 Översikt

Denna lösning använder en extern WebSocket-server för att skicka realtidsnotifieringar till restaurangterminaler när nya orders och bokningar kommer in. Detta löser problemet med att Vercel inte stödjer långvariga WebSocket-anslutningar.

## 🏗️ Arkitektur

```
Customer Order/Booking
       ↓
Vercel Next.js App
       ↓
WebSocket Server (Render/Railway)
       ↓
iPad Terminal (Safari)
       ↓
Epson TM-T20III Printer
```

## 🚀 Deployment Steg

### 1. Deploya WebSocket-servern

**Render.com (Rekommenderat - Gratis tier)**

1. Gå till [render.com](https://render.com)
2. Skapa nytt "Web Service"
3. Anslut till ditt GitHub repo
4. Konfigurera:
   - **Root Directory**: `websocket-server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     PORT=10000
     ALLOWED_ORIGINS=https://moi-hemsida.vercel.app
     ```

**Railway.app (Alternativ)**

1. Gå till [railway.app](https://railway.app)
2. Skapa nytt projekt från GitHub
3. Välj `websocket-server` mapp
4. Lägg till environment variables:
   ```
   NODE_ENV=production
   ALLOWED_ORIGINS=https://moi-hemsida.vercel.app
   ```

### 2. Konfigurera Vercel Environment Variables

I ditt Vercel-projekt, lägg till:

```
WEBSOCKET_SERVER_URL=https://your-websocket-server.onrender.com
```

### 3. Uppdatera WebSocket URL i terminalen

I `components/restaurant-terminal.tsx`, uppdatera:

```typescript
const [wsUrl, setWsUrl] = useState(
  process.env.NODE_ENV === 'production' 
    ? 'wss://your-websocket-server.onrender.com'  // ← Byt till din URL
    : 'ws://localhost:3001'
)
```

## 🧪 Testning

### Lokal testning

1. **Starta WebSocket-servern lokalt:**
   ```bash
   cd websocket-server
   npm install
   npm start
   ```

2. **Öppna restaurant-terminal.tsx på iPad**
   - Navigera till `/terminal`
   - Kontrollera att WebSocket-status visar "Ansluten"

3. **Testa med Postman:**
   ```json
   POST http://localhost:3001/send-order
   {
     "id": "test-123",
     "location": "trelleborg",
     "customer_name": "Test Kund",
     "total_amount": 299,
     "items": [{"name": "Sushi Mix", "price": 299}]
   }
   ```

### Produktionstestning

1. **Kontrollera WebSocket-anslutning:**
   - Öppna terminalen på iPaden
   - Kontrollera debug-loggar för WebSocket-status

2. **Testa order-flöde:**
   - Skapa testorder via webbsidan
   - Kontrollera att order visas i terminalen
   - Verifiera att kvitto skrivs ut automatiskt

## 📊 Monitoring

### WebSocket Server Health

Endpoints för övervakning:
- `GET /health` - Serverstatus
- `GET /stats` - Anslutningsstatistik
- `GET /test` - Enkel funktionstest

### Terminal Debug

I restaurant-terminal.tsx finns omfattande debug-loggning:
- WebSocket-anslutningsstatus
- Mottagna meddelanden
- Utskriftsresultat
- Fel och varningar

## 🔧 Felsökning

### Vanliga problem

**1. WebSocket ansluter inte**
- Kontrollera CORS-inställningar
- Verifiera URL:er och portar
- Kontrollera firewall/network-regler

**2. Automatisk utskrift fungerar inte**
- Kontrollera printerinställningar
- Verifiera Epson ePOS-Print SDK
- Kontrollera nätverksanslutning till skrivare

**3. Dubbelutskrifter**
- Kontrollera `autoPrintedOrders` Set
- Verifiera order ID unikhet
- Kontrollera timing på WebSocket-meddelanden

### Debug-kommandon

```bash
# Kontrollera WebSocket-servern
curl https://your-websocket-server.onrender.com/health

# Testa order-notifikation
curl -X POST https://your-websocket-server.onrender.com/send-order \
  -H "Content-Type: application/json" \
  -d '{"id":"test-123","location":"malmo","customer_name":"Test"}'
```

## 🔒 Säkerhet

### Nuvarande implementering
- CORS-kontroll för tillåtna domäner
- Datavalidering på servern
- Ingen autentisering (för enkelhet)

### Rekommendationer för production
- Lägg till API-nycklar/tokens
- Implementera rate limiting
- Logga alla transaktioner
- Använd HTTPS/WSS endast

## 🏃‍♂️ Snabbstart

För att snabbt komma igång:

1. **Deploya WebSocket-servern till Render**
2. **Lägg till environment variable i Vercel**
3. **Uppdatera WebSocket URL i terminalen**
4. **Testa med en order**

WebSocket-servern är nu konfigurerad för automatisk utskrift!

## 📞 Support

För frågor eller problem:
- Kontrollera debug-loggar i terminalen
- Kontrollera WebSocket-serverns hälsostatus
- Verifiera nätverksanslutning mellan alla komponenter

## 🔄 Uppdateringar

För att uppdatera systemet:
1. Uppdatera kod i GitHub
2. Render/Railway deployas automatiskt
3. Vercel uppdateras automatiskt
4. Starta om terminal på iPad för att få nya ändringar 
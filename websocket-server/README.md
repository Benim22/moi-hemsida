# Moi Sushi WebSocket Server

WebSocket-server för realtidsnotifieringar av orders och bokningar till restaurangterminaler.

## Installation

```bash
npm install
```

## Miljövariabler

Skapa en `.env` fil i websocket-server mappen:

```env
# Port för servern (default: 3001)
PORT=3001

# Tillåtna ursprung för CORS (kommaseparerade)
ALLOWED_ORIGINS=http://localhost:3000,https://moi-hemsida.vercel.app

# Node environment
NODE_ENV=development
```

## Lokal utveckling

```bash
# Kör servern i utvecklingsläge
npm run dev

# Eller kör normalt
npm start
```

Servern körs på `http://localhost:3001`

## API Endpoints

### POST `/send-order`
Skickar ny order till alla terminaler för en specifik plats.

```json
{
  "id": "order-123",
  "location": "trelleborg",
  "total_amount": 299,
  "items": [...],
  "customer_name": "John Doe"
}
```

### POST `/send-booking`
Skickar ny bokning till alla terminaler för en specifik plats.

```json
{
  "id": "booking-456",
  "location": "malmo",
  "booking_time": "2024-01-15T18:00:00Z",
  "customer_name": "Jane Smith"
}
```

### POST `/send-status-update`
Skickar status uppdatering för en order.

```json
{
  "orderId": "order-123",
  "status": "completed",
  "location": "trelleborg"
}
```

### GET `/health`
Hälsostatus för servern.

### GET `/stats`
Statistik över anslutningar och meddelanden.

## Deployment

### Render.com (Rekommenderat)

1. Skapa ett nytt "Web Service" på Render
2. Anslut till ditt GitHub repo
3. Välj `websocket-server` som root directory
4. Sätt Build Command: `npm install`
5. Sätt Start Command: `npm start`
6. Lägg till miljövariabler:
   - `NODE_ENV=production`
   - `ALLOWED_ORIGINS=https://moi-hemsida.vercel.app`

### Railway.app

1. Skapa nytt projekt på Railway
2. Anslut GitHub repo
3. Välj websocket-server mapp
4. Lägg till miljövariabler
5. Deploy

### Fly.io

1. Installera flyctl
2. Kör `fly launch` i websocket-server mappen
3. Konfigurera miljövariabler
4. Deploy med `fly deploy`

## WebSocket Events

### Client → Server
- `register-terminal`: Registrera terminal för specifik plats
- `ping`: Håll anslutningen vid liv

### Server → Client
- `registration-confirmed`: Bekräfta terminal registrering
- `new-order`: Ny order för platsen
- `new-booking`: Ny bokning för platsen
- `order-status-update`: Status uppdatering för order
- `pong`: Svar på ping

## Säkerhet

- CORS konfiguration för tillåtna domäner
- Validering av inkommande data
- Rate limiting (kan läggas till)
- Autentisering (kan läggas till)

## Monitoring

Servern loggar alla anslutningar och meddelanden till konsolen. För production rekommenderas:
- Strukturerad logging (Winston)
- Metrics (Prometheus)
- Health checks
- Error tracking (Sentry) 
# 🖨️ Epson TM-T20III Skrivare Setup Guide

Denna guide hjälper dig att konfigurera Epson TM-T20III termisk kvittoskrivare med Moi Sushi-systemet.

## 📋 Översikt

Systemet stöder nu **två olika metoder** för att ansluta till skrivaren:

1. **Backend-metod** (Rekommenderad): Använder `node-thermal-printer` via TCP
2. **Frontend-metod**: Använder Epson ePOS SDK via HTTP

## 🔧 Skrivare Konfiguration

### Nätverksinställningar för TM-T20III

1. **Anslut skrivaren till nätverket**:
   - Via Ethernet-kabel till router/switch
   - Eller konfigurera Wi-Fi (om modellen stöder det)

2. **Hitta skrivarens IP-adress**:
   - Skriv ut nätverksstatus från skrivaren
   - Eller använd routerns admin-panel
   - Eller använd Epson Network Utility

3. **Standardportar**:
   - **TCP**: Port `9100` (för backend-metod)
   - **HTTP**: Port `80` (för ePOS SDK)

## 🚀 Metod 1: Backend (Node.js TCP) - Rekommenderad

### Fördelar:
- ✅ Mer tillförlitlig anslutning
- ✅ Bättre felhantering
- ✅ Fungerar i alla webbläsare
- ✅ Stöder ESC/POS kommandon direkt

### Konfiguration:
1. Gå till **Terminal** → **Skrivarinställningar**
2. Välj **Utskriftsmetod**: `Backend (Node.js TCP)`
3. Välj **Anslutningstyp**: `TCP (Port 9100)`
4. Ange skrivarens **IP-adress**
5. Sätt **Port** till `9100`
6. Klicka **Testa anslutning**

### Tekniska detaljer:
```typescript
// Backend API endpoint: /api/printer
// Använder node-thermal-printer paketet
// TCP-anslutning direkt till skrivaren
```

## 🌐 Metod 2: Frontend (ePOS SDK)

### Fördelar:
- ✅ Direktanslutning från webbläsare
- ✅ Officiell Epson SDK
- ✅ Rik funktionalitet

### Nackdelar:
- ❌ Kräver CORS-konfiguration
- ❌ Begränsad av webbläsarens säkerhetspolicies
- ❌ Kan ha problem med olika nätverkskonfigurationer

### Konfiguration:
1. Gå till **Terminal** → **Skrivarinställningar**
2. Välj **Utskriftsmetod**: `Frontend (ePOS SDK)`
3. Välj **Anslutningstyp**: `Wi-Fi HTTP (Port 80)`
4. Ange skrivarens **IP-adress**
5. Sätt **Port** till `80`
6. Klicka **Testa anslutning**

## 🧪 Testning

### 1. Använd den inbyggda test-funktionen:
- Gå till **Terminal** → **Skrivarinställningar**
- Klicka **Testa anslutning**
- Klicka **Testa utskrift**

### 2. Använd den fristående test-sidan:
- Gå till: `http://localhost:3000/epos-test.html`
- Ange skrivarens IP och port
- Testa anslutning och utskrift

## 🔍 Felsökning

### Problem: "Skrivare inte ansluten"

**För Backend-metod:**
1. Kontrollera att skrivaren är påslagen
2. Kontrollera nätverksanslutning: `ping [skrivare-ip]`
3. Kontrollera att port 9100 är öppen
4. Kontrollera att ingen brandvägg blockerar

**För Frontend-metod:**
1. Kontrollera att port 80 är öppen på skrivaren
2. Kontrollera CORS-inställningar
3. Testa från samma nätverk som skrivaren

### Problem: "Connection Refused"
- Port stängd eller fel port
- Skrivare inte konfigurerad för nätverksutskrift
- Brandvägg blockerar anslutning

### Problem: "Timeout"
- Skrivaren svarar inte
- Fel IP-adress
- Nätverksproblem

## 📊 Inställningar

### Automatiska funktioner:
- **Automatisk utskrift**: Skriv ut kvitton automatiskt för nya beställningar
- **Automatisk e-post**: Skicka orderbekräftelser via e-post
- **Debug-läge**: Använd simulator för utveckling

### Anslutningstyper:
- **TCP (Port 9100)**: Direkt TCP-anslutning (backend)
- **Wi-Fi HTTP (Port 80)**: HTTP-anslutning via ePOS SDK
- **Bluetooth**: För framtida implementation

## 🛠️ Teknisk Information

### Backend API Endpoint:
```bash
POST /api/printer
Content-Type: application/json

{
  "printerIP": "192.168.1.100",
  "printerPort": 9100,
  "testConnection": true  // För test
}

# Eller för utskrift:
{
  "printerIP": "192.168.1.100", 
  "printerPort": 9100,
  "receiptData": {
    "header": "Moi Sushi & Poke Bowl",
    "orderNumber": "12345",
    "customer": "Kund Namn",
    "items": [...],
    "total": "299 kr"
  }
}
```

### Paket som används:
- `node-thermal-printer`: Backend TCP-anslutning
- `epos-print`: Frontend ePOS SDK (via CDN)

## 📝 Rekommendationer

1. **Använd Backend-metoden** för produktion
2. **Sätt fast IP** på skrivaren via router
3. **Testa regelbundet** anslutningen
4. **Aktivera debug-läge** under utveckling
5. **Kontrollera nätverksstabilitet** regelbundet

## 🆘 Support

Om du fortsätter ha problem:
1. Kontrollera debug-loggen i skrivarinställningar
2. Testa med den fristående test-sidan
3. Kontrollera skrivarens nätverksinställningar
4. Kontakta nätverksadministratör om nödvändigt

---

*Utvecklad av Skaply för Moi Sushi & Poke Bowl* 
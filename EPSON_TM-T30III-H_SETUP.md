# Epson TM-T30III-H Konfiguration för WebSocket-utskrift

## 🖨️ Översikt

Epson TM-T30III-H är en nätverksbaserad kvittoskrivare som stöder flera anslutningsmetoder. För bästa kompatibilitet med webbläsare rekommenderar vi **HTTP ePOS-Print**.

## 🔧 Hårdvarukonfiguration

### 1. Nätverksanslutning
- Anslut skrivaren till samma WiFi-nätverk som iPaden
- Notera skrivaren IP-adress (visas på kvitto vid setup)
- Standardport för ePOS-Print: **80**
- Standardport för Raw TCP: **9100**

### 2. Skrivare IP-adress
Du kan hitta IP-adressen på flera sätt:

**Metod 1: Setup-kvitto**
- Håll ned FEED-knappen när du startar skrivaren
- Ett kvitto skrivs ut med nätverksinformation

**Metod 2: Epson Network Utility**
- Ladda ner från Epsons webbsida
- Scanna nätverket efter skrivare

**Metod 3: Router admin**
- Logga in på din router (vanligtvis 192.168.1.1)
- Kolla anslutna enheter

## 🌐 Rekommenderad konfiguration för WebSocket

### Terminal-inställningar:
```
Anslutningstyp: WiFi (HTTP ePOS-Print)
IP-adress: [Din skrivares IP, t.ex. 192.168.1.100]
Port: 80
```

### Varför HTTP ePOS-Print?
- ✅ **Fungerar i webbläsare** - Inga säkerhetsbegränsningar
- ✅ **Stabil anslutning** - HTTP är tillförlitligt
- ✅ **Bra felhantering** - Tydliga felmeddelanden
- ✅ **Epson-optimerat** - Utvecklat specifikt för Epson-skrivare

### Varför inte TCP?
- ❌ **Blockeras av webbläsare** - Säkerhetspolicy
- ❌ **Kräver backend** - Mer komplex implementation
- ❌ **Mindre flexibelt** - Raw socket-begränsningar

## 🧪 Testprocedur

### 1. Grundläggande nätverkstest
```bash
# Från samma nätverk som skrivaren
ping [SKRIVARE_IP]
```

### 2. HTTP ePOS-Print test
```bash
# Testa discovery endpoint
curl -X POST http://[SKRIVARE_IP]/cgi-bin/epos/service.cgi?devid=local_printer&timeout=3000 \
  -H "Content-Type: application/json" \
  -H "SOAPAction: \"\"" \
  -d '{"method":"discover","params":{}}'
```

### 3. Terminal test
- Öppna restaurant-terminal.tsx på iPaden
- Gå till Skrivarinställningar
- Klicka "Testa Anslutningen"
- Kontrollera debug-loggen

## 🔍 Felsökning

### Problem: "Cannot connect to printer"
**Lösning:**
1. Kontrollera att iPad och skrivare är på samma WiFi
2. Verifiera IP-adress (kan ha ändrats)
3. Kontrollera att port 80 är öppen
4. Starta om skrivaren

### Problem: "HTTP 404 Not Found"
**Lösning:**
1. Skrivaren kanske inte stöder ePOS-Print
2. Prova port 9100 med TCP istället
3. Uppdatera skrivare firmware

### Problem: "Mixed Content" fel
**Lösning:**
1. Detta händer på HTTPS-sidor som försöker ansluta till HTTP
2. Använd backend-utskrift istället
3. Eller konfigurera HTTPS på skrivaren (om möjligt)

### Problem: "CORS" fel
**Lösning:**
1. Skrivaren blockerar cross-origin requests
2. Använd backend API för utskrift
3. Eller konfigurera skrivaren för CORS

## 📋 Checklista för setup

### På restaurangen:
- [ ] Skrivare ansluten till WiFi
- [ ] IP-adress noterad
- [ ] Port 80 testad
- [ ] iPad på samma nätverk
- [ ] Terminal öppnad i Safari

### I terminalen:
- [ ] WebSocket-anslutning OK
- [ ] Skrivarinställningar konfigurerade
- [ ] Test-anslutning framgångsrik
- [ ] Test-utskrift fungerar

### För produktion:
- [ ] WebSocket-server deployad (Render)
- [ ] Environment variables satta (Vercel)
- [ ] Orders triggar WebSocket-meddelanden
- [ ] Terminal tar emot meddelanden
- [ ] Utskrift fungerar automatiskt

## 🚀 Produktionsflöde

1. **Kund beställer** → moisushi.se
2. **Order bekräftas** → Vercel API
3. **WebSocket-meddelande** → Render server
4. **Terminal tar emot** → iPad Safari
5. **Utskrift triggas** → Epson TM-T30III-H
6. **Kvitto skrivs ut** → Kunden får kvitto

## 💡 Tips för bästa prestanda

### Nätverksstabilitet:
- Använd 5GHz WiFi för mindre störningar
- Placera router nära skrivaren
- Undvik många enheter på samma nätverk

### Terminal-optimering:
- Håll Safari-fliken aktiv
- Aktivera notifikationer
- Testa regelbundet anslutningen

### Backup-plan:
- Ha alltid manuell utskrift som backup
- Träna personal på båda metoderna
- Övervaka WebSocket-server status 
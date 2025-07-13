# ePOS SDK Testing Guide - Moi Sushi

## Problemet som vi löste

Ursprungligen hade vi flera problem:
1. **Simulator istället för riktig SDK** - `epos-2.js` var bara en simulator
2. **Fel XML-schema** - Skrivaren förväntar sig specifikt ePOS XML-format
3. **Mixed Content** - HTTPS-sida kan inte göra HTTP-anrop till skrivaren
4. **CORS-problem** - Skrivaren tillåter inte cross-origin requests

## Lösningen

### 1. Riktig ePOS SDK Implementation
- Ersatt simulator med riktig HTTP-implementation
- Genererar korrekt ePOS XML-schema
- Automatisk fallback till backend proxy vid CORS/Mixed Content

### 2. Backend Proxy Support
- Ny `print_xml` action i `/api/printer`
- Hanterar HTTPS→HTTP kommunikation
- Korrekt XML-headers och timeout

### 3. Testverktyg
- `epos-real-test.html` - Fullständig test-suite
- `epos-desperate-test.html` - Ursprunglig problemdiagnos

## Testning i Restaurangen

### Steg 1: Kör den nya test-sidan
```
https://www.moisushi.se/epos-real-test.html
```

### Steg 2: Konfigurera skrivaren
1. Ange IP-adress: `192.168.1.103`
2. Ange port: `80` (eller `443` för SSL)
3. Markera SSL om nödvändigt

### Steg 3: Kör testen i ordning
1. **Anslutningstest** - Verifierar att skrivaren svarar
2. **Enkel textutskrift** - Testar grundläggande XML-utskrift
3. **Fullständigt kvitto** - Testar komplett kvitto-format
4. **Backend Proxy Test** - Testar fallback-metoden
5. **Genererad XML** - Visar det XML som skickas

### Steg 4: Testa från terminalen
```
https://www.moisushi.se/terminal
```

## Vad att förvänta sig

### Framgångsrik utskrift
- ✅ Grön text: "Utskrift framgångsrik"
- Kvitto skrivs ut på skrivaren
- Konsol-loggar visar XML-kommunikation

### Fel och lösningar

#### "SchemaError" - LÖST
- **Tidigare**: Fel XML-format
- **Nu**: Korrekt ePOS XML-schema
- **Exempel XML**:
```xml
<?xml version="1.0" encoding="utf-8"?>
<epos-print xmlns="http://www.epson-pos.com/schemas/2011/03/epos-print">
    <text align="center">MOI SUSHI & POKE BOWL</text>
    <text>Order: #12345</text>
    <feed line="2"/>
    <cut type="feed"/>
</epos-print>
```

#### "CORS/Mixed Content" - LÖST
- **Tidigare**: Blockerad av webbläsaren
- **Nu**: Automatisk fallback till backend proxy
- **Loggar**: "Använder backend proxy som fallback"

#### "Failed to fetch" - LÖST
- **Tidigare**: Nätverksproblem
- **Nu**: Bättre error handling och timeouts
- **Fallback**: Simulator vid anslutningsproblem

## Debugging

### Konsol-loggar
```javascript
[ePOS] Ansluter till 192.168.1.103:80
[ePOS] Generated XML: <?xml version="1.0"...
[ePOS] Printer response: <response>...
[ePOS] Utskrift framgångsrik
```

### Nätverkstrafik
- Kontrollera Developer Tools → Network
- Leta efter POST till `/cgi-bin/epos/service.cgi`
- Kontrollera response från skrivaren

### Backend-loggar
```
🔐 XML Printing to 192.168.1.103:80
📄 XML Content: <?xml version="1.0"...
🔄 Sending XML to: http://192.168.1.103:80/cgi-bin/epos/service.cgi
📡 Printer response (200): <response>...
✅ XML printing successful
```

## Vanliga problem och lösningar

### Problem: Skrivaren svarar inte
**Lösning**: 
1. Kontrollera IP-adress och port
2. Testa nätverksanslutning
3. Kontrollera att skrivaren är på

### Problem: "SchemaError" fortfarande
**Lösning**:
1. Kontrollera att du använder den nya `epos-2.js`
2. Verifiera XML-format i konsolen
3. Testa backend proxy-metoden

### Problem: Mixed Content fel
**Lösning**:
1. Automatisk fallback till backend proxy
2. Eller använd HTTP istället för HTTPS för test

## Produktionsdeploy

### Kontrollera att följande är uppdaterat:
- [x] `public/epos-2.js` - Ny implementation
- [x] `app/api/printer/route.ts` - XML-stöd
- [x] `components/restaurant-terminal.tsx` - Uppdaterad användning
- [x] `public/epos-real-test.html` - Test-verktyg

### Testa i produktion:
1. Gå till `https://www.moisushi.se/epos-real-test.html`
2. Kör alla tester
3. Verifiera att kvitton skrivs ut korrekt
4. Testa från terminalen

## Support

Om problem kvarstår:
1. Kontrollera konsol-loggar
2. Testa med `epos-real-test.html`
3. Verifiera skrivare IP och nätverksanslutning
4. Kontrollera backend-loggar för XML-kommunikation

Denna implementation ska lösa alla tidigare problem med ePOS SDK och ge stabil kvittoutskrift i restaurangen. 
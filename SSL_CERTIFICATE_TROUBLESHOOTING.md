# SSL Certificate Troubleshooting Guide
## Moi Sushi - Epson TM-T20III SSL Bridge

### Problem: "INTE SÄKER" i Chrome och SSL Bridge fungerar inte

**Symptom:**
- Chrome visar "INTE SÄKER" på produktionssidan
- SSL Bridge loggar "success" men inget kvitto skrivs ut
- HTTPS-anslutning till skrivaren misslyckas

### Root Cause Analysis

**Problem 1: Fel HTTPS-endpoint**
```javascript
// ❌ FELAKTIG URL (finns inte på Epson-skrivare)
https://192.168.1.103/cgi-bin/epos/service.cgi

// ✅ KORREKT URL för Epson webgränssnitt
https://192.168.1.103/
```

**Problem 2: SSL-certifikat inte betrott**
- Certifikat skapat på skrivaren ✅
- Men iPaden har INTE accepterat certifikatet ❌
- Därför blockeras HTTPS-anslutningar

**Problem 3: Epson TM-T20III har ingen CGI-endpoint**
- `/cgi-bin/epos/service.cgi` finns inte på denna skrivarmodell
- TM-T20III använder andra protokoll för utskrift

### Lösningssteg

#### Steg 1: Acceptera SSL-certifikat på iPad
1. **Öppna Safari på restaurangens iPad**
2. **Navigera till:** `https://192.168.1.103`
3. **Du får säkerhetsvarning** - klicka "Avancerat"
4. **Klicka "Fortsätt till 192.168.1.103"**
5. **Acceptera certifikatet permanent**

#### Steg 2: Verifiera SSL-certifikat
1. **Gå till:** `https://192.168.1.103` i Safari
2. **Kontrollera att det INTE står "Inte säker"**
3. **Du ska se ett lås-ikon** 🔒

#### Steg 3: Rätt utskriftsmetod för TM-T20III
Epson TM-T20III stöder inte CGI-endpoints. Använd istället:

**Option A: ESC/POS över TCP (port 9100)**
```javascript
// Direkt TCP-anslutning (kräver WebSocket bridge)
const socket = new WebSocket('wss://192.168.1.103:9100')
```

**Option B: Epson ePOS-Print SDK**
```javascript
// Använd Epsons officiella SDK
const printer = new epos.ePOSPrint('https://192.168.1.103')
```

**Option C: HTTP POST till korrekt endpoint**
```javascript
// Om skrivaren har HTTP-server aktiverad
https://192.168.1.103/receipt
```

### Teknisk Implementation

#### Uppdaterad SSL Bridge-kod:
```javascript
const printHTTPToPrinter = async (order) => {
  try {
    // Test 1: Grundläggande HTTPS-anslutning
    const testResponse = await fetch(`https://${printerSettings.printerIP}/`, {
      method: 'GET',
      mode: 'cors', // Inte no-cors
      credentials: 'omit'
    })
    
    if (!testResponse.ok) {
      throw new Error('SSL-certifikat inte accepterat')
    }
    
    // Test 2: Korrekt utskriftsendpoint (TBD)
    // TM-T20III kräver specifikt protokoll
    
  } catch (error) {
    console.error('SSL Bridge fel:', error)
    throw error
  }
}
```

### Verifikation

#### Kontrollera SSL-status:
1. **Öppna Developer Tools** i Chrome
2. **Gå till Security-fliken**
3. **Kontrollera certificate status**

#### Test SSL-anslutning:
```bash
# Från terminal/PowerShell
curl -k https://192.168.1.103/
```

### Epson TM-T20III Specifikationer

**Nätverksprotokoll som stöds:**
- ✅ HTTP (port 80)
- ✅ HTTPS (port 443) - med SSL-certifikat
- ✅ Raw TCP (port 9100) - ESC/POS
- ❌ CGI/WebServices - STÖDS INTE

**Korrekt utskriftsmetod:**
1. **TCP Socket (port 9100)** - Bästa för direktutskrift
2. **HTTP POST** - Om webbserver är aktiverad
3. **ePOS-Print SDK** - Epsons officiella lösning

### Nästa steg

1. **Acceptera SSL-certifikat** på iPaden först
2. **Verifiera HTTPS-anslutning** fungerar
3. **Implementera korrekt utskriftsprotokoll** för TM-T20III
4. **Testa på produktionsmiljön**

### Kontakt för support
- **Epson Support:** Teknisk dokumentation för TM-T20III
- **SSL-certifikat:** One.com eller LetsEncrypt för domäncertifikat 
# 🖨️ Epson TM-30MIII-H Felsökningsguide

## Problemdiagnos
**Symptom:** Anslutning säger "success" men skrivaren fungerar inte på riktigt i produktionsmiljö.

**Orsak:** HTTPS-miljö (moisushi.se) kan inte göra HTTP-anrop till skrivaren på grund av Mixed Content-regler.

**Lösning:** Skrivaren måste använda SSL-certifikat och port 443 för HTTPS-anslutning.

## Testfiler som skapats

### 1. epos-production-test.html (Omfattande test)
- **URL:** `https://moisushi.se/epos-production-test.html`
- **Syfte:** Fullständig diagnostik av alla anslutningsmetoder
- **Innehåller:** 
  - Nätverksdiagnostik (ping, port scan, latency)
  - SSL-certifikat test
  - ePOS SDK test
  - XML-utskrift test
  - Backend API test

### 2. epos-ssl-test.html (SSL-fokus)
- **URL:** `https://moisushi.se/epos-ssl-test.html`
- **Syfte:** Enkel SSL-testning
- **Innehåller:** 
  - Grundläggande SSL-test
  - HTTPS-anslutning
  - XML-utskrift via SSL
  - Backend API test

### 3. epos-test.html (Uppdaterad)
- **URL:** `https://moisushi.se/epos-test.html`
- **Syfte:** Backend API-testning med SSL-stöd
- **Innehåller:** 
  - TCP och SSL-anslutning
  - Backend API utskrift
  - XML-utskrift

## Steg-för-steg Felsökning

### Steg 1: Verifiera SSL-certifikat
```bash
# Från datorn/terminalen
openssl s_client -connect 192.168.1.103:443 -servername 192.168.1.103

# Eller via webbläsaren
# Navigera till: https://192.168.1.103:443/
```

### Steg 2: Testa grundläggande anslutning
1. Öppna `https://moisushi.se/epos-ssl-test.html`
2. Ange skrivarens IP-adress: `192.168.1.103`
3. Sätt "Använd SSL" till "Ja"
4. Klicka "Kör Alla Tester"

### Steg 3: Kontrollera Epson Admin Config
Gå till skrivarens admin-panel:
```
https://192.168.1.103/
```

Kontrollera:
- [ ] SSL-certifikat är installerat
- [ ] Port 443 är aktiverad
- [ ] HTTPS är aktiverat
- [ ] CORS är konfigurerat korrekt

### Steg 4: Testa ePOS SDK
1. Öppna `https://moisushi.se/epos-production-test.html`
2. Kör "ePOS SDK Test"
3. Kontrollera att skriptet laddas från: `https://192.168.1.103/js/epos-print-4.0.0.js`

### Steg 5: Testa XML-utskrift
1. Använd XML-test i någon av testfilerna
2. Kontrollera att endpoint `https://192.168.1.103:443/cgi-bin/epos/service.cgi` svarar

## Vanliga Problem och Lösningar

### Problem 1: "Mixed Content" fel
**Symptom:** HTTP-anrop blockeras i HTTPS-miljö
**Lösning:** 
- Installera SSL-certifikat på skrivaren
- Använd port 443 istället för 80
- Sätt `useSSL: true` i alla API-anrop

### Problem 2: SSL-certifikat fel
**Symptom:** "net::ERR_SSL_..." fel
**Lösning:**
- Kontrollera att certifikatet är giltigt
- Säkerställ att certifikatet matchar IP-adressen
- Kontrollera att port 443 är öppen på skrivaren

### Problem 3: ePOS SDK laddar inte
**Symptom:** "epos is not defined"
**Lösning:**
- Kontrollera att `https://192.168.1.103/js/epos-print-4.0.0.js` är tillgänglig
- Verifiera att skrivaren serverar JavaScript-filer via HTTPS

### Problem 4: XML-utskrift misslyckas
**Symptom:** "Service unavailable" eller timeout
**Lösning:**
- Kontrollera att CGI-skript är aktiverat
- Säkerställ att endpoint `/cgi-bin/epos/service.cgi` fungerar
- Testa med korrekta SOAP-headers

## Konfigurationschecklista

### Epson TM-30MIII-H Inställningar:
- [ ] SSL-certifikat installerat
- [ ] Port 443 aktiverad
- [ ] HTTPS aktiverat
- [ ] CGI-skript aktiverat
- [ ] CORS headers konfigurerat
- [ ] JavaScript-filer serveras via HTTPS

### Nätverksinställningar:
- [ ] IP-adress: 192.168.1.103
- [ ] Port 443 öppen i brandvägg
- [ ] Nätverksanslutning stabil
- [ ] Ingen proxy som blockerar HTTPS

### Webbläsarinställningar:
- [ ] Mixed Content inte blockerat
- [ ] JavaScript aktiverat
- [ ] Cookies aktiverade
- [ ] Inga tillägg som blockerar anslutningar

## Troubleshooting Commands

### Testa från terminalen:
```bash
# Testa HTTPS-anslutning
curl -k https://192.168.1.103:443/

# Testa SSL-certifikat
openssl s_client -connect 192.168.1.103:443

# Testa port
telnet 192.168.1.103 443

# Testa XML-endpoint
curl -k -X POST https://192.168.1.103:443/cgi-bin/epos/service.cgi \
  -H "Content-Type: text/xml" \
  -d "<?xml version='1.0'?><test>hello</test>"
```

### Från JavaScript Console:
```javascript
// Testa HTTPS-anslutning
fetch('https://192.168.1.103:443/')
  .then(response => console.log('Status:', response.status))
  .catch(error => console.error('Error:', error));

// Testa ePOS SDK
if (typeof epos !== 'undefined') {
  console.log('ePOS SDK loaded successfully');
  const device = new epos.ePOSDevice();
  device.connect('https://192.168.1.103:443/', (data) => {
    console.log('Connection result:', data);
  });
} else {
  console.error('ePOS SDK not loaded');
}
```

## Kontakt för Support
Om problemen kvarstår efter dessa tester:
1. Exportera testresultaten från `epos-production-test.html`
2. Dokumentera exakta felmeddelanden
3. Notera vilka tester som lyckas/misslyckas
4. Kontrollera Epson-dokumentationen för TM-30MIII-H

## Nästa Steg
När alla tester är gröna:
1. Uppdatera restaurangterminalens skrivarinställningar
2. Sätt `useSSL: true` som standard
3. Använd port 443 istället för 80/9100
4. Aktivera auto-print för produktion

## Tips för Framtiden
- Övervaka SSL-certifikatets utgångsdatum
- Håll ePOS SDK uppdaterat
- Testa anslutningen regelbundet
- Använd alltid HTTPS i produktionsmiljö 
# 📱 iPad Bridge Setup Guide

## Översikt
iPad:en på restaurangen fungerar som en bridge mellan din molnapp och lokala skrivaren. Detta löser problemet att molnservrar inte kan nå privata IP-adresser.

## 🔄 Hur det fungerar

```
Molnapp (www.moisushi.se) → Supabase Webhook → iPad (moisushi.se/terminal) → HTTP → Skrivare
```

1. **Kund beställer** på din molnapp
2. **Supabase webhook** triggas när order skapas
3. **iPad:en lyssnar** på realtime-events från Supabase
4. **iPad skickar HTTP-kommando** till skrivaren (port 80)
5. **Kvitto skrivs ut** automatiskt

## 📋 Installationsguide

### Steg 1: Konfigurera skrivaren för HTTP
1. **Testa att skrivaren svarar på HTTP:**
   ```bash
   curl http://192.168.1.103/
   # Ska returnera Epson-skrivare svar
   ```

2. **Om HTTP inte fungerar:**
   - Gå till skrivarens webbgränssnitt: `http://192.168.1.103`
   - Aktivera "HTTP Server" i nätverksinställningar
   - Eller använd Epson Network Configuration Tool

### Steg 2: Konfigurera iPad
1. **Öppna Safari på iPad:en**
2. **Navigera till:** `https://www.moisushi.se/terminal`
3. **Logga in** med admin-konto
4. **Gå till Skrivarinställningar** (⚙️-ikonen)

### Steg 3: Skrivarinställningar på iPad
Konfigurera följande inställningar:

```
✅ Aktivera utskrift: ON
✅ Automatisk utskrift: ON
✅ Automatisk e-post: ON
📍 Skrivare IP: 192.168.1.103
🔌 Port: 80
🌐 Anslutningstyp: HTTP
🖥️ Utskriftsmetod: Frontend (ePOS SDK)
🐛 Debug-läge: OFF
```

### Steg 4: Testa anslutning
1. **Klicka "Testa anslutning"** i skrivarinställningarna
2. **Förväntat resultat:** ✅ "Anslutning framgångsrik"
3. **Klicka "Testa utskrift"** för att skriva ut testkvitto

### Steg 5: Testa webhook-bridge
1. **Skapa en testbeställning** från en annan enhet på `www.moisushi.se`
2. **iPad:en ska:**
   - Visa popup-notifikation
   - Spela ljud
   - Skriva ut kvitto automatiskt
   - Skicka e-postbekräftelse

## 🔧 Felsökning

### Problem: "Kan inte ansluta till skrivaren"
**Lösning:**
```bash
# 1. Kontrollera nätverksanslutning
ping 192.168.1.103

# 2. Testa HTTP-åtkomst
curl http://192.168.1.103/

# 3. Kontrollera att iPad och skrivare är på samma WiFi
```

### Problem: "ePOS SDK laddas inte"
**Lösning:**
1. Kontrollera att "Utskriftsmetod" är satt till "Frontend"
2. Starta om Safari
3. Rensa cache: Inställningar → Safari → Rensa historik

### Problem: "Webhook triggas inte"
**Lösning:**
1. **Kontrollera Supabase webhook-konfiguration**
2. **Verifiera att iPad:en är inloggad** på `/terminal`
3. **Kontrollera location-filter** i admin-inställningar

### Problem: "Dubbelutskrift"
**Systemet har inbyggt skydd:**
- ✅ Tid-baserat skydd (10 sekunder)
- ✅ Set-baserat skydd (unika order-ID:n)
- ✅ Globala variabler för extra skydd

## 📊 Monitoring och Status

### Debug-logg
- **Visa debug-logg** i skrivarinställningar
- **Rensa logg** när den blir för lång
- **Övervaka** för fel och varningar

### Webhook-status
iPad:en visar realtidsstatus för:
- 🟢 **Aktiv:** Lyssnar på webhook-events
- 🔴 **Inaktiv:** Inte ansluten
- ⚠️ **Fel:** Problem med anslutning

### Vanliga loggmeddelanden
```
✅ "ePOS SDK laddat framgångsrikt"
📨 "Webhook-event mottaget: Order #12345"
🖨️ "Automatisk utskrift aktiverad för order #12345"
✅ "Kvitto utskrivet framgångsrikt"
📧 "E-postbekräftelse skickad"
```

## 🚀 Produktionskonfiguration

### Automatisk start
1. **Sätt iPad som Always On:**
   - Inställningar → Skärm och ljusstyrka → Auto-Lock → Aldrig
   - Inställningar → Batterioptimering → Låg strömläge → OFF

2. **Bookmark terminal-sidan:**
   - Lägg till `moisushi.se/terminal` på hemskärmen
   - Konfigurera som startapp

### Säkerhet
- **Admin-inloggning krävs** för åtkomst till terminal
- **Location-baserad filtrering** (endast orders för rätt restaurang)
- **HTTPS-kryptering** för alla kommunikationer

## 🎯 Fördelar med denna lösning

### ✅ Fördelar
- **Ingen extra server** behövs
- **Fungerar i produktion** utan nätverkskonfiguration
- **Realtime** - omedelbar utskrift
- **Robust** - duplikatskydd och felhantering
- **Skalbar** - fungerar för flera restauranger

### 🔄 Backup-metoder
Om iPad-bridge inte fungerar:
1. **Manuell utskrift** från terminal-sidan
2. **Textkvitto** som backup
3. **E-postbekräftelser** fungerar alltid

## 📝 Checklista för go-live

### Före öppning:
- [ ] iPad:en är ansluten till WiFi
- [ ] Terminal-sidan är öppnen och inloggad
- [ ] Skrivarinställningar är konfigurerade
- [ ] Testutskrift fungerar
- [ ] Automatisk utskrift är aktiverad
- [ ] E-postutskick fungerar

### Under drift:
- [ ] Övervaka debug-logg för fel
- [ ] Kontrollera att kvitton skrivs ut
- [ ] Säkerställ att iPad:en inte går i viloläge
- [ ] Backup-plan om skrivaren går sönder

---

**🎉 Nu fungerar kvittoutskrift både lokalt och i produktion via iPad-bridge!** 
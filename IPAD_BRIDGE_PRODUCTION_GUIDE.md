# 🚀 iPad Bridge - Produktionsmiljö Guide

## 📋 Komplett steg-för-steg setup för restaurangen

### Steg 1: Förbered skrivaren
1. **Kontrollera att skrivaren är på och ansluten till WiFi**
   - IP-adress: `192.168.1.103`
   - Kontrollera att den svarar: `ping 192.168.1.103`

2. **Aktivera HTTP-server på skrivaren**
   - Gå till skrivarens webbgränssnitt: `http://192.168.1.103`
   - Aktivera "HTTP Server" i nätverksinställningar
   - Eller använd Epson Network Configuration Tool

### Steg 2: Ta bort webhook från Supabase
1. **Gå till Supabase Dashboard**
2. **Database → Webhooks**
3. **Ta bort webhook:** `moi-printer-webhook`
4. **Spara ändringarna**

*Vi använder inte webhook längre - iPad Bridge hanterar allt!*

### Steg 3: Pusha koden till GitHub
```bash
git add .
git commit -m "Add iPad Bridge printer support for production"
git push origin main
```

### Steg 4: Deploy till produktion
- Koden deployar automatiskt till Vercel/Netlify
- Vänta tills deployment är klar
- Kontrollera att `https://moisushi.se` fungerar

### Steg 5: Konfigurera iPad i restaurangen

#### 5.1 Öppna terminal på iPad
1. **Öppna Safari på iPad**
2. **Navigera till:** `https://moisushi.se/terminal`
3. **Logga in** med admin-konto
4. **Lägg till på hemskärmen** (för enkel åtkomst)

#### 5.2 Konfigurera skrivarinställningar
Gå till **Skrivarinställningar** (⚙️-ikonen) och konfigurera:

```
✅ Aktivera utskrift: ON
✅ Automatisk utskrift: ON
✅ Automatisk e-post: ON
📍 Skrivare IP: 192.168.1.103
🔌 Port: 80
🌐 Anslutningstyp: HTTP
🖥️ Utskriftsmetod: Frontend (iPad Bridge)
🐛 Debug-läge: OFF (för produktion)
```

#### 5.3 Testa anslutning
1. **Klicka "Testa anslutning"**
2. **Förväntat resultat:** ✅ "iPad Bridge: Anslutning framgångsrik"
3. **Klicka "Testa utskrift"** för att skriva ut testkvitto

### Steg 6: Testa hela systemet

#### 6.1 Automatisk utskrift via webhook-events
1. **Skapa testbeställning** från `https://moisushi.se`
2. **iPad ska:**
   - Visa popup-notifikation
   - Spela ljud
   - Skriva ut kvitto automatiskt via iPad Bridge
   - Skicka e-postbekräftelse

#### 6.2 Manuell utskrift
1. **Gå till terminal-sidan** på iPad
2. **Klicka på en order**
3. **Klicka "Skriv ut kvitto"**
4. **Kvitto ska skrivas ut direkt**

## 🔧 Så här fungerar iPad Bridge

```
Kund beställer → Supabase → Realtime Event → iPad lyssnar → HTTP till skrivare → Kvitto!
```

1. **Kund gör beställning** på `https://moisushi.se`
2. **Order sparas** i Supabase database
3. **Realtime event** skickas till alla anslutna klienter
4. **iPad terminal** lyssnar på events
5. **iPad skickar HTTP-kommando** direkt till skrivaren
6. **Kvitto skrivs ut** automatiskt

## ✅ Fördelar med iPad Bridge

- **🔒 Säkert**: Ingen portöppning i router
- **⚡ Snabbt**: Direkt kommunikation iPad → Skrivare
- **🎯 Enkelt**: Ingen extra server behövs
- **🔄 Robust**: Fungerar även om internet är långsamt
- **📱 Användarvänligt**: Bara öppna Safari på iPad

## 🚨 Felsökning

### Problem: "Kan inte ansluta till skrivaren"
**Lösning:**
1. Kontrollera att iPad och skrivare är på samma WiFi
2. Testa: `ping 192.168.1.103` från iPad (Developer Tools)
3. Kontrollera att skrivarens HTTP-server är aktiverad

### Problem: "Kvitto skrivs inte ut"
**Lösning:**
1. Kontrollera debug-logg på terminal-sidan
2. Testa manuell utskrift först
3. Kontrollera att automatisk utskrift är aktiverad

### Problem: "iPad går i viloläge"
**Lösning:**
1. **Inställningar → Skärm → Auto-Lock → Aldrig**
2. **Inställningar → Batteri → Låg strömläge → OFF**
3. Håll terminal-sidan öppen i Safari

## 📊 Monitoring

### Debug-logg
Terminal-sidan visar realtidslogg:
- ✅ "iPad Bridge: Anslutning framgångsrik"
- 📨 "Realtime event mottaget: Order #12345"
- 🖨️ "iPad Bridge: Kvitto skickat till skrivaren"

### Status-indikatorer
- 🟢 **Grön**: Allt fungerar
- 🟡 **Gul**: Varning (t.ex. långsam anslutning)
- 🔴 **Röd**: Fel (kontrollera debug-logg)

## 🎯 Produktionschecklista

### Före öppning:
- [ ] iPad ansluten till WiFi
- [ ] Terminal-sidan öppen (`https://moisushi.se/terminal`)
- [ ] Inloggad som admin
- [ ] Skrivarinställningar konfigurerade
- [ ] Testutskrift fungerar
- [ ] Automatisk utskrift aktiverad
- [ ] iPad kommer inte gå i viloläge

### Under drift:
- [ ] Kontrollera debug-logg för fel
- [ ] Säkerställ att kvitton skrivs ut
- [ ] Backup: Manuell utskrift finns tillgänglig
- [ ] E-postbekräftelser skickas

---

**🎉 Nu fungerar kvittoutskrift sömlöst i produktionsmiljön via iPad Bridge!**

## 📞 Support

Om något inte fungerar:
1. Kontrollera debug-logg på terminal-sidan
2. Testa manuell utskrift
3. Starta om iPad och öppna terminal-sidan igen
4. Kontakta utvecklare med skärmdump av debug-logg 
# 🔧 Skrivare Felsökning - Varför fungerar det i Wix men inte här?

## 🤔 Problemet

Du har märkt att Epson TM-T20III skrivaren fungerar perfekt i **Wix Mobile POS** men inte hittas i ditt eget system, speciellt när du använder "Textkvitto"-funktionen.

## 📱 Varför fungerar det i Wix?

### **Wix Mobile POS använder native mobilfunktioner:**

1. **Bluetooth-parning via operativsystemet**
   - Wix använder telefonens inbyggda Bluetooth-stack
   - Automatisk enhet-upptäckt via iOS/Android APIs
   - Direkt kommunikation med skrivaren

2. **Network Service Discovery**
   - Använder **Bonjour** (iOS) eller **mDNS** (Android)
   - Automatisk upptäckt av nätverksskrivare
   - Native network APIs för printer-kommunikation

3. **Platform-specifika printer-drivrutiner**
   - iOS: AirPrint-kompatibilitet
   - Android: Direct Wi-Fi printing
   - Optimerad för mobila enheter

## 🌐 Varför fungerar det INTE i webbläsaren?

### **Webbläsare har säkerhetsbegränsningar:**

1. **Ingen direkt Bluetooth-åtkomst**
   - Web Bluetooth API är begränsad
   - Kräver explicit användarinteraktion
   - Inte alla skrivare stöds

2. **Nätverksbegränsningar**
   - CORS-policy blockerar cross-origin requests
   - Ingen direkt TCP-socket åtkomst
   - Begränsad port-åtkomst

3. **"Textkvitto" är INTE riktig utskrift**
   - Det är bara en **textvisning** i webbläsaren
   - Öppnar bara ett nytt fönster med kvittotexten
   - Försöker INTE kommunicera med skrivaren

## ✅ Lösningar

### **1. Aktivera termisk utskrift (Rekommenderat)**

```bash
# I terminal-appen:
1. Gå till ⚙️ Skrivarinställningar
2. Aktivera "ePOS-utskrift" ✅
3. Välj "Backend (Node.js TCP)" som utskriftsmetod
4. Ange skrivarens IP-adress (t.ex. 192.168.1.100)
5. Använd port 9100 (TCP)
6. Klicka "Testa anslutning"
```

### **2. Hitta skrivarens IP-adress**

#### **Från skrivaren:**
```bash
# Epson TM-T20III:
1. Håll FEED-knappen i 3 sekunder
2. Skriv ut nätverksstatus
3. Leta efter "IP Address"
```

#### **Från routern:**
```bash
1. Logga in på router (vanligtvis 192.168.1.1)
2. Gå till "Connected Devices" eller "DHCP Client List"
3. Leta efter "EPSON" eller "TM-T20III"
```

#### **Använd "Sök skrivare"-funktionen:**
```bash
1. I skrivarinställningar
2. Klicka "🔍 Sök skrivare"
3. Systemet testar vanliga IP-adresser automatiskt
```

### **3. Nätverkskonfiguration**

#### **Kontrollera att båda enheterna är på samma nätverk:**
```bash
# På datorn/telefonen:
ipconfig  # Windows
ifconfig  # Mac/Linux

# Jämför nätverksadress med skrivarens IP
# Exempel: Om dator har 192.168.1.50
# Ska skrivare ha 192.168.1.xxx
```

#### **Testa anslutning manuellt:**
```bash
# Windows:
telnet 192.168.1.100 9100

# Mac/Linux:
nc -zv 192.168.1.100 9100

# Om det fungerar: "Connected" eller "succeeded"
# Om det misslyckas: "Connection refused" eller "timeout"
```

### **4. Förbättrad "Textkvitto"-funktion**

Nu försöker "Textkvitto" först skriva ut till termisk skrivare:

```javascript
// Ny logik:
1. Om termisk skrivare är aktiverad → Försök skriv ut
2. Om utskrift lyckas → Klar! 
3. Om utskrift misslyckas → Visa textfönster som backup
```

## 🔍 Felsökning steg-för-steg

### **Steg 1: Kontrollera nätverksanslutning**
```bash
1. Både skrivare och dator på samma WiFi? ✅
2. Skrivaren har IP-adress? ✅
3. Ping fungerar till skrivaren? ✅
```

### **Steg 2: Testa backend-anslutning**
```bash
1. Öppna /terminal
2. Gå till skrivarinställningar
3. Aktivera ePOS-utskrift
4. Ange rätt IP och port (9100)
5. Klicka "Testa anslutning"
6. Kontrollera debug-loggen
```

### **Steg 3: Använd "Sök skrivare"**
```bash
1. Klicka "🔍 Sök skrivare"
2. Vänta medan systemet scannar nätverket
3. Om skrivare hittas → Använd den IP-adressen
4. Om ingen hittas → Kontrollera nätverksinställningar
```

### **Steg 4: Testa utskrift**
```bash
1. Välj en order
2. Klicka "📄 Textkvitto"
3. Kontrollera debug-loggen:
   - "Försöker skriva ut till termisk skrivare..." ✅
   - "Termisk utskrift lyckades!" ✅
   - Eller "Visar textkvitto istället" (om det misslyckas)
```

## 📋 Vanliga problem och lösningar

### **Problem: "Ingen skrivare hittades"**
```bash
Orsak: Skrivaren är inte på samma nätverk
Lösning: 
1. Kontrollera WiFi-anslutning
2. Restart både skrivare och router
3. Använd Ethernet-kabel istället för WiFi
```

### **Problem: "Hittar skrivare men det finns ingen"** 
```bash
Orsak: Falskt positivt - annan enhet svarar på samma port
Lösning: 
1. Systemet testar nu med ESC/POS-kommandon
2. Endast verifierade Epson-skrivare rapporteras
3. Kontrollera debug-loggen för detaljer:
   - "TCP-anslutning funkar men enheten svarar inte som Epson-skrivare"
   - "Verifierad Epson-skrivare hittad"
```

### **Problem: "Connection refused"**
```bash
Orsak: Fel port eller skrivaren accepterar inte TCP
Lösning:
1. Prova port 80 istället för 9100
2. Aktivera "Network printing" på skrivaren
3. Kontrollera brandväggsinställningar
```

### **Problem: "Textkvitto visar bara text"**
```bash
Orsak: Termisk utskrift är inte aktiverad
Lösning:
1. Gå till skrivarinställningar
2. Aktivera "ePOS-utskrift" ✅
3. Stäng av "Debug-läge"
4. Testa igen
```

## 🎯 Slutsats

**Wix fungerar** eftersom det använder native mobile APIs som har direktåtkomst till skrivaren.

**Din webbapp** måste använda backend-lösningen (node-thermal-printer via TCP) för att komma runt webbläsarens säkerhetsbegränsningar.

**"Textkvitto"** har nu förbättrats för att först försöka riktig utskrift innan den visar text!

---

**💡 Tips:** För bästa resultat, använd alltid **Backend-metoden** med **TCP port 9100** för Epson TM-T20III. 
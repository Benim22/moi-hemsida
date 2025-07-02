# 🖨️ Automatisk Kvittoutskrift för Trelleborg

## ✅ Vad vi har implementerat

### **Automatisk utskrift för Trelleborg-beställningar**
- När en beställning läggs för **Trelleborg** skrivs ett kvitto automatiskt ut på Epson TM-T20III
- Kvittot skrivs ut direkt efter att e-postbekräftelsen skickats
- Fungerar bara om skrivarinställningarna är korrekt konfigurerade

### **Manuell utskrift från terminalen**
- Du kan skriva ut kvitton manuellt från restaurangterminalen
- Två knappar finns: **"🎭 Simulator"** och **"🖨️ Epson"**
- Simulator visar kvittot i webbläsaren, Epson skriver ut på riktig skrivare

## 🔧 Hur du aktiverar automatisk utskrift

### **Steg 1: Gå till Terminalen**
1. Öppna: `http://localhost:3000/terminal`
2. Logga in med dina admin-uppgifter

### **Steg 2: Konfigurera Skrivaren**
1. Klicka på **⚙️ Skrivarinställningar** (längst upp till höger)
2. Aktivera följande inställningar:
   - ✅ **Aktivera ePOS-utskrift**
   - ✅ **🏪 Trelleborg Auto-utskrift**
   - ✅ **Automatisk utskrift** (för alla beställningar)
3. Ange **Skrivare IP-adress**: `192.168.1.100` (eller din skrivares IP)
4. Välj **Utskriftsmetod**: `Backend (Node.js TCP)`
5. Välj **Anslutningstyp**: `TCP (Port 9100)`

### **Steg 3: Testa Anslutningen**
1. Klicka **"Testa anslutning"** för att kontrollera att skrivaren svarar
2. Klicka **"Testa utskrift"** för att skriva ut ett test-kvitto
3. Om testet fungerar är allt klart! ✅

## 🎯 Hur det fungerar

### **Automatisk utskrift:**
```
Kund lägger beställning för Trelleborg
    ↓
E-postbekräftelse skickas
    ↓
System kontrollerar om "Trelleborg Auto-utskrift" är aktiverad
    ↓
Kvitto skrivs automatiskt ut på Epson TM-T20III
    ↓
Beställning visas i terminalen
```

### **Manuell utskrift:**
1. Gå till **Terminal** → **Beställningar**
2. Klicka på en beställning för att se detaljer
3. Klicka **"🖨️ Epson"** för att skriva ut kvitto
4. Eller klicka **"🎭 Simulator"** för att visa kvitto i webbläsaren

## 🛠️ Felsökning

### **Kvitto skrivs inte ut automatiskt:**
1. Kontrollera att **"🏪 Trelleborg Auto-utskrift"** är aktiverad
2. Kontrollera att **"Aktivera ePOS-utskrift"** är aktiverad
3. Testa anslutningen med **"Testa anslutning"**-knappen
4. Kontrollera att skrivaren är ansluten till samma nätverk

### **"Anslutningsfel" visas:**
1. Kontrollera att IP-adressen är korrekt
2. Kontrollera att skrivaren är påslagen
3. Kontrollera att både dator och skrivare är på samma WiFi-nätverk
4. Prova att använda **"Sök skrivare"** för att hitta skrivarens IP

### **Kvitto skrivs ut men ser konstigt ut:**
1. Kontrollera att **Utskriftsmetod** är `Backend (Node.js TCP)`
2. Kontrollera att **Anslutningstyp** är `TCP (Port 9100)`
3. Starta om skrivaren och testa igen

## 📋 Kvittoinformation som skrivs ut

```
================================
        Moi Sushi & Poke Bowl
================================

Order: #12345
Datum: 2024-01-15 14:30:25
Kund: Anna Andersson
Telefon: 070-123 45 67
Typ: Avhämtning
Tid: Om 30 minuter
Restaurang: Trelleborg

--------------------------------
2x California Roll              178 kr
1x Lax Pokébowl                 129 kr
   + Extra avokado               15 kr
--------------------------------

                    TOTALT: 322 kr

Speciella önskemål:
Extra wasabi tack!

Tack för ditt köp!
Utvecklad av Skaply
```

## 🔍 Debug och Loggning

- Alla utskriftsaktiviteter loggas i **Skrivarinställningar** → **Debug-logg**
- Kontrollera konsolen i webbläsaren för detaljerade felmeddelanden
- Använd **Debug-läge (Simulator)** för att testa utan riktig skrivare

## 📞 Support

Om du har problem:
1. Kontrollera debug-loggen i skrivarinställningar
2. Testa med **"Sök skrivare"** för att kontrollera nätverksanslutning
3. Använd testsidan: `http://localhost:3000/epos-test.html`

---

**🎉 Nu är automatisk kvittoutskrift aktiverad för Trelleborg-beställningar!** 
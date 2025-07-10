# 🧪 Webhook Testing Guide

## Översikt
Denna guide hjälper dig testa att Supabase webhook-funktionaliteten fungerar korrekt med iPad-bridge lösningen.

## 🔄 Hur systemet fungerar nu

```
Ny order → Supabase DB → Realtime Event → iPad (/terminal) → HTTP → Skrivare
```

**VIKTIGT:** Vi använder **Supabase Realtime** (inte webhook-URL) för iPad-bridge!

## 📋 Test-metoder

### **Test 1: Realtime Connection (Grundtest)**

#### På iPad:en (`/terminal`):
1. **Öppna Safari** och gå till `https://www.moisushi.se/terminal`
2. **Logga in** med admin-konto
3. **Öppna Developer Console** (Safari → Utveckla → Konsol)
4. **Leta efter dessa meddelanden:**
   ```
   📡 Startar real-time prenumerationer för: {userId: ..., userLocation: ...}
   📡 Orders prenumeration status: SUBSCRIBED
   ✅ Prenumeration på orders aktiv!
   ```

#### Förväntat resultat:
- ✅ `SUBSCRIBED` status visas
- ✅ Inga error-meddelanden
- ✅ iPad:en lyssnar på realtime-events

---

### **Test 2: Manual Database Insert (Direkttest)**

#### Via Supabase Dashboard:
1. **Gå till Supabase Dashboard** → Table Editor → `orders`
2. **Klicka "Insert row"**
3. **Fyll i testdata:**
   ```json
   {
     "order_number": "TEST-001", 
     "customer_name": "Test Kund",
     "total_amount": 299,
     "location": "malmo",
     "status": "pending",
     "cart_items": [
       {
         "name": "California Roll",
         "quantity": 2, 
         "price": 95
       }
     ],
     "created_at": "2024-01-20T10:30:00.000Z"
   }
   ```
4. **Klicka "Save"**

#### På iPad:en - förväntat resultat:
- ✅ **Console-meddelande:** `🔔 NY BESTÄLLNING MOTTAGEN: {order data}`
- ✅ **Popup-notifikation** visas
- ✅ **Ljud spelas** 
- ✅ **Automatisk utskrift** triggas (om aktiverat)
- ✅ **Debug-logg** visar: `🖨️ STARTAR automatisk utskrift för order #TEST-001`

---

### **Test 3: Frontend Order Creation (Fullständigt test)**

#### Skapa riktig order:
1. **Öppna ny webbläsare-flik** (inte iPad:en)
2. **Gå till:** `https://www.moisushi.se/order`
3. **Lägg till items** i kundvagn
4. **Fyll i beställningsformulär:**
   - Namn: "Test Customer"
   - Telefon: "0701234567"
   - Location: "Malmö" (eller vilken location iPad:en lyssnar på)
5. **Skicka beställning**

#### På iPad:en - förväntat resultat:
- ✅ **Realtime-event** mottaget
- ✅ **Notifikation** med orderdetaljer
- ✅ **Automatisk utskrift** (om aktiverat)
- ✅ **E-post** skickas (om aktiverat)

---

### **Test 4: Webhook URL Test (Legacy)**

**OBS:** Detta är din gamla webhook-URL från bilden. Vi använder den inte längre, men vi kan testa att den fungerar:

#### Manuell webhook-test:
```bash
curl -X POST http://192.168.1.103:3001/webhook/print \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "order_number": "WEBHOOK-TEST",
      "customer_name": "Webhook Test",
      "created_at": "2024-01-20T10:30:00.000Z",
      "cart_items": [
        {
          "name": "Test Sushi",
          "quantity": 1,
          "price": 199
        }
      ],
      "total_amount": 199
    },
    "authToken": "your-secure-token-here"
  }'
```

#### Förväntat resultat:
- **Om webhook-server kör:** ✅ Kvitto skrivs ut direkt
- **Om ingen server:** ❌ Connection refused

---

## 🔍 **Debug & Troubleshooting**

### **Problem: "Inga realtime-events mottags"**

#### Kontrollera på iPad:en:
```javascript
// Kör i console på /terminal
console.log('User:', window.userProfile)
console.log('Location:', window.userProfile?.location)
console.log('Subscription status:', window.subscriptionStatus)
```

#### Lösningar:
1. **Kontrollera användarens location** - måste matcha order location
2. **Logga ut och in igen** på terminal
3. **Kontrollera Supabase connection** i Network tab

### **Problem: "Realtime event mottaget men ingen utskrift"**

#### Kontrollera skrivarinställningar:
1. **Terminal** → **⚙️ Skrivarinställningar**
2. **Verifiera:**
   - ✅ Aktivera utskrift: ON
   - ✅ Automatisk utskrift: ON
   - ✅ IP: 192.168.1.103
   - ✅ Port: 80 (för HTTP) eller 9100 (för TCP)
   - ✅ Utskriftsmetod: Frontend (ePOS SDK)

#### Debug-loggar att kolla:
```
🔔 NY BESTÄLLNING MOTTAGEN: [order data]
🖨️ STARTAR automatisk utskrift för order #[nummer]
✅ Termisk utskrift lyckades!
```

### **Problem: "Duplikatutskrift"**

#### Systemet har inbyggt skydd:
```javascript
// Kolla i console:
console.log('Auto-printed orders:', Array.from(autoPrintedOrders))
console.log('Last printed:', lastPrintedOrderId, lastPrintedTime)
```

#### Kontrollera duplikatskydd:
- ✅ **Set-baserat skydd:** Samma order-ID kan inte skrivas ut två gånger
- ✅ **Tid-baserat skydd:** 10 sekunders cooldown mellan samma order

---

## 📊 **Monitoring Dashboard**

### **Real-time status på iPad:en:**

#### Debug-logg innehåll:
```
✅ "ePOS SDK laddat framgångsrikt"
📡 "Startar real-time prenumerationer för: {location: 'malmo'}"
📡 "Orders prenumeration status: SUBSCRIBED"
🔔 "NY BESTÄLLNING MOTTAGEN: Order #12345"
🖨️ "STARTAR automatisk utskrift för order #12345"
✅ "Termisk utskrift lyckades!"
📧 "E-postbekräftelse skickad"
```

#### Fel-meddelanden att vara uppmärksam på:
```
❌ "Orders prenumeration status: SUBSCRIPTION_ERROR"
❌ "Supabase connection lost"
❌ "ePOS SDK kunde inte laddas"
❌ "Skrivaren på 192.168.1.103:80 svarar inte"
```

---

## 🎯 **Complete Test Checklist**

### **Innan du börjar:**
- [ ] iPad:en är på samma WiFi som skrivaren
- [ ] iPad:en är inloggad på `/terminal`
- [ ] Skrivarinställningar är konfigurerade
- [ ] Automatisk utskrift är aktiverad

### **Test 1 - Realtime Connection:**
- [ ] Console visar `SUBSCRIBED` status
- [ ] Inga error-meddelanden
- [ ] Debug-logg visar prenumerations-info

### **Test 2 - Manual DB Insert:**
- [ ] Notification visas på iPad:en
- [ ] Ljud spelas
- [ ] Automatisk utskrift triggas
- [ ] Debug-logg visar utskrift-process

### **Test 3 - Frontend Order:**
- [ ] Order skapas från `/order` sidan
- [ ] iPad:en får realtime-event
- [ ] Kvitto skrivs ut automatiskt
- [ ] E-post skickas (om aktiverat)

### **Test 4 - Production Test:**
- [ ] Testa från extern enhet (inte samma nätverk)
- [ ] Verifiera att orders kommer till rätt location
- [ ] Kontrollera att endast admin kan se terminal

---

## 🚀 **Go-Live Checklist**

### **Produktionsmiljö:**
- [ ] iPad:en körs i kiosk-mode (always on)
- [ ] Terminal-sidan är bookmarkad på hem-skärm
- [ ] Admin är inloggad och location är satt
- [ ] Skrivaren fungerar och har papper
- [ ] Backup-plan om iPad eller skrivare går sönder

### **Webhook-konfiguration (Legacy):**
- [ ] Supabase webhook är konfigurerad (om du vill ha backup)
- [ ] URL pekar på rätt IP:port
- [ ] Events är satta till "Insert" på "orders" tabell
- [ ] Webhook-server kör lokalt (om använd som backup)

---

**🎉 Lycka till med testningen! Följ checklistorna metodiskt så kommer allt fungera perfekt.** 
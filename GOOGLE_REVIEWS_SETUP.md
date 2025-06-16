# 🌟 Google Reviews Setup Guide

En komplett guide för att integrera Google Reviews i era location modals.

## 📋 Vad ni behöver från Google

### 1. Google Cloud Console Setup

1. **Gå till Google Cloud Console**
   - Besök: https://console.cloud.google.com
   - Logga in med ert Google-konto

2. **Skapa eller välj projekt**
   - Skapa nytt projekt eller välj befintligt
   - Notera projekt-ID:t

3. **Aktivera APIs**
   Gå till "APIs & Services" > "Library" och aktivera:
   - ✅ **Places API (New)**
   - ✅ **Places API** 
   - ✅ **Geocoding API**

4. **Skapa API-nyckel**
   - Gå till "APIs & Services" > "Credentials"
   - Klicka "Create Credentials" > "API Key"
   - Kopiera nyckeln och spara säkert

### 2. API-nyckel Konfiguration

**Lägg till i `.env.local`:**
```bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=din-places-api-nyckel-här
```

**För säkerhet - begränsa API-nyckeln:**
1. Gå till Credentials i Google Cloud Console
2. Klicka på er API-nyckel
3. Under "Application restrictions" välj "HTTP referrers"
4. Lägg till:
   - `http://localhost:3000/*` (för utveckling)
   - `https://er-domän.com/*` (för produktion)

## 🏪 Hitta Place IDs för era restauranger

### Metod 1: Automatisk sökning (Rekommenderat)
Kör detta script för att hitta place_ids:

```typescript
// I browser console på er sida
import { googleReviewsService } from '@/lib/google-reviews'

// För Trelleborg
const trelleborgPlaceId = await googleReviewsService.findPlaceId(
  'Moi Sushi Trelleborg', 
  'Corfitz-Beck-Friisgatan 5B, 231 43, Trelleborg'
)
console.log('Trelleborg Place ID:', trelleborgPlaceId)

// För Malmö  
const malmoPlaceId = await googleReviewsService.findPlaceId(
  'Moi Sushi Malmö',
  'Stora Nygatan 33, 211 37, Malmö' 
)
console.log('Malmö Place ID:', malmoPlaceId)
```

### Metod 2: Manuell sökning
1. Gå till Google Maps
2. Sök efter "Moi Sushi Trelleborg"
3. Klicka på restaurangen
4. Titta på URL:en - place_id finns där
5. Exempel: `maps.google.com/place?q=...&ftid=PLACE_ID_HÄR`

### Metod 3: Places API Test
Använd Google's Place Finder:
https://developers.google.com/maps/documentation/places/web-service/place-id

## 🔧 Uppdatera Place IDs

När ni har hittat era riktiga place_ids, uppdatera:

**I `contexts/LocationContext.tsx`:**
```typescript
// Trelleborg
placeId: "ChIJ_RÄTT_PLACE_ID_TRELLEBORG"

// Malmö  
placeId: "ChIJ_RÄTT_PLACE_ID_MALMÖ"
```

**Och i `app/locations/page.tsx`:**
```typescript
<GoogleReviews
  locationId={modalLocation.id}
  locationName={modalLocation.name}
  placeId={modalLocation.placeId}
  showMockData={false} // ✨ Ändra till false för riktiga reviews
/>
```

## 📊 Vad Google Reviews ger er

### ✅ Fördelar
- **Trovärdighet** - Riktiga kundrecensioner
- **SEO** - Bättre sökrankning
- **Social Proof** - Ökar förtroendet
- **Gratis** - Ingen kostnad för API:et (inom rimliga gränser)

### 📈 Features som implementerats
- ⭐ **Rating Overview** - Genomsnittlig rating och antal reviews
- 📝 **Review Cards** - Individuella recensioner med avatar och stjärnor
- 🔗 **Direct Links** - Länkar till Google för fler reviews
- 🇸🇪 **Svenska översättningar** - Automatisk översättning av tidsangivelser
- 💾 **Caching** - 1 timmes cache för prestanda
- 🔄 **Fallback** - Mock data om API misslyckas

## 💡 Best Practices

### 1. API-kvot Management
Google Places API har kvotbegränsningar:
- **100,000 requests/månad GRATIS**
- **$17 per 1000 requests** därefter

### 2. Optimera API-anrop
```typescript
// Automatisk caching implementerat
// Reviews cachas i 1 timme
// Minska onödiga API-anrop
```

### 3. Error Handling
```typescript
// Fallback till mock data om API misslyckas
// Användaren ser alltid innehåll
```

## 🚀 Utvecklings vs Produktion

### Utveckling (Mock Data)
```typescript
showMockData={true}  // Visar mock reviews
```

### Produktion (Riktiga Reviews)
```typescript
showMockData={false} // Hämtar från Google API
```

## 🛠️ Troubleshooting

### Problem: "API key saknas"
**Lösning:** Kontrollera `.env.local` och restart av servern

### Problem: "Inga reviews hittades"
**Lösning:** 
1. Kontrollera place_id är korrekt
2. Kontrollera att restaurangen finns på Google Maps
3. Kontrollera API-nyckel har rätt permissions

### Problem: "API quota exceeded"
**Lösning:**
1. Öka caching-tiden
2. Aktivera billing i Google Cloud Console
3. Optimera antal requests

## 📱 Mobile Responsiv

Reviews är fullt responsiva och fungerar på:
- 📱 **Mobile** - Staplade cards
- 💻 **Desktop** - Grid layout  
- 🖥️ **Tablet** - Anpassad layout

## 🎨 Design Integration

Reviews matchar era befintliga design:
- 🟡 **Gul accent color** (#e4d699)
- ⚫ **Svart bakgrund** med transparens
- ⭐ **Gula stjärnor** för rating
- 🎯 **Smooth animations** med Framer Motion

## 📈 Nästa Steg

1. **Sätt upp Google Cloud Console** (15 min)
2. **Hitta era place_ids** (10 min)
3. **Uppdatera konfiguration** (5 min)
4. **Testa live reviews** (2 min)
5. **Släpp till produktion** 🚀

## 🆘 Support

Om ni behöver hjälp:
1. Kontrollera denna guide
2. Titta på console för felmeddelanden
3. Testa med mock data först
4. Kontakta för support om problem kvarstår

---

**🎉 Lycka till med Google Reviews integration!** 

Era kunder kommer att älska att se riktiga recensioner direkt i location modals! 🌟 
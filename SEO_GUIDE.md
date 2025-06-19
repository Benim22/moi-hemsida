# SEO-Guide för Moi Sushi & Poké Bowl

## 🚀 Implementerade SEO-förbättringar

### 1. **Grundläggande Metadata** (`app/layout.tsx`)
- ✅ Omfattande title och description
- ✅ Keywords för lokala sökningar
- ✅ Open Graph metadata för sociala medier
- ✅ Twitter Cards
- ✅ Geo-tagging för lokala sökningar
- ✅ Strukturerad data (JSON-LD) för Restaurant, Website och LocalBusiness

### 2. **Sidspecifik Metadata**
Varje viktig sida har nu sin egen layout med optimerad metadata:

- ✅ **Meny** (`app/menu/layout.tsx`) - Menu schema, produktinformation
- ✅ **Beställningar** (`app/order/layout.tsx`) - OrderAction schema
- ✅ **Bokningar** (`app/booking/layout.tsx`) - ReservationAction schema
- ✅ **Platser** (`app/locations/layout.tsx`) - Organization schema med flera platser
- ✅ **Kontakt** (`app/contact/layout.tsx`) - ContactPage schema
- ✅ **Om Oss** (`app/about/layout.tsx`) - AboutPage schema

### 3. **Teknisk SEO**
- ✅ **Sitemap** (`app/sitemap.ts`) - Automatisk XML sitemap
- ✅ **Robots.txt** (`app/robots.ts`) - Sökmotor-riktlinjer
- ✅ **Strukturerad data** - Rich snippets för Google
- ✅ **FAQ-schema** på startsidan
- ✅ **Breadcrumbs** strukturerad data

## 📍 Lokala SEO-optimeringar

### Viktiga lokala sökord som implementerats:
- "sushi Trelleborg", "sushi Malmö", "sushi Ystad"
- "poké bowl [stad]", "japansk mat [stad]"
- "sushi leverans", "sushi beställning online"
- "bästa sushi Skåne", "sushi nära mig"

### Geo-tagging:
- GPS-koordinater för Trelleborg: `55.3753, 13.1569`
- Adressinformation för alla platser
- Öppettider strukturerade enligt schema.org

## 🔧 Vad du behöver uppdatera

### 1. **Google Search Console**
```html
<!-- I app/layout.tsx, rad ~140 -->
<meta name="google-site-verification" content="your-google-verification-code" />
```
**Steg:**
1. Gå till [Google Search Console](https://search.google.com/search-console)
2. Lägg till din webbplats
3. Verifiera med HTML-taggen
4. Ersätt `your-google-verification-code` med din kod

### 2. **Kontaktuppgifter**
Uppdatera dessa i alla filer där de förekommer:
```javascript
"telephone": "+46 123 456 789", // Ersätt med riktigt nummer
"email": "info@moi-sushi.se",  // Ersätt med riktig e-post
```

### 3. **Sociala medier**
```javascript
"sameAs": [
  "https://www.instagram.com/moisushi", // Uppdatera med rätt Instagram
  "https://www.facebook.com/moisushi"   // Uppdatera med rätt Facebook
],
"creator": "@moisushi", // Twitter handle
```

### 4. **Domännamn**
Ersätt `https://moi-sushi.se` med din riktiga domän i alla filer.

### 5. **Bilder för sociala medier**
Se till att dessa bilder finns och är optimerade (1200x630px):
- `/moi-exterior.jpg`
- `/moi-interior.jpg`
- `/placeholder-logo.png`

## 📊 Mätning och uppföljning

### Google Analytics 4
Lägg till i `app/layout.tsx`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Viktiga KPI:er att följa:
- Organisk trafik från Google
- Lokala sökningar (Google My Business)
- Klickfrekvens (CTR) i sökresultat
- Konverteringar (beställningar/bokningar)

## 🎯 Fortsatt SEO-arbete

### 1. **Innehållsmarknadsföring**
- Skapa blogginlägg om sushi, japansk mat, lokala evenemang
- Säsongsmenyer och specialerbjudanden
- Kundinlägg och recensioner

### 2. **Lokala SEO**
- Google My Business-optimering
- Lokala kataloglistningar
- Kundrecensioner och betyg

### 3. **Teknisk optimering**
- Bildoptimering (WebP-format redan implementerat)
- Laddningstider
- Core Web Vitals
- Mobiloptimering

### 4. **Schema.org uppdateringar**
- Lägg till fler menyobjekt i Menu schema
- Uppdatera öppettider säsongsmässigt
- Lägg till events och specialerbjudanden

## 🔍 SEO-verktyg att använda

1. **Google Search Console** - Prestanda och indexering
2. **Google Analytics** - Trafik och användardata
3. **Google My Business** - Lokal närvaro
4. **Schema Markup Validator** - Testa strukturerad data
5. **PageSpeed Insights** - Laddningstider

## ⚠️ Viktiga påminnelser

- Uppdatera sitemap när nya sidor läggs till
- Håll strukturerad data uppdaterad med riktiga värden
- Testa alla metadata-ändringar med Facebook Debugger och Twitter Card Validator
- Övervaka Google Search Console för fel och varningar

---

**Skapad:** 2024
**Senast uppdaterad:** Vid implementering
**Nästa granskning:** Månadsvis 
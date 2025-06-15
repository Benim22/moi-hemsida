# 🍣 Moi Sushi & Poké Bowl - Utvecklingsreferens

## 📋 Projektöversikt

### 🎯 Huvudmål
Modern restaurangwebbplats för Moi Sushi & Poké Bowl med tre platser: Malmö, Trelleborg och Ystad.

### 🏢 Platsspecialiseringar
- **Malmö & Trelleborg**: Fullständig meny (alla kategorier)
- **Ystad**: Endast Poké Bowls

## 🗂️ Komplett Sidstruktur

### 📄 Publika Sidor
```
/ - Startsida med hero, specialiteter, populära rätter
/malmo - Malmö-specifik sida med fullständig meny
/trelleborg - Trelleborg-specifik sida med fullständig meny  
/ystad - Ystad-specifik sida med endast poké bowls
/menu - Huvudmeny med alla rätter och filtrering
/book - Bokningssystem med kalender
/about - Om oss information
/contact - Kontaktinformation och formulär
/cart - Varukorg och checkout
/checkout - Beställningsprocess
/login - Inloggning för kunder och admin
/register - Registrering för nya kunder
/profile - Användarprofil med orderhistorik
/order-history - Detaljerad orderhistorik
/delivery - Leveransinformation
/terms - Villkor
/privacy - Integritetspolicy
```

### 🔐 Admin Sidor
```
/admin - Dashboard med översikt och statistik
/admin/menu - Menyhantering (CRUD)
/admin/orders - Orderhantering och status
/admin/bookings - Bokningshantering  
/admin/users - Användarhantering
/admin/locations - Platshantering
/admin/analytics - Detaljerad statistik
/admin/settings - Applikationsinställningar
```

## 🍱 Komplett Menystruktur

### 📋 Huvudkategorier
1. **Mois Rolls** - Kreativa Rullar (11 rätter)
2. **Helfriterade Maki** - Friterade rullar (3 rätter)  
3. **Pokebowls** - Färgsprakande bowls (10 rätter)
4. **Nigiri Combo** - Nigiri fusion (10 kombinationer)
5. **Exotiska Delikatesser** - Specialrätter (3 rätter)
6. **Barnmenyer** - Barnvänliga alternativ (2 rätter)
7. **Smått & Gott** - Förrätter och tillbehör (9 rätter)
8. **Nigiri i Par** - Enskilda nigiri (9 typer)
9. **Såser** - Tillbehörssåser (2 typer)
10. **Drycker** - Läskedrycker (11 typer)

### 🏪 Platsspecifik Meny
- **Malmö & Trelleborg**: Alla kategorier (78+ rätter totalt)
- **Ystad**: Endast kategori 3 - Pokebowls (10 rätter)

## 🖼️ Bildmappning (Menu Images)

### 📁 Tillgängliga Bilder
```
/public/menu-images/
├── california roll.jpg
├── salmon roll → använd "1 par lax.jpg"  
├── shrimp roll.jpg
├── veggo bowl.jpg
├── vegan roll.jpg
├── vegan bowl.jpg
├── crazy salmon.png
├── magic shrimp.jpg
├── magic shrimp2.png
├── avokai.jpg
├── magic tempura.jpg
├── rainbow roll.jpg
├── rainbow roll2.jpg
├── helfriterad salmon.jpg
├── helfriterad chicken.png
├── beef helfriterad maki.jpg
├── spicy beef.jpg
├── crispy chicken.png
├── crispy chicken2.png
├── lemon shrimp.jpg
├── magic lax.jpg
├── shrimp bowl.jpg
├── nigiri mix 8.jpg
├── sashimi lax.jpg
├── 8 risbollar natruella.jpg
├── wakame sallad → använd "gyoza och wakame sallad.jpg"
├── edamame bönor.jpg
├── gyoza och wakame sallad.jpg
├── shrimptempura.jpg
├── miso soppa.jpg
├── 1 par tofu.png
├── 1 par tamago.png
├── 1 par gurka.png
├── 1 par surumi.jpg
├── 1 par lax.jpg
├── 1 par räka.jpg
├── 1 par avokado.png
├── 1 par lax flamberad.jpg
└── diverse fallback bilder
```

## 🎨 Design System

### 🎨 Färgschema
```css
--gold: #dcc991;
--gold-dark: #D4AF37;
--light-bg: #fff;
--dark-bg: #000;
--light-card: #f5f5f5;
--dark-card: #0A0A0A;
--success: #4CAF50;
--error-light: #FF3B30;
--error-dark: #FF453A;
```

### 📐 Komponenter
- **Logo**: logo-transparent.png (använd överallt)
- **HeroSection**: 600px hög med video/bild
- **MenuCard**: Mörk design med favoritikon
- **SpecialtyCard**: 200px hög med gradient
- **Navigation**: Sticky med dropdown
- **Footer**: Komplett kontaktinfo

## 🛠️ Teknisk Stack

### 🔧 Frontend
- Next.js 14 (App Router)
- React 19
- TypeScript
- TailwindCSS + shadcn/ui
- Zustand (state management)
- Framer Motion (animationer)
- Lucide Icons

### 🗄️ Backend & Database
- Supabase (PostgreSQL)
- Supabase Auth
- Row Level Security
- Real-time subscriptions

### 📱 Funktioner
- Responsiv design
- Tema toggle (ljus/mörk)
- PWA support
- Push notifikationer
- Image optimization

## 🗃️ Databasschema

### 📊 Huvudtabeller
```sql
-- Platser
locations (id, name, slug, address, phone, hours, coordinates)

-- Menyobjekt  
menu_items (id, name, description, price, image, category, popular, ingredients, allergens, nutritional_info, spicy_level, location_available)

-- Användare
users (id, email, name, phone, address, role, avatar_url)

-- Beställningar
orders (id, user_id, items, total, status, location, order_type, delivery_address, customer_info)

-- Bokningar
bookings (id, user_id, location, date, time, guests, status, customer_info)

-- Favoriter
favorites (id, user_id, menu_item_id)

-- Notifikationer  
notifications (id, user_id, title, message, type, read)
```

## 🔐 Autentisering & Roller

### 👥 Användarroller
- **customer**: Vanliga kunder
- **admin**: Restaurangägare/personal

### 🛡️ Behörigheter
- **Kunder**: Beställa, boka, favoritmarkera, se orderhistorik
- **Admin**: Allt ovan + hantera meny, se statistik, hantera bokningar

## 📊 Admin Dashboard Funktioner

### 📈 Statistik & Analytics
- Daglig/veckovis/månadsvis försäljning
- Populäraste rätter per plats
- Bokningsstatistik  
- Användarregistreringar
- Orderstatusöversikt

### ⚙️ Hanteringsverktyg
- **Menyhantering**: CRUD för rätter, kategorier, priser
- **Orderhantering**: Statusuppdateringar, orderhistorik
- **Bokningshantering**: Bekräfta/avboka, tidsslots
- **Användarhantering**: Se kunder, roller
- **Innehållshantering**: Uppdatera texter, bilder

## 🚀 Utvecklingssteg

### Fas 1: Grundstruktur ✅
- [x] Projektsetup
- [x] Design system  
- [x] Grundläggande komponenter
- [x] Navigation & Footer
- [x] Startsida

### Fas 2: Platssidor & Meny
- [ ] Skapa platssidor (Malmö, Trelleborg, Ystad)
- [ ] Implementera komplett meny från textfilen
- [ ] Mappa bilder till maträtter
- [ ] Menyfiltrering och sök
- [ ] Varukorg och checkout

### Fas 3: Bokning & Auth
- [ ] Bokningssystem med kalender
- [ ] Autentisering (kunder + admin)
- [ ] Användarprofiler
- [ ] Registrering

### Fas 4: Admin Dashboard  
- [ ] Admin layout och navigation
- [ ] Statistik dashboard
- [ ] Menyhantering (CRUD)
- [ ] Order- och bokningshantering
- [ ] Användarhantering

### Fas 5: Avancerade Funktioner
- [ ] Betalningsintegration
- [ ] Push notifikationer  
- [ ] PWA funktionalitet
- [ ] SEO optimering
- [ ] Performance optimering

## 📝 Viktiga Anteckningar

### 🎯 Specialiseringar
- Ystad serverar ENDAST poké bowls
- Malmö & Trelleborg har fullständig meny
- Alla platser kan ta emot bokningar

### 🖼️ Bildhantering
- Använd befintliga bilder från /menu-images
- Fallback till placeholder för saknade bilder
- Optimera bilder för web
- Responsive images för olika skärmstorlekar

### 🔄 State Management
- **menu-store**: Menydata och filtrering
- **cart-store**: Varukorg och checkout
- **user-store**: Auth och profil
- **booking-store**: Bokningshantering  
- **admin-store**: Admin funktioner

### 📱 Responsivitet
- Mobile-first design
- Tablet optimering
- Desktop enhancement
- Touch-friendly navigation

## 🆘 Troubleshooting

### 🐛 Vanliga Problem
- **Bildpaths**: Kontrollera /public/menu-images/
- **State sync**: Använd Zustand persist
- **Auth flow**: Supabase RLS konfiguration
- **Mobile nav**: Z-index och overflow

### 🔧 Debugging Tools
- React Developer Tools
- Zustand DevTools  
- Supabase Dashboard
- Network Inspector för API calls

---

**Senast uppdaterad**: 2025-06-11
**Version**: 1.0
**Status**: Under utveckling 
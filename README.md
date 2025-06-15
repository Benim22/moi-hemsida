# 🍣 Moi Sushi & Poké Bowl - Modern Restaurangwebbplats

En elegant och responsiv webbplats för "Moi Sushi & Poké Bowl" byggd med Next.js 14 och moderna webbteknologier.

## ✨ Funktioner

### 🎯 Grundläggande Funktioner
- **Hero Section** med video/bild bakgrund och CTA-knappar
- **Responsiv Design** för mobil, surfplatta och desktop
- **Dynamisk Navigation** med dropdown-menyer och sticky header
- **Tema-stöd** (ljust/mörkt läge)
- **Platsbaserade Sidor** för Malmö, Trelleborg och Ystad

### 🍱 Meny & Beställning
- **Interaktiv Meny** med kategorier och filtrering
- **Produktkort** med bilder, priser och ingredienser
- **Varukorg** med kvantitetshantering
- **Favoritfunktion** för sparade rätter
- **Beställningsflöde** för leverans och avhämtning

### 📅 Bokning & Användare
- **Bokningssystem** med kalender och tidslots
- **Användarautentisering** via Supabase
- **Användarprofiler** med orderhistorik
- **Responsiv Design** med animationer

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React 19, TypeScript
- **Styling:** TailwindCSS, shadcn/ui komponenter
- **State Management:** Zustand med persist
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Animationer:** Framer Motion
- **Ikoner:** Lucide React
- **Tema:** next-themes

## 🎨 Design System

### Färgpalett
- **Guld:** `#dcc991` (ljust), `#D4AF37` (mörkt)
- **Bakgrund:** `#fff` (ljust), `#000` (mörkt)
- **Kort:** `#f5f5f5` (ljust), `#0A0A0A` (mörkt)
- **Framgång:** `#4CAF50`
- **Fel:** `#FF3B30` (ljust), `#FF453A` (mörkt)

### Spacing
- **XS:** 4px
- **SM:** 8px
- **MD:** 16px
- **LG:** 24px
- **XL:** 32px

## 🚀 Kom igång

### Förutsättningar
- Node.js 18+ 
- npm eller yarn

### Installation

1. **Klona projektet**
```bash
git clone [repo-url]
cd moi-hemsida
```

2. **Installera dependencies**
```bash
npm install
```

3. **Konfigurera miljövariabler**
```bash
cp .env.example .env.local
```

Fyll i dina Supabase-uppgifter:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Starta utvecklingsserver**
```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router sidor
│   ├── (locations)/       # Platsspecifika sidor
│   ├── globals.css        # Globala CSS-stilar
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Startsida
├── components/            # React komponenter
│   ├── layout/           # Layout komponenter
│   ├── menu/             # Meny komponenter
│   ├── booking/          # Boknings komponenter
│   ├── auth/             # Auth komponenter
│   └── ui/               # shadcn/ui komponenter
├── stores/               # Zustand stores
│   ├── cart-store.ts     # Varukorg hantering
│   ├── menu-store.ts     # Meny data
│   ├── favorite-store.ts # Favoriter
│   └── user-store.ts     # Användardata
├── types/                # TypeScript typer
│   └── index.ts          # Alla interface definitioner
├── hooks/                # Custom React hooks
└── lib/                  # Utilities och konfiguration
```

## 🎨 Komponenter

### Layout Komponenter
- **HeroSection** - Hero med video/bild bakgrund
- **Navigation** - Responsiv navbar med dropdown
- **Footer** - Footer med kontaktinfo och länkar
- **SpecialtyCard** - Kort för specialiteter

### Meny Komponenter
- **MenuCard** - Produktkort med bild och info
- **MenuFilter** - Filtrering och sök
- **CartItem** - Varukorg rad

### Boknings Komponenter
- **BookingModal** - Bokningsformulär
- **Calendar** - Datumväljare
- **TimeSlots** - Tidsintervall

## 🗄️ Datamodeller

### MenuItem
```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular?: boolean;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  spicyLevel?: number;
  location?: 'malmo' | 'trelleborg' | 'ystad' | 'all';
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
}
```

### Booking
```typescript
interface Booking {
  id: string;
  user_id: string;
  location: 'malmo' | 'trelleborg' | 'ystad';
  date: string;
  time: string;
  guests: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}
```

## 🔧 Utveckling

### Lägg till nya komponenter
```bash
npx shadcn@latest add [component-name]
```

### Kör linting
```bash
npm run lint
```

### Kör TypeScript check
```bash
npm run type-check
```

### Bygg för produktion
```bash
npm run build
```

## 📱 Responsivitet

Webbplatsen är optimerad för:
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px  
- **Desktop:** 1024px+

### Breakpoints (TailwindCSS)
- `sm:` 640px
- `md:` 768px
- `lg:` 1024px
- `xl:` 1280px
- `2xl:` 1536px

## 🎭 Animationer

Använder Framer Motion för:
- **Fade-in** animationer på scroll
- **Hover effects** på kort och knappar
- **Modal** slide-in/out
- **Loading** states
- **Page transitions**

## 🌙 Tema Support

- Automatisk systemtema detektion
- Manual toggle ljust/mörkt läge
- Konsistent färgpalette
- Smooth transitions mellan teman

## 📝 TODO

### Nästa steg i utvecklingen:
- [ ] Supabase databas setup
- [ ] Autentisering implementation  
- [ ] Bokningssystem backend
- [ ] Beställningsflöde
- [ ] Betalningsintegration
- [ ] Admin panel för meny hantering
- [ ] Push notifikationer
- [ ] SEO optimering
- [ ] Performance optimering
- [ ] Tester (Jest/Cypress)

## 🤝 Bidrag

1. Fork projektet
2. Skapa en feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit dina ändringar (`git commit -m 'Add some AmazingFeature'`)
4. Push till branchen (`git push origin feature/AmazingFeature`)
5. Öppna en Pull Request

## 📄 Licens

Detta projekt är licensierat under MIT License - se [LICENSE](LICENSE) filen för detaljer.

## 📞 Kontakt

**Moi Sushi & Poké Bowl**
- Email: info@moisushi.se
- Malmö: 040-123 45 67
- Trelleborg: 0410-123 45 67  
- Ystad: 0411-123 45 67

---

*Byggd med ❤️ och modern webbutveckling*

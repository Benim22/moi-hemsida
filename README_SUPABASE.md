# Moi Sushi - Supabase Implementering

Denna applikation använder nu Supabase som backend-databas istället för hårdkodad data. Här är instruktioner för att konfigurera och köra applikationen.

## Förutsättningar

- Node.js 18+ 
- Ett Supabase-konto och projekt
- Git

## Installation

1. Klona projektet:
```bash
git clone <repository-url>
cd moi-sushi
```

2. Installera dependencies:
```bash
npm install
```

3. Konfigurera environment variables:
Skapa en `.env.local` fil i projektets rot:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Databasuppsättning

1. Logga in på [Supabase Dashboard](https://supabase.com/dashboard)

2. Skapa databasschemat:
   - Gå till SQL Editor
   - Kör innehållet från `clean_database_schema.sql` för att skapa tabeller och funktioner

3. Fyll databasen med testdata:
   - Kör innehållet från `populate_database.sql` för att lägga till menyobjekt och testdata

## Nya Features

### 🎯 Analytics & Tracking
- Real-time besökarspårning
- Menyobjekt-visningar och interaktioner  
- Försäljningsanalys och rapporter
- Användaraktivitetsspårning

### 👤 Användarhantering
- Supabase Auth integration
- Användarregistrering och inloggning
- Profilhantering
- Favoriter synkroniserade mellan enheter

### 🛒 Förbättrad Cart
- Sparas i Supabase när användaren är inloggad
- Automatisk synkronisering mellan enheter
- Order tracking och historik

### 📊 Admin Dashboard
- Försäljningsstatistik per plats
- Beställnings- och bokningshantering
- Customer analytics
- Real-time metrics

### 🎲 Bokningssystem
- Real-time tillgänglighetskontroll
- Automatisk bokningsbekräftelse
- Email-notifikationer
- Konflikthantering

## Nya Stores

Applikationen använder nu följande Zustand stores som integrerar med Supabase:

- `useUserStore` - Användarautentisering och profiler
- `useMenuStore` - Menydata från Supabase  
- `useCartStore` - Varukorg med Supabase-integration
- `useFavoriteStore` - Favoriter synkroniserade med Supabase
- `useBookingStore` - Bokningshantering
- `useAnalyticsStore` - Analytics och tracking

## API Integration

### Supabase API Layer (`src/lib/supabase.ts`)

Komplett API-lager som hanterar:
- Authentication (signIn, signUp, signOut)
- Menu operations (getAll, search, filter)
- Order management (create, track, update)
- Booking system (create, availability, manage)
- Analytics tracking
- User management

### Error Handling

- Automatisk error handling i alla API-anrop
- Toast notifications för använderfeedback
- Graceful fallbacks vid nätverksproblem

## Säkerhet

### Row Level Security (RLS)
Alla tabeller har RLS policies som säkerställer:
- Användare kan bara se sina egna orders och bokningar
- Admins har full access till alla data
- Gäster kan se offentlig data (meny, etc.)

### Auth Integration
- JWT-baserad autentisering via Supabase
- Automatisk session management
- Säker lösenordshantering

## Utveckling

Starta utvecklingsservern:
```bash
npm run dev
```

### Utvecklarverktyg

1. **Supabase Dashboard** - Hantera data, användare och analyser
2. **Next.js Dev Tools** - React och Next.js debugging
3. **Zustand DevTools** - State management debugging

### Testing

Testanvändare finns skapade i databasen:
- **Vanlig användare**: `test@moisushi.se` (lösenord: `test123`)
- **Admin**: `admin@moisushi.se` (lösenord: `admin123`)

## Deployment

1. Konfigurera production environment variables
2. Deploy till din föredragna plattform (Vercel, Netlify, etc.)
3. Konfigurera Supabase för production

## Framtida Utveckling

### Planerade Features
- [ ] Push notifications
- [ ] Lojalitetsprogram med poäng
- [ ] AI-rekommendationer baserat på orderhistorik
- [ ] Multi-språkstöd
- [ ] Offline-stöd med sync
- [ ] Advanced analytics med ML insights

### Teknisk Skuld
- [ ] Förbättra TypeScript strict mode
- [ ] Implementera end-to-end tests
- [ ] Performance optimering med React Query
- [ ] Komponenterna bör migreras till Server Components där möjligt

## Support

För support och frågor, kontakta utvecklingsteamet eller skapa en issue i repository.

## Licens

Privat projekt - Alla rättigheter förbehållna Moi Sushi & Poké Bowl. 
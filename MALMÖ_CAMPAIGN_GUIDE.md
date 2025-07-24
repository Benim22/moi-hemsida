# Malmö Kampanjbanner - Implementationsguide

## 🎯 Kampanjöversikt
**Kampanj**: 15% rabatt på alla beställningar från nya Malmö-restaurangen
**Rabatt**: Avdras automatiskt i kassan för Malmö-beställningar
**Design**: Minimalistisk grön gradient med animerade element

## 📍 Nuvarande Placeringar

### 1. **Huvudsida (app/page.tsx)** ⭐⭐⭐⭐⭐
- **Placering**: Direkt under hero-sektionen
- **Variant**: `hero`
- **Synlighet**: Mycket hög - första intryck
- **Sticky version**: Visas efter 500px scroll (om användaren inte redan sett kampanjen)

### 2. **LocationSelector Modal** ⭐⭐⭐⭐⭐
- **Placering**: Överst i modal när användare väljer plats
- **Variant**: `modal`
- **Synlighet**: Mycket hög - aktivt val av plats
- **Fördel**: Fångar användare precis när de ska välja restaurang

### 3. **Beställningssida (app/order/page.tsx)** ⭐⭐⭐⭐
- **Placering**: I location selector-sektionen
- **Variant**: `order`
- **Synlighet**: Hög - när användare ska beställa
- **Fördel**: Direkt koppling till beställningsprocessen

### 4. **Menysida (app/menu/page.tsx)** ⭐⭐⭐
- **Placering**: Efter header, före kategorier
- **Variant**: `order`
- **Synlighet**: Medium-hög - när användare kollar meny
- **Fördel**: Inspirerar till beställning efter att ha sett maten

## 🎨 Banner-varianter

### `hero` - Huvudsida
- Stor, prominent banner
- Fokus på välkomstmeddelande
- Animerade element för uppmärksamhet

### `sticky` - Flytande banner
- Visas efter scroll
- Kompakt design
- Följer med när användare scrollar

### `modal` - I LocationSelector
- Anpassad för modal-miljö
- Integrerad design med befintlig UI
- Fokus på platsval

### `order` - Beställnings- och menysidor
- Balanserad storlek
- Tydlig call-to-action
- Professionell presentation

## 🧠 Smart Funktionalitet

### Automatisk Dölning
- Bannern visas INTE om användaren redan valt Malmö som plats
- Markeras som "sedd" när användaren:
  - Stänger bannern manuellt
  - Väljer Malmö som plats

### LocalStorage Integration
- Sparar om användaren sett kampanjen
- Förhindrar spam av samma banner
- Kan återställas för testning

## 📊 Rekommenderade Ytterligare Placeringar

### 1. **Checkout-sida** ⭐⭐⭐⭐⭐
```tsx
// I shopping-cart.tsx checkout-vyn
<MalmoCampaignBanner variant="order" />
```
**Varför**: Sista chansen att påverka platsval innan beställning

### 2. **Navigation Header** ⭐⭐⭐
```tsx
// Som notification bar i navigation.tsx
<MalmoCampaignBanner variant="sticky" />
```
**Varför**: Alltid synlig, påminner konstant

### 3. **Footer Call-to-Action** ⭐⭐
```tsx
// I Footer.tsx
<MalmoCampaignBanner variant="hero" />
```
**Varför**: Fångar användare som scrollat ner

### 4. **Profil/Dashboard** ⭐⭐⭐
```tsx
// I profile/page.tsx
<MalmoCampaignBanner variant="order" />
```
**Varför**: Påminner återkommande kunder

## 🎯 Konverteringsoptimering

### A/B Test Möjligheter
1. **Färgschema**: Testa grönt vs. gult vs. rött
2. **Placering**: Testa olika positioner på samma sida
3. **Text**: Testa olika meddelanden och call-to-actions
4. **Timing**: Testa när sticky banner ska visas

### Tracking
```typescript
// Lägg till i komponenten för att spåra konverteringar
trackEvent('campaign_interaction', 'malmo_banner_click', {
  variant: variant,
  location: window.location.pathname,
  selected_location: selectedLocation?.id
})
```

## 🔧 Teknisk Implementation

### Komponentstruktur
```
components/
├── malmo-campaign-banner.tsx    # Huvudkomponent
└── hooks/
    └── use-malmo-campaign.ts    # State management hook
```

### Props Interface
```typescript
interface MalmoCampaignBannerProps {
  variant?: 'hero' | 'sticky' | 'modal' | 'order'
  onClose?: () => void
  className?: string
}
```

### Styling System
- **Responsiv design**: Mobile-first approach
- **Animationer**: Framer Motion för smooth transitions
- **Färgschema**: Grön gradient för "nyhet" känsla
- **Typografi**: Tydliga badges och call-to-actions

## 📱 Mobile Optimering

### Responsiva Anpassningar
- Mindre text på mobil
- Staplade element istället för horisontella
- Touch-vänliga knappar (minst 44px)
- Optimerad för thumb navigation

### Performance
- Lazy loading av animationer
- Minimal bundle size impact
- Effektiv re-rendering med React.memo

## 🚀 Framtida Förbättringar

### Dynamisk Content
- Hämta kampanjtext från CMS/databas
- A/B testa olika meddelanden
- Personaliserade erbjudanden baserat på användarhistorik

### Geolocation
- Visa kampanjen mer för användare nära Malmö
- Anpassa meddelandet baserat på användarens position

### Time-based Logic
- Visa kampanjen mer under lunchtid/middag
- Schemalagda kampanjperioder
- Urgency messaging ("Endast idag!")

## 🎨 Design Guidelines

### Visuell Hierarki
1. **Badges** - Drar uppmärksamhet först
2. **Headline** - Tydligt meddelande
3. **Description** - Förklarande text
4. **CTA Button** - Handlingsuppmaning

### Färgpsykologi
- **Grönt**: Associeras med "nytt", "fräscht", "go"
- **Gul accent**: Drar uppmärksamhet till rabatt
- **Vit text**: Kontrast och läsbarhet
- **Animationer**: Subtila, inte störande

## 📈 Success Metrics

### KPIs att följa
- **Click-through rate** på kampanjbanner
- **Conversion rate** Malmö vs. andra platser
- **Bounce rate** på sidor med banner
- **Order value** från Malmö-beställningar
- **Return visitors** som väljer Malmö

### Analytics Implementation
```typescript
// Spåra banner-interaktioner
trackEvent('malmo_campaign', 'banner_view', { variant, page })
trackEvent('malmo_campaign', 'banner_click', { variant, page })
trackEvent('malmo_campaign', 'malmo_selected', { source: 'campaign_banner' })
``` 
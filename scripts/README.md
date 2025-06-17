# 🍣 Moi Sushi Scripts

## Uppdatera menybilder automatiskt

Detta script kopplar automatiskt bilder från `/public/Meny-bilder/` till menyrätter i databasen.

### 🚀 Snabbstart

1. **Installera beroenden:**
   ```bash
   cd scripts
   npm install
   ```

2. **Konfigurera miljövariabler:**
   Kopiera `.env` från huvudprojektet eller skapa en `.env` fil med:
   ```
   NEXT_PUBLIC_SUPABASE_URL=din_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=din_service_role_key
   ```

3. **Kör scriptet:**
   ```bash
   npm run update-images
   ```

### 🎯 Vad gör scriptet?

- Hämtar alla menyrätter från `menu_items` tabellen
- Jämför rättnamn med bildfilnamn intelligent
- Uppdaterar `image_url` kolumnen med matchande bilder
- Använder `/Meny-bilder/filnamn.jpg` format (fungerar med Next.js public folder)

### 📋 Bildmappningar

Scriptet innehåller smarta mappningar för:
- **Nigiri:** `1 par lax.jpg` → "lax nigiri"
- **Maki & Rolls:** `california roll.jpg` → "california roll"
- **Friterade:** `crispy chicken.png` → "crispy chicken"
- **Magic-serien:** `magic lax.jpg` → "magic lax"
- **Bowls:** `shrimp bowl.jpg` → "shrimp bowl"
- **Tillbehör:** `edamame bönor.jpg` → "edamame"

### ⚠️ Viktigt

- Scriptet uppdaterar bara rätter som **inte** redan har en bild
- Kräver minst 50% likhet mellan rättnamn och bildnamn
- Använder service role key för att kunna uppdatera databasen

### 🔧 Anpassa mappningar

Redigera `imageMapping` objektet i `update-menu-images.js` för att lägga till fler kopplingar. 
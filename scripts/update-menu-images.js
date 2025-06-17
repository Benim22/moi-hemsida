const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Fallback till anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// Bildmappningar - kopplar filnamn till potentiella rättnamn
const imageMapping = {
  // Nigiri
  '1 par avokado.png': ['avokado nigiri', 'avocado nigiri'],
  '1 par gurka.png': ['gurka nigiri', 'cucumber nigiri'],
  '1 par lax.jpg': ['lax nigiri', 'salmon nigiri'],
  '1 par lax flamberad.jpg': ['flamberad lax nigiri', 'flamberad salmon nigiri'],
  '1 par räka.jpg': ['räka nigiri', 'shrimp nigiri'],
  '1 par surumi.jpg': ['surimi nigiri', 'surumi nigiri'],
  '1 par tamago.png': ['tamago nigiri'],
  '1 par tofu.png': ['tofu nigiri'],
  
  // Maki & Rolls
  'california roll.jpg': ['california roll', 'california maki'],
  'rainbow roll.jpg': ['rainbow roll'],
  'rainbow roll2.jpg': ['rainbow roll'],
  'vegan roll.jpg': ['vegan roll', 'vegetarian roll'],
  'shrimp roll.jpg': ['shrimp roll', 'räk roll'],
  'green maki.png': ['green maki', 'vegetarian maki'],
  'beef helfriterad maki.jpg': ['beef maki', 'friterad beef maki'],
  
  // Friterade
  'helfriterad chicken.png': ['friterad kyckling', 'crispy chicken'],
  'helfriterad salmon.jpg': ['friterad lax', 'crispy salmon'],
  'crispy chicken.png': ['crispy chicken', 'friterad kyckling'],
  'crispy chicken2.png': ['crispy chicken', 'friterad kyckling'],
  'crispy kid.png': ['crispy kid'],
  'shrimptempura.jpg': ['tempura räka', 'shrimp tempura'],
  
  // Magic serien
  'magic avokado.jpg': ['magic avokado', 'magic avocado'],
  'magic lax.jpg': ['magic lax', 'magic salmon'],
  'magic shrimp.jpg': ['magic shrimp', 'magic räka'],
  'magic shrimp2.png': ['magic shrimp', 'magic räka'],
  'magic tempura.jpg': ['magic tempura'],
  'magic tempura random.jpg': ['magic tempura'],
  
  // Bowls
  'shrimp bowl.jpg': ['shrimp bowl', 'räk bowl'],
  'vegan bowl.jpg': ['vegan bowl'],
  'veggo bowl.jpg': ['vegetarian bowl', 'veggo bowl'],
  
  // Crazy serien
  'crazy salmon.png': ['crazy salmon', 'crazy lax'],
  
  // Sashimi & Mix
  'sashimi lax.jpg': ['sashimi lax', 'salmon sashimi'],
  'nigiri mix 8.jpg': ['nigiri mix', 'mixed nigiri', '8 nigiri'],
  
  // Tillbehör
  'edamame bönor.jpg': ['edamame', 'edamame bönor'],
  'miso soppa.jpg': ['miso soppa', 'miso soup'],
  'gyoza och wakame sallad.jpg': ['gyoza', 'wakame sallad'],
  '8 risbollar natruella .jpg': ['risbollar', 'rice balls'],
  
  // Special
  'spicy beef.jpg': ['spicy beef', 'kryddig beef'],
  'lemon shrimp.jpg': ['lemon shrimp', 'citron räka'],
  'avokai.jpg': ['avokai'],
  
  // Drycker
  'coca-cola.jpg': ['coca cola', 'coke'],
  'coca-cola-zero.png': ['coca cola zero', 'coke zero'],
  
  // Fallback för okända
  'random.jpg': ['special roll', 'chef special'],
  'random1.jpg': ['special maki', 'house special']
};

async function updateMenuImages() {
  try {
    console.log('🔍 Hämtar alla menyrätter från databasen...');
    
    // Hämta alla menyrätter
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('id, name, image_url');
    
    if (error) {
      console.error('❌ Fel vid hämtning av menyrätter:', error);
      return;
    }
    
    console.log(`📋 Hittade ${menuItems.length} menyrätter`);
    
    let updatedCount = 0;
    
    // Gå igenom varje menyrätt
    for (const item of menuItems) {
      let bestMatch = null;
      let bestScore = 0;
      
      // Hitta bästa bildmatch
      for (const [filename, searchTerms] of Object.entries(imageMapping)) {
        for (const term of searchTerms) {
          const score = calculateSimilarity(item.name.toLowerCase(), term.toLowerCase());
          if (score > bestScore && score > 0.5) { // Minst 50% likhet
            bestScore = score;
            bestMatch = filename;
          }
        }
      }
      
      // Uppdatera om vi hittade en bra match
      if (bestMatch && !item.image_url) {
        const imageUrl = `/Meny-bilder/${bestMatch}`;
        
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({ image_url: imageUrl })
          .eq('id', item.id);
        
        if (updateError) {
          console.error(`❌ Fel vid uppdatering av ${item.name}:`, updateError);
        } else {
          console.log(`✅ Uppdaterade "${item.name}" -> ${imageUrl}`);
          updatedCount++;
        }
      } else if (bestMatch) {
        console.log(`⚠️  "${item.name}" har redan en bild: ${item.image_url}`);
      } else {
        console.log(`❓ Ingen bild hittades för "${item.name}"`);
      }
    }
    
    console.log(`\n🎉 Klart! Uppdaterade ${updatedCount} menyrätter med bilder.`);
    
  } catch (error) {
    console.error('💥 Oväntat fel:', error);
  }
}

// Enkel likhetsalgoritm
function calculateSimilarity(str1, str2) {
  // Exakt match
  if (str1 === str2) return 1;
  
  // Innehåller
  if (str1.includes(str2) || str2.includes(str1)) return 0.8;
  
  // Ord-baserad likhet
  const words1 = str1.split(' ');
  const words2 = str2.split(' ');
  
  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}

// Kör scriptet
if (require.main === module) {
  updateMenuImages();
}

module.exports = { updateMenuImages, imageMapping }; 
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const IMAGES_DIR = '../public/Meny-bilder';

async function fixImageIssues() {
  try {
    console.log('🔍 Diagnostiserar bildproblem...\n');
    
    // 1. Hämta alla tillgängliga bilder
    const availableImages = fs.readdirSync(IMAGES_DIR).filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );
    
    console.log(`📁 Tillgängliga bilder i mappen (${availableImages.length}):`);
    availableImages.forEach(img => console.log(`   ✓ ${img}`));
    console.log('');
    
    // 2. Hämta alla menyrätter med bilder från databasen
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('id, name, image_url')
      .not('image_url', 'is', null);
    
    if (error) {
      console.error('❌ Fel vid hämtning av menyrätter:', error);
      return;
    }
    
    console.log(`📋 Menyrätter med bilder i databasen (${menuItems.length}):`);
    
    let brokenImages = [];
    let fixedCount = 0;
    
    // 3. Kontrollera varje bild
    for (const item of menuItems) {
      const imagePath = item.image_url.replace('/Meny-bilder/', '');
      const exists = availableImages.includes(imagePath);
      
      if (!exists) {
        console.log(`❌ PROBLEM: "${item.name}"`);
        console.log(`   Söker: ${imagePath}`);
        
        // Försök hitta liknande fil
        const baseName = imagePath.replace(/\.(jpg|jpeg|png|webp)$/i, '');
        const possibleMatches = availableImages.filter(img => 
          img.replace(/\.(jpg|jpeg|png|webp)$/i, '') === baseName
        );
        
        if (possibleMatches.length > 0) {
          const newPath = `/Meny-bilder/${possibleMatches[0]}`;
          console.log(`   🔧 Fixar till: ${possibleMatches[0]}`);
          
          const { error: updateError } = await supabase
            .from('menu_items')
            .update({ image_url: newPath })
            .eq('id', item.id);
          
          if (updateError) {
            console.log(`   ❌ Fel vid uppdatering: ${updateError.message}`);
          } else {
            console.log(`   ✅ Fixad!`);
            fixedCount++;
          }
        } else {
          console.log(`   ⚠️  Ingen matchande fil hittades`);
          brokenImages.push({
            name: item.name,
            currentPath: item.image_url,
            suggestions: findSimilarImages(baseName, availableImages)
          });
        }
        console.log('');
      } else {
        console.log(`✅ OK: "${item.name}" -> ${imagePath}`);
      }
    }
    
    // 4. Sammanfattning
    console.log('\n📊 SAMMANFATTNING:');
    console.log(`✅ Automatiskt fixade: ${fixedCount}`);
    console.log(`❌ Behöver manuell hantering: ${brokenImages.length}`);
    
    if (brokenImages.length > 0) {
      console.log('\n🛠️  MANUELL HANTERING BEHÖVS:');
      brokenImages.forEach(item => {
        console.log(`\n📝 "${item.name}"`);
        console.log(`   Nuvarande: ${item.currentPath}`);
        if (item.suggestions.length > 0) {
          console.log(`   Förslag:`);
          item.suggestions.forEach(suggestion => {
            console.log(`     - ${suggestion}`);
          });
        } else {
          console.log(`   ⚠️  Inga liknande bilder hittades`);
        }
      });
    }
    
    // 5. Lista oanvända bilder
    const usedImages = menuItems.map(item => 
      item.image_url.replace('/Meny-bilder/', '')
    );
    const unusedImages = availableImages.filter(img => !usedImages.includes(img));
    
    if (unusedImages.length > 0) {
      console.log(`\n📷 OANVÄNDA BILDER (${unusedImages.length}):`);
      unusedImages.forEach(img => console.log(`   📁 ${img}`));
      console.log('\n💡 Dessa bilder kan användas för menyrätter som saknar bilder.');
    }
    
    console.log('\n🎉 Diagnostik klar!');
    
  } catch (error) {
    console.error('💥 Oväntat fel:', error);
  }
}

function findSimilarImages(searchName, availableImages) {
  const searchLower = searchName.toLowerCase();
  const suggestions = [];
  
  availableImages.forEach(img => {
    const imgBase = img.replace(/\.(jpg|jpeg|png|webp)$/i, '').toLowerCase();
    
    // Exakt match
    if (imgBase === searchLower) {
      suggestions.push(img);
      return;
    }
    
    // Innehåller
    if (imgBase.includes(searchLower) || searchLower.includes(imgBase)) {
      suggestions.push(img);
      return;
    }
    
    // Ord-baserad likhet
    const searchWords = searchLower.split(/[\s-_]+/);
    const imgWords = imgBase.split(/[\s-_]+/);
    
    let matches = 0;
    searchWords.forEach(word => {
      if (imgWords.some(imgWord => imgWord.includes(word) || word.includes(imgWord))) {
        matches++;
      }
    });
    
    if (matches >= Math.min(searchWords.length, imgWords.length) * 0.5) {
      suggestions.push(img);
    }
  });
  
  return suggestions.slice(0, 3); // Max 3 förslag
}

// Kör scriptet
if (require.main === module) {
  fixImageIssues();
}

module.exports = { fixImageIssues }; 
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateWebpPaths() {
  try {
    console.log('🔄 Uppdaterar bildvägar från jpg/png till webp...');
    
    // Hämta alla menyrätter med bilder
    const { data: menuItems, error } = await supabase
      .from('menu_items')
      .select('id, name, image_url')
      .not('image_url', 'is', null);
    
    if (error) {
      console.error('❌ Fel vid hämtning av menyrätter:', error);
      return;
    }
    
    console.log(`📋 Hittade ${menuItems.length} menyrätter med bilder`);
    
    let updatedCount = 0;
    
    for (const item of menuItems) {
      if (item.image_url && item.image_url.includes('/Meny-bilder/')) {
        // Konvertera filnamn från jpg/png till webp
        let newImageUrl = item.image_url
          .replace(/\.jpg$/i, '.webp')
          .replace(/\.jpeg$/i, '.webp')
          .replace(/\.png$/i, '.webp');
        
        // Uppdatera bara om det faktiskt ändrats
        if (newImageUrl !== item.image_url) {
          const { error: updateError } = await supabase
            .from('menu_items')
            .update({ image_url: newImageUrl })
            .eq('id', item.id);
          
          if (updateError) {
            console.error(`❌ Fel vid uppdatering av ${item.name}:`, updateError);
          } else {
            console.log(`✅ Uppdaterad "${item.name}"`);
            console.log(`   ${item.image_url} -> ${newImageUrl}`);
            updatedCount++;
          }
        } else {
          console.log(`⚠️  "${item.name}" behöver ingen uppdatering`);
        }
      }
    }
    
    console.log(`\n🎉 Klart! Uppdaterade ${updatedCount} bildvägar till WebP-format.`);
    
  } catch (error) {
    console.error('💥 Oväntat fel:', error);
  }
}

// Kör scriptet
if (require.main === module) {
  updateWebpPaths();
}

module.exports = { updateWebpPaths }; 
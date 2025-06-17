const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function assignMissingImages() {
  console.log('🖼️  Tilldelar bilder till menyrätter som saknar dem...\n');
  
  const updates = [
    { name: 'Coca-Cola 33 cl', image: '/Meny-bilder/coca-cola.webp' },
    { name: 'Coca-Cola Zero 33 cl', image: '/Meny-bilder/coca-cola-zero.webp' },
    { name: 'Misosoppa', image: '/Meny-bilder/miso soppa.webp' },
    { name: 'Shrimptempura', image: '/Meny-bilder/shrimptempura.webp' },
    { name: 'Avokado Love', image: '/Meny-bilder/magic avokado.webp' },
    { name: 'Crazy Shrimp', image: '/Meny-bilder/magic shrimp2.webp' }
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const update of updates) {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ image_url: update.image })
        .eq('name', update.name);
      
      if (error) {
        console.log(`❌ Fel för "${update.name}": ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Uppdaterad: "${update.name}" -> ${update.image}`);
        successCount++;
      }
    } catch (err) {
      console.log(`💥 Oväntat fel för "${update.name}": ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 RESULTAT:`);
  console.log(`✅ Framgångsrikt uppdaterade: ${successCount}`);
  console.log(`❌ Fel: ${errorCount}`);
  console.log(`\n🎉 Klart!`);
}

assignMissingImages().catch(console.error); 
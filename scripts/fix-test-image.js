const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixTestImage() {
  console.log('🔧 Ger test-menyrätten en bild...');
  
  const { error } = await supabase
    .from('menu_items')
    .update({ image_url: '/Meny-bilder/random.webp' })
    .eq('name', 'test');
  
  if (error) {
    console.log('❌ Fel:', error.message);
  } else {
    console.log('✅ Test-menyrätten har nu fått bilden "random.webp"!');
  }
}

fixTestImage(); 
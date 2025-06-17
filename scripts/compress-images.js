const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Konfiguration
const INPUT_DIR = '../public/Meny-bilder';
const OUTPUT_DIR = '../public/Meny-bilder-compressed';
const MAX_WIDTH = 800;
const MAX_HEIGHT = 600;
const QUALITY = 80;

async function compressImages() {
  try {
    console.log('🖼️  Startar bildkomprimering...');
    
    // Skapa output-mapp om den inte finns
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
      console.log(`📁 Skapade mapp: ${OUTPUT_DIR}`);
    }

    // Läs alla filer i input-mappen
    const files = fs.readdirSync(INPUT_DIR);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

    console.log(`📋 Hittade ${imageFiles.length} bilder att komprimera`);

    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    let processedCount = 0;

    for (const file of imageFiles) {
      const inputPath = path.join(INPUT_DIR, file);
      const outputPath = path.join(OUTPUT_DIR, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

      try {
        // Hämta original filstorlek
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;
        totalOriginalSize += originalSize;

        console.log(`🔄 Komprimerar: ${file} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);

        // Komprimera bilden
        await sharp(inputPath)
          .resize(MAX_WIDTH, MAX_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: QUALITY })
          .toFile(outputPath);

        // Hämta komprimerad filstorlek
        const compressedStats = fs.statSync(outputPath);
        const compressedSize = compressedStats.size;
        totalCompressedSize += compressedSize;

        const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        
        console.log(`✅ ${file} -> ${path.basename(outputPath)}`);
        console.log(`   ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(compressedSize / 1024 / 1024).toFixed(2)} MB (-${reduction}%)`);
        
        processedCount++;
      } catch (error) {
        console.error(`❌ Fel vid komprimering av ${file}:`, error.message);
      }
    }

    // Sammanfattning
    const totalReduction = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(1);
    
    console.log('\n🎉 Komprimering klar!');
    console.log(`📊 Sammanfattning:`);
    console.log(`   Bearbetade filer: ${processedCount}/${imageFiles.length}`);
    console.log(`   Original storlek: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Komprimerad storlek: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total minskning: ${totalReduction}% (${((totalOriginalSize - totalCompressedSize) / 1024 / 1024).toFixed(2)} MB sparade)`);
    
    console.log('\n📝 Nästa steg:');
    console.log('1. Kontrollera bildkvaliteten i den nya mappen');
    console.log('2. Om du är nöjd, ersätt originalbilderna:');
    console.log('   - Flytta originalbilderna till en backup-mapp');
    console.log('   - Flytta de komprimerade bilderna till Meny-bilder/');
    console.log('3. Uppdatera bildvägar i databasen om nödvändigt');

  } catch (error) {
    console.error('💥 Oväntat fel:', error);
  }
}

// Hjälpfunktion för att ersätta originalbilder
async function replaceOriginalImages() {
  try {
    console.log('🔄 Ersätter originalbilder med komprimerade versioner...');
    
    // Skapa backup-mapp
    const BACKUP_DIR = '../public/Meny-bilder-original';
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Flytta originalbilder till backup
    const originalFiles = fs.readdirSync(INPUT_DIR);
    for (const file of originalFiles) {
      if (/\.(jpg|jpeg|png)$/i.test(file)) {
        const sourcePath = path.join(INPUT_DIR, file);
        const backupPath = path.join(BACKUP_DIR, file);
        fs.renameSync(sourcePath, backupPath);
        console.log(`📦 Backup: ${file}`);
      }
    }

    // Flytta komprimerade bilder till huvudmapp
    const compressedFiles = fs.readdirSync(OUTPUT_DIR);
    for (const file of compressedFiles) {
      const sourcePath = path.join(OUTPUT_DIR, file);
      const targetPath = path.join(INPUT_DIR, file);
      fs.renameSync(sourcePath, targetPath);
      console.log(`✅ Ersatt: ${file}`);
    }

    // Ta bort tom compressed-mapp
    fs.rmdirSync(OUTPUT_DIR);

    console.log('\n🎉 Ersättning klar!');
    console.log(`📦 Originalbilder finns i: ${BACKUP_DIR}`);
    console.log(`✨ Komprimerade bilder är nu aktiva i: ${INPUT_DIR}`);

  } catch (error) {
    console.error('💥 Fel vid ersättning:', error);
  }
}

// Kör baserat på argument
const command = process.argv[2];

if (command === 'replace') {
  replaceOriginalImages();
} else {
  compressImages();
}

module.exports = { compressImages, replaceOriginalImages }; 
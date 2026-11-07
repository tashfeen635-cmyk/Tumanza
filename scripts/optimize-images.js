const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '../public');

async function optimizeImages() {
  console.log('Starting image optimization...');

  // 1. Optimize hero images
  const heroJpg = path.join(publicDir, 'img/hero.jpg');
  if (fs.existsSync(heroJpg)) {
    try {
      const statsBefore = fs.statSync(heroJpg);
      const buffer = await sharp(heroJpg)
        .resize(1920, null, { withoutEnlargement: true })
        .jpeg({ quality: 75, progressive: true })
        .toBuffer();
      fs.writeFileSync(heroJpg, buffer);
      const statsAfter = fs.statSync(heroJpg);
      console.log(`Optimized hero.jpg: ${(statsBefore.size / 1024).toFixed(1)} KB -> ${(statsAfter.size / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.error('Failed hero.jpg:', e);
    }
  }

  const heroMobile = path.join(publicDir, 'img/hero-mobile.png');
  if (fs.existsSync(heroMobile)) {
    try {
      const statsBefore = fs.statSync(heroMobile);
      const buffer = await sharp(heroMobile)
        .resize(828, null, { withoutEnlargement: true })
        .jpeg({ quality: 75, progressive: true })
        .toBuffer();
      // Save as hero-mobile.jpg or overwrite
      const heroMobileJpg = path.join(publicDir, 'img/hero-mobile.jpg');
      fs.writeFileSync(heroMobileJpg, buffer);
      const statsAfter = fs.statSync(heroMobileJpg);
      console.log(`Optimized hero-mobile.png -> hero-mobile.jpg: ${(statsBefore.size / 1024).toFixed(1)} KB -> ${(statsAfter.size / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.error('Failed hero-mobile:', e);
    }
  }

  // Remove duplicate shilajit.png if it exists
  const shilajitPng = path.join(publicDir, 'images/shilajit.png');
  if (fs.existsSync(shilajitPng)) {
    try {
      fs.unlinkSync(shilajitPng);
      console.log('Removed duplicate /images/shilajit.png');
    } catch (e) {}
  }

  // Optimize logo
  const logoPath = path.join(publicDir, 'img/logo.jpeg');
  if (fs.existsSync(logoPath)) {
    try {
      const statsBefore = fs.statSync(logoPath);
      const buffer = await sharp(logoPath)
        .resize(420, 140, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      fs.writeFileSync(logoPath, buffer);
      const statsAfter = fs.statSync(logoPath);
      console.log(`Optimized logo.jpeg: ${(statsBefore.size / 1024).toFixed(1)} KB -> ${(statsAfter.size / 1024).toFixed(1)} KB`);
    } catch (e) {}
  }

  // Optimize images folder
  const imagesDir = path.join(publicDir, 'images');
  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      try {
        if (fs.statSync(filePath).isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
          const statsBefore = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase();
          let pipeline = sharp(filePath).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true });
          if (ext === '.png') {
            pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
          } else {
            pipeline = pipeline.jpeg({ quality: 80, progressive: true });
          }
          const buffer = await pipeline.toBuffer();
          fs.writeFileSync(filePath, buffer);
          const statsAfter = fs.statSync(filePath);
          console.log(`Optimized images/${file}: ${(statsBefore.size / 1024).toFixed(1)} KB -> ${(statsAfter.size / 1024).toFixed(1)} KB`);
        }
      } catch (err) {
        console.error(`Skipped images/${file}:`, err.message);
      }
    }
  }

  // Optimize uploads folder
  const uploadsDir = path.join(publicDir, 'uploads');
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      const filePath = path.join(uploadsDir, file);
      try {
        if (fs.statSync(filePath).isFile() && /\.(jpg|jpeg|png)$/i.test(file)) {
          const statsBefore = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase();
          let pipeline = sharp(filePath).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true });
          if (ext === '.png') {
            pipeline = pipeline.png({ quality: 80, compressionLevel: 8 });
          } else {
            pipeline = pipeline.jpeg({ quality: 80, progressive: true });
          }
          const buffer = await pipeline.toBuffer();
          fs.writeFileSync(filePath, buffer);
          const statsAfter = fs.statSync(filePath);
          console.log(`Optimized uploads/${file}: ${(statsBefore.size / 1024).toFixed(1)} KB -> ${(statsAfter.size / 1024).toFixed(1)} KB`);
        }
      } catch (err) {
        console.error(`Skipped uploads/${file}:`, err.message);
      }
    }
  }

  console.log('Image optimization complete.');
}

optimizeImages().catch(err => {
  console.error('Error optimizing images:', err);
  process.exit(1);
});

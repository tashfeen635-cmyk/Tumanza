const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const inputPath = path.join(__dirname, '../public/img/logo.jpeg');
  const outputPath = path.join(__dirname, '../public/img/logo.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    const brightness = (r + g + b) / 3;
    // Make dark/black background transparent
    if (brightness < 35) {
      data[i + 3] = 0;
    } else {
      data[i + 3] = 255;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
  .png()
  .toFile(outputPath);

  console.log('Processed logo saved to logo.png');
}

processLogo().catch(console.error);

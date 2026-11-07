const sharp = require('sharp');
const path = require('path');

async function inspectLogo() {
  const logoPath = path.join(__dirname, '../public/img/logo.jpeg');
  const metadata = await sharp(logoPath).metadata();
  console.log('Logo metadata:', metadata);

  const { data, info } = await sharp(logoPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  console.log('Width:', info.width, 'Height:', info.height, 'Channels:', info.channels);
  // Sample top-left pixel
  console.log('Top-left pixel RGB:', data[0], data[1], data[2]);
}

inspectLogo().catch(console.log);

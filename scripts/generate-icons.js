import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
const iconSvg = path.join(publicDir, 'icon.svg');
const maskableSvg = path.join(publicDir, 'icon-maskable.svg');
const logoSvg = path.join(publicDir, 'logo.svg');

async function generate() {
  console.log('Generating PWA PNG icons and logo graphics...');

  // 192x192 PNG
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 512x512 PNG
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 512x512 Maskable PNG
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 180x180 Apple Touch Icon
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 32x32 Favicon PNG & ICO
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Generated favicon.ico and favicon-32x32.png');

  // 16x16 Favicon PNG
  await sharp(iconSvg)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('Generated favicon-16x16.png');

  // High-Resolution 1024x500 Banner & Official Graphic
  await sharp(logoSvg)
    .resize(1024, 500)
    .png()
    .toFile(path.join(publicDir, 'logo.png'));
  await sharp(logoSvg)
    .resize(1024, 500)
    .png()
    .toFile(path.join(publicDir, 'grafico_funciones_1024x500_listo.png'));
  console.log('Generated logo.png and grafico_funciones_1024x500_listo.png');

  console.log('All PWA icons and official graphics generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});

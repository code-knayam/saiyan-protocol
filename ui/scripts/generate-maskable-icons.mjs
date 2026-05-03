import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgBuffer = readFileSync('public/favicon.svg');

async function generateMaskable(size, output) {
  // Maskable icons need the content in the inner 80% (safe zone)
  const iconSize = Math.round(size * 0.6);
  const padding = Math.round((size - iconSize) / 2);

  const resizedIcon = await sharp(svgBuffer)
    .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 224, g: 152, b: 48, alpha: 255 }, // #E09830
    },
  })
    .composite([{ input: resizedIcon, left: padding, top: padding }])
    .png()
    .toFile(output);

  console.log(`Generated ${output}`);
}

await generateMaskable(192, 'public/icons/icon-maskable-192.png');
await generateMaskable(512, 'public/icons/icon-maskable-512.png');

// Also generate Apple touch icon (180x180)
const appleSize = 180;
const appleIconSize = Math.round(appleSize * 0.7);
const applePadding = Math.round((appleSize - appleIconSize) / 2);

const appleResized = await sharp(svgBuffer)
  .resize(appleIconSize, appleIconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: appleSize,
    height: appleSize,
    channels: 4,
    background: { r: 224, g: 152, b: 48, alpha: 255 },
  },
})
  .composite([{ input: appleResized, left: applePadding, top: applePadding }])
  .png()
  .toFile('public/icons/apple-touch-icon.png');

console.log('Generated apple-touch-icon.png');

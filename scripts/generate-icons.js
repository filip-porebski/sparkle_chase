// Generates platform icons from public/sparkle.svg using sharp
// Usage: npm run icons

const fs = require('fs');
const path = require('path');

async function run() {
  const svgPath = path.resolve(__dirname, '..', 'public', 'sparkle.svg');
  const outDir = path.resolve(__dirname, '..', 'resources');
  if (!fs.existsSync(svgPath)) {
    console.error('Missing public/sparkle.svg');
    process.exit(1);
  }
  try {
    // Lazy require so this file can exist without the dependency installed
    const sharp = require('sharp');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const sizes = [128, 256, 512, 1024];
    for (const s of sizes) {
      const out = path.join(outDir, s === 1024 ? 'icon.png' : `icon@${s}.png`);
      await sharp(svgPath).resize(s, s).png({ compressionLevel: 9 }).toFile(out);
      console.log('Wrote', out);
    }
    console.log('\nDone. Now set build.icon to resources/icon.png if desired.');
  } catch (e) {
    console.error('\nThis script requires the "sharp" package. Install it with:');
    console.error('  npm i -D sharp');
    process.exit(1);
  }
}

run();


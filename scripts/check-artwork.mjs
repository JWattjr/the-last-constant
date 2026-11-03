import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const folder = fileURLToPath(new URL('../public/assets/', import.meta.url));
const required = process.argv.includes('--require-core');
const assets = [
  ['examiner.png', 1024, 1536, true, true, 'automatic portrait'],
  ['academy-battlefield.png', 2560, 1024, false, true, 'automatic background'],
  ['apprentice.png', 1024, 1536, true, true, 'automatic portrait'],
  ['construct-a.png', 1024, 1536, true, true, 'automatic portrait'],
  ['construct-b.png', 1024, 1536, true, true, 'automatic portrait'],
  ['formula-linear.png', 1024, 512, false, false, 'automatic card art'],
  ['formula-quadratic.png', 1024, 512, false, false, 'automatic card art'],
  ['formula-additive.png', 1024, 512, false, false, 'automatic card art'],
  ['formula-frame.png', 900, 1200, true, false, 'manual fitting needed'],
  ['cast-button.png', 960, 128, true, false, 'manual fitting needed'],
  ['spellwork-desk.png', 2560, 800, false, false, 'manual fitting needed'],
];
const names = readdirSync(folder);
let found = 0; let missingCore = 0; let errors = 0; let warnings = 0;
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
console.log('The Last Constant — local artwork preflight');
for (const [name, expectedWidth, expectedHeight, needsAlpha, core, integration] of assets) {
  if (!names.includes(name)) {
    const wrongCase = names.find(item => item.toLowerCase() === name.toLowerCase());
    if (wrongCase) { errors++; console.log(`ERROR ${wrongCase}: rename to exact filename ${name}.`); }
    else { if (core) missingCore++; console.log(`PENDING ${name}${core ? ' (core)' : ''}`); }
    continue;
  }
  found++;
  try {
    const path = join(folder, name); const bytes = readFileSync(path);
    if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature) || bytes.toString('ascii', 12, 16) !== 'IHDR' || bytes.readUInt32BE(8) !== 13) throw new Error('not a valid PNG header; renaming a JPG does not convert it');
    const width = bytes.readUInt32BE(16); const height = bytes.readUInt32BE(20); const colourType = bytes[25];
    if (!width || !height) throw new Error('image dimensions must be positive');
    let alpha = colourType === 4 || colourType === 6;
    let offset = 8; let ended = false;
    while (offset + 12 <= bytes.length) {
      const size = bytes.readUInt32BE(offset); const type = bytes.toString('ascii', offset + 4, offset + 8);
      if (size > bytes.length - offset - 12) throw new Error('PNG contains a truncated chunk');
      if (type === 'tRNS') alpha = true;
      if (type === 'IEND') { ended = true; break; }
      offset += size + 12;
    }
    if (!ended) throw new Error('PNG is incomplete: IEND chunk missing');
    console.log(`FOUND ${name}: ${width}×${height}, ${Math.round(statSync(path).size / 1024)} KB, ${integration}.`);
    if (needsAlpha && !alpha) { warnings++; console.log('  REVIEW: no transparency channel detected; the cutout may include an opaque background.'); }
    const ratio = width / height; const expectedRatio = expectedWidth / expectedHeight;
    if (Math.abs(ratio - expectedRatio) / expectedRatio > .1) { warnings++; console.log(`  REVIEW: aspect ratio differs from the ${expectedWidth}×${expectedHeight} specification; inspect the actual crop.`); }
    if (width < expectedWidth * .7 || height < expectedHeight * .7) { warnings++; console.log(`  REVIEW: below recommended resolution ${expectedWidth}×${expectedHeight}.`); }
    if (statSync(path).size > 6 * 1024 * 1024) { warnings++; console.log('  REVIEW: over 6 MB; check loading performance before release.'); }
  } catch (error) { errors++; console.log(`ERROR ${name}: ${error.message}`); }
}
console.log(`\n${found} supplied; ${missingCore} core assets pending; ${warnings} review notes; ${errors} format/name errors.`);
console.log('This checks filenames and PNG structure, not visual quality, actual transparent pixels, contrast, decoding, or usage rights.');
if (!found) console.log('Placeholder mode is expected until the user supplies artwork. Start with docs/art-batch-01/README.md.');
if (required && missingCore) console.log('Core-file gate is incomplete. Supply all four portraits and the battlefield before the full-art review.');
process.exitCode = errors > 0 || required && missingCore > 0 ? 1 : 0;

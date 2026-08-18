const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const pngToIcoModule = require('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;

const projectRoot = path.resolve(__dirname, '..');
const sourceSvgPath = path.resolve(projectRoot, '..', 'src', 'app', 'icon.svg');

if (!fs.existsSync(sourceSvgPath)) {
  console.error(`Source icon not found: ${sourceSvgPath}`);
  process.exit(1);
}

const flavorColors = {
  shared: { start: '#00DF81', end: '#01935A' },
  frame: { start: '#47E3FF', end: '#007EA7' },
  news: { start: '#FF7A5C', end: '#C1361B' },
  campaign: { start: '#FFB84D', end: '#F26A1B' },
  content: { start: '#7FE36A', end: '#2E9B1F' },
  creative: { start: '#FF7AA8', end: '#C13A7B' },
};

function buildFlavorSvg(baseSvg, colors) {
  return baseSvg
    .replace('stop-color="#00DF81"', `stop-color="${colors.start}"`)
    .replace('stop-color="#01935A"', `stop-color="${colors.end}"`);
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function run(command, args) {
  execFileSync(command, args, { stdio: 'inherit' });
}

function collectFirstPng(dirPath) {
  const files = fs.readdirSync(dirPath).filter((name) => name.toLowerCase().endsWith('.png'));
  if (!files.length) {
    throw new Error(`No PNG files found in ${dirPath}`);
  }
  return path.join(dirPath, files[0]);
}

async function generate() {
  const baseSvg = fs.readFileSync(sourceSvgPath, 'utf8');

  for (const [flavor, colors] of Object.entries(flavorColors)) {
    const iconRoot = path.join(projectRoot, 'assets', 'icons', flavor);
    const macDir = path.join(iconRoot, 'mac');
    const winDir = path.join(iconRoot, 'win');
    const iconsetDir = path.join(macDir, 'icon.iconset');

    ensureDir(macDir);
    ensureDir(winDir);
    ensureDir(iconsetDir);

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `zelvo-icon-${flavor}-`));
    const svgPath = path.join(tempDir, 'icon.svg');
    fs.writeFileSync(svgPath, buildFlavorSvg(baseSvg, colors), 'utf8');

    run('qlmanage', ['-t', '-s', '1024', '-o', tempDir, svgPath]);
    const previewPngPath = collectFirstPng(tempDir);
    const basePngPath = path.join(tempDir, 'icon-1024.png');
    fs.copyFileSync(previewPngPath, basePngPath);

    const sizes = [
      ['16x16', 16],
      ['16x16@2x', 32],
      ['32x32', 32],
      ['32x32@2x', 64],
      ['128x128', 128],
      ['128x128@2x', 256],
      ['256x256', 256],
      ['256x256@2x', 512],
      ['512x512', 512],
      ['512x512@2x', 1024],
    ];

    for (const [label, pixels] of sizes) {
      const outPath = path.join(iconsetDir, `icon_${label}.png`);
      run('sips', ['-z', String(pixels), String(pixels), basePngPath, '--out', outPath]);
    }

    const macIconPath = path.join(macDir, 'icon.icns');
    run('iconutil', ['-c', 'icns', iconsetDir, '-o', macIconPath]);

    const winPngSizes = [16, 24, 32, 48, 64, 128, 256];
    const winPngPaths = [];
    for (const pixels of winPngSizes) {
      const outPath = path.join(tempDir, `icon-${pixels}.png`);
      run('sips', ['-z', String(pixels), String(pixels), basePngPath, '--out', outPath]);
      winPngPaths.push(outPath);
    }

    const icoBuffer = await pngToIco(winPngPaths);
    fs.writeFileSync(path.join(winDir, 'icon.ico'), icoBuffer);

    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(iconsetDir, { recursive: true, force: true });

    console.log(`Generated icons for ${flavor}`);
  }
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
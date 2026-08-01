const fs = require('fs');
const path = require('path');

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(message);
}

const flavor = String(process.argv[2] || process.env.PRODUCT_FLAVOR || '').trim().toLowerCase();
const platform = String(process.argv[3] || process.env.TARGET_PLATFORM || '').trim().toLowerCase();

if (!flavor) {
  fail('Missing flavor. Usage: node scripts/verify-artifacts.cjs <flavor> <platform>');
}

if (!platform || !['mac', 'win'].includes(platform)) {
  fail('Invalid platform. Use mac or win.');
}

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist', flavor);

if (!fs.existsSync(distDir)) {
  fail(`Missing dist folder: ${distDir}`);
}

const allFiles = fs.readdirSync(distDir);
const configPath = path.join(distDir, 'builder-effective-config.yaml');

if (!fs.existsSync(configPath)) {
  fail(`Missing expected config output: ${configPath}`);
}

let foundArtifacts = [];

if (platform === 'mac') {
  foundArtifacts = allFiles.filter((name) => name.toLowerCase().endsWith('.dmg'));
  if (!foundArtifacts.length) {
    fail(`No DMG artifacts found for flavor '${flavor}' in ${distDir}`);
  }
}

if (platform === 'win') {
  foundArtifacts = allFiles.filter((name) => {
    const lower = name.toLowerCase();
    return lower.endsWith('.exe') || lower.endsWith('.msi');
  });
  if (!foundArtifacts.length) {
    fail(`No EXE/MSI artifacts found for flavor '${flavor}' in ${distDir}`);
  }
}

info(`Verified ${platform} artifacts for flavor '${flavor}':`);
for (const artifact of foundArtifacts) {
  info(`- dist/${flavor}/${artifact}`);
}
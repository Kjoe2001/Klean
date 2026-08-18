const { spawnSync } = require('child_process');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const flavors = ['frame', 'news', 'campaign', 'content', 'creative'];

for (const flavor of flavors) {
  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['cross-env', `PRODUCT_FLAVOR=${flavor}`, 'electron-builder', '--config', 'electron-builder.config.cjs'];
  const run = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (run.status !== 0) {
    process.exit(run.status || 1);
  }
}

console.log('Built standalone installers for frame, news, campaign, content, and creative.');

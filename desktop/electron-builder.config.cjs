const fs = require('fs');
const path = require('path');
const { getFlavor } = require('./flavors.cjs');

const flavor = getFlavor();
const iconDir = path.join(__dirname, 'assets', 'icons', flavor.iconSet || flavor.key);
const macIconPath = path.join(iconDir, 'mac', 'icon.icns');
const winIconPath = path.join(iconDir, 'win', 'icon.ico');
const hasMacIcon = fs.existsSync(macIconPath);
const hasWinIcon = fs.existsSync(winIconPath);

/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: flavor.appId,
  productName: flavor.productName,
  executableName: flavor.executableName,
  directories: {
    output: `dist/${flavor.key}`,
  },
  artifactName: `${flavor.productName}-${'${version}'}-${'${os}'}-${'${arch}'}.${'${ext}'}`.replace(/\s+/g, '-'),
  files: ['main.cjs', 'preload.cjs', 'flavors.cjs', 'assets/**/*'],
  mac: {
    category: 'public.app-category.business',
    ...(hasMacIcon ? { icon: macIconPath } : {}),
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64'],
      },
    ],
    hardenedRuntime: true,
    entitlements: 'build/entitlements.mac.plist',
    entitlementsInherit: 'build/entitlements.mac.plist',
  },
  win: {
    ...(hasWinIcon ? { icon: winIconPath } : {}),
    target: [
      {
        target: 'nsis',
        arch: ['x64'],
      },
    ],
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};

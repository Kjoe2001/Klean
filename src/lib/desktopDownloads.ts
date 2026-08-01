type ProductKey = 'frame' | 'campaign' | 'content' | 'creative';

type ProductConfig = {
  key: ProductKey;
  name: string;
  shortDescription: string;
  baseFileName: string;
};

export const desktopRelease = {
  // Example tag: desktop-v0.1.0
  tag: process.env.NEXT_PUBLIC_DESKTOP_RELEASE_TAG || 'desktop-v0.1.0',
  // Example repo: Kjoe2001/zelvo
  repo: process.env.NEXT_PUBLIC_DESKTOP_GITHUB_REPO || 'Kjoe2001/zelvo',
  version: process.env.NEXT_PUBLIC_DESKTOP_RELEASE_VERSION || '0.1.0',
};

const products: ProductConfig[] = [
  {
    key: 'frame',
    name: 'Frame Studio',
    shortDescription: 'Storyboard and render frame-first campaign assets.',
    baseFileName: 'Zelvo-Frame-Studio',
  },
  {
    key: 'campaign',
    name: 'Campaign Builder',
    shortDescription: 'Build strategy, budget plans, and campaign timelines quickly.',
    baseFileName: 'Zelvo-Campaign-Builder',
  },
  {
    key: 'content',
    name: 'Content Studio',
    shortDescription: 'Generate and refine ready-to-publish campaign content.',
    baseFileName: 'Zelvo-Content-Studio',
  },
  {
    key: 'creative',
    name: 'Creative Studio',
    shortDescription: 'Design branded social visuals and export production-ready files.',
    baseFileName: 'Zelvo-Creative-Studio',
  },
];

function releaseAssetUrl(assetFileName: string) {
  const encoded = encodeURIComponent(assetFileName);
  return `https://github.com/${desktopRelease.repo}/releases/download/${desktopRelease.tag}/${encoded}`;
}

export const desktopDownloadProducts = products.map((product) => {
  const v = desktopRelease.version;
  return {
    ...product,
    downloads: {
      macIntel: releaseAssetUrl(`${product.baseFileName}-${v}-mac-x64.dmg`),
      macAppleSilicon: releaseAssetUrl(`${product.baseFileName}-${v}-mac-arm64.dmg`),
      windows: releaseAssetUrl(`${product.baseFileName}-${v}-win-x64.exe`),
    },
  };
});

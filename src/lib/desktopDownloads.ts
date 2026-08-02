type ProductKey = 'frame' | 'news' | 'campaign' | 'content' | 'creative';

type ProductConfig = {
  key: ProductKey;
  name: string;
  shortDescription: string;
  baseFileName: string;
};

function getSupabaseDownloadBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_BASE_URL?.trim();
  return configured || '';
}

function getDesktopDownloadSource() {
  const configured = process.env.NEXT_PUBLIC_DESKTOP_DOWNLOAD_SOURCE?.trim().toLowerCase();
  if (configured === 'supabase') return 'supabase' as const;
  if (configured === 'auto') return 'auto' as const;
  return 'github' as const;
}

export const desktopRelease = {
  // Example tag: desktop-v0.1.1
  tag: process.env.NEXT_PUBLIC_DESKTOP_RELEASE_TAG || 'desktop-v0.1.1',
  // Example repo: Kjoe2001/zelvo
  repo: process.env.NEXT_PUBLIC_DESKTOP_GITHUB_REPO || 'Kjoe2001/zelvo',
  version: process.env.NEXT_PUBLIC_DESKTOP_RELEASE_VERSION || '0.1.1',
  // Example:
  // https://<project-ref>.supabase.co/storage/v1/object/public/desktop-downloads
  // Final URLs become:
  // <base>/<tag>/<asset-file>
  supabaseBaseUrl: getSupabaseDownloadBaseUrl(),
};

const products: ProductConfig[] = [
  {
    key: 'frame',
    name: 'Video Frame Studio',
    shortDescription: 'Storyboard and render video-first campaign assets.',
    baseFileName: 'Zelvo-Frame-Studio',
  },
  {
    key: 'news',
    name: 'News Frame Studio',
    shortDescription: 'Design branded news cards with templates, QR badges, and export tools.',
    baseFileName: 'Zelvo-News-Frame-Studio',
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

function githubReleaseAssetUrl(assetFileName: string) {
  const encoded = encodeURIComponent(assetFileName);
  return `https://github.com/${desktopRelease.repo}/releases/download/${desktopRelease.tag}/${encoded}`;
}

function supabaseAssetUrl(assetFileName: string) {
  const base = desktopRelease.supabaseBaseUrl.replace(/\/+$/, '');
  if (!base) return '';
  const encoded = encodeURIComponent(assetFileName);
  return `${base}/${desktopRelease.tag}/${encoded}`;
}

const desktopDownloadMode = getDesktopDownloadSource();
export const desktopDownloadSource =
  desktopDownloadMode === 'supabase'
    ? 'supabase'
    : desktopDownloadMode === 'auto' && desktopRelease.supabaseBaseUrl
      ? 'supabase'
      : 'github';

function releaseAssetUrl(assetFileName: string) {
  if (desktopDownloadSource === 'github') {
    return githubReleaseAssetUrl(assetFileName);
  }

  const supabaseUrl = supabaseAssetUrl(assetFileName);
  if (desktopDownloadMode === 'auto') {
    return supabaseUrl || githubReleaseAssetUrl(assetFileName);
  }

  return supabaseUrl;
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

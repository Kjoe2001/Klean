const ROUTES = {
  dashboard: '/dashboard',
  frame: '/frame-studio',
  campaign: '/campaign-builder',
  content: '/content-studio',
  creative: '/creative-studio',
};

const FLAVORS = {
  shared: {
    key: 'shared',
    appId: 'app.zelvo.desktop',
    productName: 'Zelvo',
    executableName: 'Zelvo',
    iconSet: 'shared',
    defaultRoute: ROUTES.dashboard,
    standalone: false,
  },
  frame: {
    key: 'frame',
    appId: 'app.zelvo.frame',
    productName: 'Zelvo Frame Studio',
    executableName: 'Zelvo Frame Studio',
    iconSet: 'frame',
    defaultRoute: ROUTES.frame,
    standalone: true,
  },
  campaign: {
    key: 'campaign',
    appId: 'app.zelvo.campaign',
    productName: 'Zelvo Campaign Builder',
    executableName: 'Zelvo Campaign Builder',
    iconSet: 'campaign',
    defaultRoute: ROUTES.campaign,
    standalone: true,
  },
  content: {
    key: 'content',
    appId: 'app.zelvo.content',
    productName: 'Zelvo Content Studio',
    executableName: 'Zelvo Content Studio',
    iconSet: 'content',
    defaultRoute: ROUTES.content,
    standalone: true,
  },
  creative: {
    key: 'creative',
    appId: 'app.zelvo.creative',
    productName: 'Zelvo Creative Studio',
    executableName: 'Zelvo Creative Studio',
    iconSet: 'creative',
    defaultRoute: ROUTES.creative,
    standalone: true,
  },
};

function getFlavorKey() {
  const raw = String(process.env.PRODUCT_FLAVOR || 'shared').toLowerCase();
  return FLAVORS[raw] ? raw : 'shared';
}

function getFlavor() {
  return FLAVORS[getFlavorKey()];
}

module.exports = {
  ROUTES,
  FLAVORS,
  getFlavor,
  getFlavorKey,
};

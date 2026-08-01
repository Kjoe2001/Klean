const path = require('path');
const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const { ROUTES, getFlavor } = require('./flavors.cjs');

const isDev = process.env.NODE_ENV === 'development';
const APP_URL = process.env.APP_URL || 'https://www.zelvoo.app';
const flavor = getFlavor();

const PROTOCOL_BY_FLAVOR = {
  shared: 'zelvo',
  frame: 'zelvo-frame',
  campaign: 'zelvo-campaign',
  content: 'zelvo-content',
  creative: 'zelvo-creative',
};

const FLAVOR_ACCENT = {
  shared: '#00DF81',
  frame: '#00DF81',
  campaign: '#0EA5E9',
  content: '#F97316',
  creative: '#A855F7',
};

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
  app.quit();
}

let mainWindow = null;
let splashWindow = null;

function registerProtocol() {
  const scheme = PROTOCOL_BY_FLAVOR[flavor.key] || 'zelvo';
  if (process.defaultApp && process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(scheme, process.execPath, [path.resolve(process.argv[1])]);
    return;
  }
  app.setAsDefaultProtocolClient(scheme);
}

function routeFromDeepLink(input) {
  if (!input || typeof input !== 'string') return null;
  try {
    const u = new URL(input);
    const fromParam = u.searchParams.get('route');
    if (fromParam && fromParam.startsWith('/')) return fromParam;

    const lowerPath = (u.pathname || '').toLowerCase();
    if (lowerPath.includes('/auth/callback')) {
      return `/auth/callback${u.search || ''}${u.hash || ''}`;
    }

    const known = [
      ROUTES.dashboard,
      ROUTES.frame,
      ROUTES.campaign,
      ROUTES.content,
      ROUTES.creative,
    ];
    const pick = known.find((r) => lowerPath.includes(r));
    return pick || null;
  } catch {
    return null;
  }
}

function handleDeepLink(input) {
  const route = routeFromDeepLink(input);
  if (!route) return;
  go(route);
}

function routeFromArgv() {
  if (flavor.standalone) return flavor.defaultRoute;
  const argv = process.argv.join(' ').toLowerCase();
  if (argv.includes('--product=frame')) return ROUTES.frame;
  if (argv.includes('--product=campaign')) return ROUTES.campaign;
  if (argv.includes('--product=content')) return ROUTES.content;
  if (argv.includes('--product=creative')) return ROUTES.creative;
  return flavor.defaultRoute;
}

function appUrl(route) {
  const base = new URL(APP_URL);
  const input = route || flavor.defaultRoute;
  const [pathname, query = ''] = input.split('?');
  const nextUrl = new URL(pathname, `${base.origin}/`);

  if (query) {
    const parsed = new URLSearchParams(query);
    parsed.forEach((v, k) => nextUrl.searchParams.set(k, v));
  }

  nextUrl.searchParams.set('desktop', '1');
  return nextUrl.toString();
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 520,
    height: 330,
    frame: false,
    alwaysOnTop: true,
    transparent: false,
    resizable: false,
    movable: true,
    show: true,
    backgroundColor: '#07100c',
    webPreferences: {
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const accent = FLAVOR_ACCENT[flavor.key] || '#00DF81';
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${flavor.productName}</title><style>body{margin:0;font-family:Arial,sans-serif;background:#07100c;color:#eaf4ee;display:grid;place-items:center;height:100vh}.card{padding:28px 32px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(255,255,255,.04);text-align:center;min-width:300px}.logo{width:56px;height:56px;border-radius:16px;background:${accent};display:grid;place-items:center;font-weight:800;color:#032414;margin:0 auto 14px auto}.name{font-size:20px;font-weight:700;line-height:1.3}.sub{font-size:12px;opacity:.8;margin-top:8px}.bar{height:4px;border-radius:999px;background:rgba(255,255,255,.15);margin-top:18px;overflow:hidden}.fill{height:100%;width:38%;background:${accent};animation:load 1.2s ease-in-out infinite}@keyframes load{0%{margin-left:-40%}100%{margin-left:120%}}</style></head><body><div class="card"><div class="logo">Z</div><div class="name">${flavor.productName}</div><div class="sub">Launching desktop workspace...</div><div class="bar"><div class="fill"></div></div></div></body></html>`;
  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

function closeSplash() {
  if (!splashWindow || splashWindow.isDestroyed()) return;
  splashWindow.close();
  splashWindow = null;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1460,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#07100c',
    title: flavor.productName,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  });

  mainWindow.loadURL(appUrl(routeFromArgv()));

  mainWindow.once('ready-to-show', () => {
    closeSplash();
    mainWindow.show();
  });

  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      closeSplash();
      mainWindow.show();
    }
  }, 12000);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

function go(route) {
  if (!mainWindow) return;
  mainWindow.loadURL(appUrl(route));
}

function setAppMenu() {
  const appMenuLabel = flavor.productName;
  const isStandalone = flavor.standalone;

  const template = [
    {
      label: appMenuLabel,
      submenu: [
        ...(isStandalone ? [] : [{ label: 'Dashboard', click: () => go(ROUTES.dashboard) }]),
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    ...(isStandalone
      ? []
      : [
          {
            label: 'Products',
            submenu: [
              { label: 'Frame Studio', click: () => go(ROUTES.frame) },
              { label: 'Campaign Builder', click: () => go(ROUTES.campaign) },
              { label: 'Content Studio', click: () => go(ROUTES.content) },
              { label: 'Creative Studio', click: () => go(ROUTES.creative) },
            ],
          },
        ]),
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Open Zelvo website',
          click: () => shell.openExternal('https://www.zelvoo.app'),
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle('desktop:get-meta', () => ({
  version: app.getVersion(),
  platform: process.platform,
  appName: app.getName(),
  flavor: flavor.key,
  standalone: flavor.standalone,
}));

ipcMain.handle('desktop:open-external', async (_event, url) => {
  if (typeof url !== 'string' || !/^https?:\/\//.test(url)) return { ok: false };
  await shell.openExternal(url);
  return { ok: true };
});

ipcMain.handle('desktop:show-save-dialog', async (_event, options = {}) => {
  const win = BrowserWindow.getFocusedWindow() || mainWindow;
  const response = await dialog.showSaveDialog(win, {
    title: options.title || 'Save file',
    defaultPath: options.defaultPath,
    filters: Array.isArray(options.filters) ? options.filters : undefined,
  });
  return response;
});

app.whenReady().then(() => {
  registerProtocol();
  setAppMenu();
  createSplashWindow();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleDeepLink(url);
  });
});

app.on('second-instance', (_event, argv) => {
  const link = argv.find((arg) => /^zelvo(-[a-z]+)?:\/\//i.test(arg));
  if (link) handleDeepLink(link);

  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

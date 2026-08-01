# Zelvo Desktop Starter

This folder contains a production-oriented Electron starter to package Zelvo as a desktop app for macOS and Windows.

## What this starter gives you

- Shared desktop shell for all four products:
  - Frame Studio
  - Campaign Builder
  - Content Studio
  - Creative Studio
- Secure preload bridge (no Node access from renderer)
- Native app menu to jump directly to each product
- Build outputs for:
  - macOS (`dmg`)
  - Windows (`nsis` installer)

## Local run

1. In the web app root, run the web app:

   npm run dev

2. In a second terminal from the web app root:

   npm --prefix desktop install
   npm run desktop:dev

The desktop shell points to `http://localhost:3000` in dev mode.

## Build installers

From the web app root:

1. Install desktop deps once:

   npm --prefix desktop install

2. Build unpacked app for QA:

   npm run desktop:pack

3. Build signed distributables (once signing variables are set):

   npm run desktop:dist

## Build standalone product installers

From the web app root you can build dedicated installer flavors:

- Frame Studio only:

   npm run desktop:dist:frame

- Campaign Builder only:

   npm run desktop:dist:campaign

- Content Studio only:

   npm run desktop:dist:content

- Creative Studio only:

   npm run desktop:dist:creative

- All four standalone installers in one run:

   npm run desktop:dist:all

Artifacts are written to:

desktop/dist/<flavor>

## Environment and signing

### macOS signing + notarization

Set these in CI or your local shell before `desktop:dist`:

- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`
- `CSC_LINK` (base64 or file path to cert)
- `CSC_KEY_PASSWORD`

### Windows signing

Set:

- `CSC_LINK`
- `CSC_KEY_PASSWORD`

## Product entry routes

By default the app opens `/dashboard`.

You can launch directly into a product route using startup args:

- `--product=frame`
- `--product=campaign`
- `--product=content`
- `--product=creative`

## Deep-link protocols

Each flavor registers its own URL scheme:

- `shared`: `zelvo://`
- `frame`: `zelvo-frame://`
- `campaign`: `zelvo-campaign://`
- `content`: `zelvo-content://`
- `creative`: `zelvo-creative://`

Example links:

- `zelvo-frame://open?route=/frame-studio`
- `zelvo://open?route=/dashboard`

Auth callbacks can also be routed through:

- `...://auth/callback`

## Flavor model

The desktop shell now supports these build flavors:

- `shared` (full Zelvo shell)
- `frame`
- `campaign`
- `content`
- `creative`

Each standalone flavor has its own:

- app id
- product name
- executable name
- default startup route

You can keep one source codebase while shipping separate installers for each product.

## Branding assets per flavor

Flavor-specific icons are auto-detected from:

- `desktop/assets/icons/<flavor>/mac/icon.icns`
- `desktop/assets/icons/<flavor>/win/icon.ico`

Where `<flavor>` is one of:

- `shared`
- `frame`
- `campaign`
- `content`
- `creative`

If icon files are not present, packaging still works and uses default Electron icons.

Generate flavor icons from the app SVG:

- npm --prefix desktop run icons:generate

## Go-live checklist

1. Generate icons:
   - npm --prefix desktop run icons:generate
2. Install desktop dependencies:
   - `npm --prefix desktop install`
3. Set signing env vars (macOS + Windows).
4. Build QA packages:
   - `npm run desktop:pack:frame`
   - `npm run desktop:pack:campaign`
   - `npm run desktop:pack:content`
   - `npm run desktop:pack:creative`
5. Build release installers:
   - `npm run desktop:dist:all`
6. Smoke-test installers on target machines.
7. Publish download links on your website and in app announcements.

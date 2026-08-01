# Desktop Release Artifact Checklist

Date: 2026-08-01
Build command run from platform root: npm run desktop:dist:all
Result: Success for all flavors on macOS runner machine.

## Build outputs found

Frame Studio
- [x] desktop/dist/frame/Zelvo-Frame-Studio-0.1.0-mac-x64.dmg
- [x] desktop/dist/frame/Zelvo-Frame-Studio-0.1.0-mac-arm64.dmg
- [x] desktop/dist/frame/builder-effective-config.yaml

Campaign Builder
- [x] desktop/dist/campaign/Zelvo-Campaign-Builder-0.1.0-mac-x64.dmg
- [x] desktop/dist/campaign/Zelvo-Campaign-Builder-0.1.0-mac-arm64.dmg
- [x] desktop/dist/campaign/builder-effective-config.yaml

Content Studio
- [x] desktop/dist/content/Zelvo-Content-Studio-0.1.0-mac-x64.dmg
- [x] desktop/dist/content/Zelvo-Content-Studio-0.1.0-mac-arm64.dmg
- [x] desktop/dist/content/builder-effective-config.yaml

Creative Studio
- [x] desktop/dist/creative/Zelvo-Creative-Studio-0.1.0-mac-x64.dmg
- [x] desktop/dist/creative/Zelvo-Creative-Studio-0.1.0-mac-arm64.dmg
- [x] desktop/dist/creative/builder-effective-config.yaml

## Current release readiness notes

- macOS dist artifacts were built, but code signing was skipped locally because Developer ID credentials were not configured in this machine environment.
- Windows installer artifacts were not produced by this local macOS dist run. Windows installers are produced by the GitHub Actions windows-latest job in .github/workflows/desktop-build.yml.
- Before public release, run CI dist builds with signing secrets configured and verify uploaded artifacts for all matrix flavors.

## Local verifier commands

Run from desktop folder:
- npm run verify:artifacts -- frame mac
- npm run verify:artifacts -- campaign mac
- npm run verify:artifacts -- content mac
- npm run verify:artifacts -- creative mac

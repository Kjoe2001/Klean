# Desktop Go-Live Playbook

## 1. Branding assets

Generate icons before public release:

- npm --prefix desktop run icons:generate

Expected outputs:

- desktop/assets/icons/frame/mac/icon.icns
- desktop/assets/icons/frame/win/icon.ico
- desktop/assets/icons/campaign/mac/icon.icns
- desktop/assets/icons/campaign/win/icon.ico
- desktop/assets/icons/content/mac/icon.icns
- desktop/assets/icons/content/win/icon.ico
- desktop/assets/icons/creative/mac/icon.icns
- desktop/assets/icons/creative/win/icon.ico

## 2. Secrets required in CI

Configure repository secrets:

- APPLE_ID
- APPLE_APP_SPECIFIC_PASSWORD
- APPLE_TEAM_ID
- CSC_LINK
- CSC_KEY_PASSWORD

## 3. Build from GitHub Actions

Workflow file:

- .github/workflows/desktop-build.yml

Trigger options:

- Manual trigger (`workflow_dispatch`)
- Tag push matching `desktop-v*`

## 4. Local fallback builds

From platform root:

- npm --prefix desktop install
- npm run desktop:dist:all

If you only need one product:

- npm run desktop:dist:frame
- npm run desktop:dist:campaign
- npm run desktop:dist:content
- npm run desktop:dist:creative

## 5. Smoke test before publishing

Per installer test:

1. Install app
2. Login flow completes
3. Product opens default route
4. Export/save flow works
5. External links open in browser
6. Relaunch keeps session

## 6. Publish checklist

1. Upload signed installers to your download host
2. Add product download buttons on the website
3. Announce release notes in app and email
4. Keep previous version available for rollback

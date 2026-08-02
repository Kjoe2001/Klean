# Desktop Release Publish Checklist

## Release scope

- Source commit: `5cde137`
- Tag pushed: `desktop-v0.1.2`
- Workflow: `.github/workflows/desktop-build.yml`

## 1) Confirm web production

- Check homepage headers:
  - `curl -I https://www.zelvoo.app`
- Confirm login and standalone routes load in browser:
  - `https://www.zelvoo.app/login`
  - `https://www.zelvoo.app/login?standalone=1&desktopProduct=frame`
  - `https://www.zelvoo.app/signup?standalone=1&desktopProduct=frame`

## 2) Confirm desktop workflow run

- Open Actions in GitHub:
  - `https://github.com/Kjoe2001/zelvo/actions/workflows/desktop-build.yml`
- Verify run was triggered by tag `desktop-v0.1.2`.
- Ensure all matrix jobs pass:
  - macOS: `frame`, `campaign`, `content`, `creative`
  - Windows: `frame`, `campaign`, `content`, `creative`

## 3) Confirm release assets were published

- Open Releases:
  - `https://github.com/Kjoe2001/zelvo/releases`
- Open release for tag `desktop-v0.1.2`.
- Confirm expected assets exist for each flavor/platform, including:
  - macOS: `*.dmg`
  - Windows: `*.exe` and/or `*.msi`

## 4) Smoke test installers

- Install at least one macOS flavor and one Windows flavor.
- Validate app opens and routes to expected product.
- Validate auth flow:
  - login
  - signup
  - post-auth return to product screen

## 5) Post-release checks

- Validate download links on production download page.
- Record artifact URLs and checksums in release notes.
- Keep `desktop/dist/` out of git commits; upload artifacts through Release assets only.

## Fast rollback

- If critical issue appears:
  - Unpublish or mark release as pre-release in GitHub.
  - Roll back web deploy to previous successful production deployment.
  - Push hotfix commit and retag using the next version (for example `desktop-v0.1.3`).
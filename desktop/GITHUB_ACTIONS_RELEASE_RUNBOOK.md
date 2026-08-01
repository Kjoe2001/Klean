# GitHub Actions Desktop Release Runbook

This runbook covers exact trigger and tag flow for the desktop release pipeline.

Workflow file: .github/workflows/desktop-build.yml

Workflow triggers configured:
- Manual: workflow_dispatch
- Tag push: desktop-v*

Release publishing behavior:
- On `desktop-v*` tag runs, CI now publishes installer assets directly to the GitHub Release for that tag.
- Website download buttons can link to those release assets immediately after workflow completion.

## Prerequisites

Repository secrets required:
- APPLE_ID
- APPLE_APP_SPECIFIC_PASSWORD
- APPLE_TEAM_ID
- CSC_LINK
- CSC_KEY_PASSWORD

Optional but recommended before tagging:
1. Ensure desktop icons are generated:
   - npm --prefix desktop run icons:generate
2. Commit desktop changes and push to main.
3. Confirm package versions if you track release versions in artifacts.

## Trigger option A: Manual run in GitHub UI

1. Open repository on GitHub.
2. Go to Actions.
3. Select workflow named Desktop Build.
4. Click Run workflow.
5. Select branch, then Run workflow.
6. Wait for both jobs:
   - Build macOS installers
   - Build Windows installers

For tag-triggered runs, a third job runs automatically:
- Publish GitHub Release Assets

Expected matrix flavors in each job:
- frame
- campaign
- content
- creative

Verification guard in workflow:
- Each matrix job runs `npm --prefix desktop run verify:artifacts -- <flavor> <platform>` before upload.
- If expected artifacts are missing, the job fails before artifact upload.

Expected uploaded artifact groups:
- macos-frame, macos-campaign, macos-content, macos-creative
- windows-frame, windows-campaign, windows-content, windows-creative

## Trigger option B: Tag push flow

Use this when you want a release tied to a tag.

From platform repository root:
1. git fetch --tags
2. git checkout main
3. git pull --ff-only
4. git tag -a desktop-v0.1.0 -m "Desktop release v0.1.0"
5. git push origin desktop-v0.1.0

Notes:
- Any tag matching desktop-v* triggers the workflow.
- Example valid tags: desktop-v1.0.0, desktop-v2026.08.01
- CI uploads DMG/EXE/MSI files to the GitHub Release for that tag.

## Website download URL wiring

Download page route:
- /downloads

Environment variables used by website download links:
- NEXT_PUBLIC_DESKTOP_GITHUB_REPO (example: Kjoe2001/zelvo)
- NEXT_PUBLIC_DESKTOP_RELEASE_TAG (example: desktop-v0.1.0)
- NEXT_PUBLIC_DESKTOP_RELEASE_VERSION (example: 0.1.0)

Update these values whenever you cut a new desktop release tag/version.

## Post-run artifact collection checklist

1. Open the completed workflow run.
2. Download each uploaded artifact bundle.
3. Confirm every flavor has expected installer files:
   - macOS: DMG
   - Windows: EXE and or MSI depending on builder output
4. If a job failed before upload, inspect the Verify macOS artifacts or Verify Windows artifacts step first.
4. Record checksums for published files.
5. Attach release notes and publish to your download channel.

## Failure triage quick map

If macOS build fails:
- Check APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD, APPLE_TEAM_ID
- Check Developer ID certificate value in CSC_LINK and password in CSC_KEY_PASSWORD

If Windows build fails:
- Check CSC_LINK and CSC_KEY_PASSWORD
- Inspect electron-builder output for signing and target packaging failures

If only one flavor fails:
- Run local flavor command to isolate issue:
  - npm --prefix desktop run dist:frame
  - npm --prefix desktop run dist:campaign
  - npm --prefix desktop run dist:content
  - npm --prefix desktop run dist:creative

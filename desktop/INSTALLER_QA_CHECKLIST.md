# Installer QA Checklist

Use this checklist for each built installer artifact before release.

## Scope

Flavors:
- Frame Studio
- Campaign Builder
- Content Studio
- Creative Studio

Platforms:
- macOS Intel
- macOS Apple Silicon
- Windows 10
- Windows 11

## Fast pre-check commands

Run from platform root to confirm expected outputs exist:
- find desktop/dist -maxdepth 3 -type f | sort

Optional checksum capture for release records:
- shasum -a 256 desktop/dist/*/*.dmg
- shasum -a 256 desktop/dist/*/*.exe
- shasum -a 256 desktop/dist/*/*.msi

## Per-installer verification checklist

Mark each item pass or fail:

- [ ] Installer launches without OS security warnings beyond expected signed or unsigned prompts
- [ ] App installs successfully
- [ ] App opens default flavor route correctly
- [ ] Login completes and session persists after relaunch
- [ ] Billing or plan gating behaves correctly for trial and paid accounts
- [ ] Export or save action works end-to-end
- [ ] External links open in system browser, not inside the Electron shell
- [ ] App relaunches cleanly after full quit
- [ ] App can update to a newer build or roll back cleanly

## Flavor route expectations

- Frame Studio: /frame-studio
- Campaign Builder: /campaign-builder
- Content Studio: /content-studio
- Creative Studio: /creative-studio

## QA report template

Build ID or tag:
Tester:
Date:
Platform:
Flavor:
Result: Pass or Fail
Blocking issues:
- 
Non-blocking issues:
- 

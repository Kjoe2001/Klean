# Standalone Desktop Roadmap

This plan turns Zelvo products into installable desktop experiences on macOS and Windows.

## Scope

- Frame Studio
- Campaign Builder
- Content Studio
- Creative Studio

## Phase 1: Shared shell MVP (1-2 weeks)

Goal: one desktop app that opens all 4 products.

Checklist:

1. Run web app + desktop shell together in dev.
2. Validate login, billing gates, credits, exports, and media playback.
3. Add desktop signal in frontend (`?desktop=1`) for desktop-specific UX where needed.
4. Verify Frame Studio file workflows (upload, preview audio, render, save).

Exit criteria:

- Team can install app locally and use all 4 modules end-to-end.

## Phase 2: Native capability hardening (1-2 weeks)

Goal: desktop quality file handling and system behavior.

Checklist:

1. Add save/export dialogs via preload bridge.
2. Add open-file and drag/drop helpers where needed.
3. Add deep-link callback handling for auth redirects.
4. Add crash/error telemetry.

Exit criteria:

- Desktop UX feels native for content creation and exporting.

## Phase 3: Distribution readiness (1-2 weeks)

Goal: signed installers and update flow.

Checklist:

1. Apple Developer signing + notarization setup.
2. Windows code-signing setup.
3. CI build matrix for macOS + Windows.
4. Publish installers and release notes.

Exit criteria:

- Users can download trusted installers and run app without security warnings.

## Phase 4: Optional split into 4 standalone apps (2-4 days)

Goal: separate downloadable apps while keeping shared source.

Approach:

1. Add build flavors: `frame`, `campaign`, `content`, `creative`.
2. Flavor controls:
   - `productName`
   - `appId`
   - icons
   - default route
3. Produce 4 installers per OS from one pipeline.

Exit criteria:

- Dedicated installers exist for each product with distinct branding.

## Security baseline (must keep)

1. `contextIsolation: true`
2. `nodeIntegration: false`
3. Strict IPC allowlist in preload
4. No service-role secrets in renderer or desktop bundle
5. Server-side entitlement checks for plan/credits

## QA matrix before public launch

1. macOS Intel + Apple Silicon
2. Windows 10 + Windows 11
3. Login + logout + session persistence
4. Frame render/export workflows
5. Plan gating (trial vs premium)
6. Network interruptions and offline edge cases
7. Auto-update success and rollback path

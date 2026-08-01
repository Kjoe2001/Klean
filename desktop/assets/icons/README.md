# Desktop Icon Sets

Drop flavor-specific installer icons in the folders below.

Each flavor supports:

- `mac/icon.icns`
- `win/icon.ico`

Folders:

- `shared/`
- `frame/`
- `campaign/`
- `content/`
- `creative/`

Example path:

- `assets/icons/frame/mac/icon.icns`
- `assets/icons/frame/win/icon.ico`

Notes:

1. If an icon file is missing, Electron Builder falls back to its default icon.
2. Recommended source artboard is 1024x1024 before exporting `.icns` and `.ico`.
3. Keep clear product color differentiation for fast recognition:
   - Frame Studio
   - Campaign Builder
   - Content Studio
   - Creative Studio

# Supabase Storage Downloads Setup

Use this guide to make /downloads serve public installer links from Supabase Storage.

## 1. Create a public bucket

In Supabase dashboard:
1. Go to Storage.
2. Create bucket named desktop-downloads.
3. Set bucket visibility to Public.

## 2. Upload release files with tag folder

For release tag desktop-v0.1.1, upload files into this path layout:
- desktop-v0.1.1/Zelvo-Frame-Studio-0.1.1-mac-arm64.dmg
- desktop-v0.1.1/Zelvo-Frame-Studio-0.1.1-mac-x64.dmg
- desktop-v0.1.1/Zelvo-Frame-Studio-0.1.1-win-x64.exe
- desktop-v0.1.1/Zelvo-Campaign-Builder-0.1.1-mac-arm64.dmg
- desktop-v0.1.1/Zelvo-Campaign-Builder-0.1.1-mac-x64.dmg
- desktop-v0.1.1/Zelvo-Campaign-Builder-0.1.1-win-x64.exe
- desktop-v0.1.1/Zelvo-Content-Studio-0.1.1-mac-arm64.dmg
- desktop-v0.1.1/Zelvo-Content-Studio-0.1.1-mac-x64.dmg
- desktop-v0.1.1/Zelvo-Content-Studio-0.1.1-win-x64.exe
- desktop-v0.1.1/Zelvo-Creative-Studio-0.1.1-mac-arm64.dmg
- desktop-v0.1.1/Zelvo-Creative-Studio-0.1.1-mac-x64.dmg
- desktop-v0.1.1/Zelvo-Creative-Studio-0.1.1-win-x64.exe

## 3. Set website environment variables

Set these in your web deploy environment:
- NEXT_PUBLIC_DESKTOP_DOWNLOAD_BASE_URL=https://<project-ref>.supabase.co/storage/v1/object/public/desktop-downloads
- NEXT_PUBLIC_DESKTOP_RELEASE_TAG=desktop-v0.1.1
- NEXT_PUBLIC_DESKTOP_RELEASE_VERSION=0.1.1

## 4. Deploy website

After deploy, /downloads will resolve to Supabase links.

## 5. Quick validation

Open one direct URL in browser, for example:
https://<project-ref>.supabase.co/storage/v1/object/public/desktop-downloads/desktop-v0.1.1/Zelvo-Frame-Studio-0.1.1-mac-x64.dmg

If it downloads without auth, your bucket path and public visibility are correct.

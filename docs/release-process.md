# Release Process (Chrome Web Store)

This document describes the minimal steps to ship a new Tab Nudge version.

## 1. Prepare Changes

- Implement and test code changes locally.
- Update documentation as needed (README, PROJECT_STATUS.md, etc.).

## 2. Bump Version

- Update `version` in `package.json`.
- Update `version` in `public/manifest.json` to match.
- Commit with a message like: `chore: bump version to X.Y.Z`.

## 3. Build & Package

```bash
npm install
npm run package
```

This:
- Builds the extension for production.
- Normalizes HTML entry points for Chrome.
- Produces `tab-nudge-vX.Y.Z.zip` and a `.sha256` checksum in the project root.

## 4. Sanity Checks

- Load the zip in Chrome via `chrome://extensions`:
  - Enable Developer mode.
  - Use "Load unpacked" on the unzipped `dist` directory *or* install from the zip in a test profile.
- Verify:
  - Threshold alerts trigger as expected.
  - Actions (close oldest, close duplicates, group by domain, snooze) work.
  - Undo window restores tabs correctly.
  - Options page saves and loads settings.
  - Dashboard loads without console errors.

## 5. Chrome Web Store Upload

- Go to the Chrome Web Store Developer Dashboard.
- Create or update the existing item.
- Upload the new `tab-nudge-vX.Y.Z.zip`.
- Ensure:
  - Version matches `manifest.json`.
  - Listing text matches `docs/store-listing.md`.
  - Privacy Policy URL matches `docs/privacy-policy.md` content.

## 6. Tag & Document

- Tag the release in git, e.g. `vX.Y.Z`.
- Optionally create a GitHub Release with notes summarizing changes.


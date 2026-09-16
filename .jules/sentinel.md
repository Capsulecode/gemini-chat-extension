# Sentinel Security Journal

## 2026-09-16 - Validate Data URI Schemes in Extension Message Handlers
**Vulnerability:** Extension background runtime message handlers passing payload `dataUrl` directly to `fetch()` without scheme validation.
**Learning:** `fetch()` in Manifest V3 background service workers executes with extension background privileges. Accepting unvalidated URL strings from extension runtime messages could lead to unexpected SSRF or local resource fetches if passed an `http://`, `https://`, or extension file URL instead of `data:`.
**Prevention:** Always validate that incoming data URL strings start strictly with `data:` (e.g., `if (!dataUrl.startsWith('data:'))`) before invoking `fetch(dataUrl)`.

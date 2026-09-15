## 2026-09-15 - Input Validation for Data URLs in Background Runtime Messages
**Vulnerability:** Extension background runtime message handlers accepting URL payload properties (e.g. dataUrl for audio assets) passed them directly to `fetch()` without scheme validation, allowing non-`data:` URLs (such as `https://` or `file://`) to trigger arbitrary background network fetches or file access.
**Learning:** Functions designed to convert in-memory/base64 resources via `fetch(dataUrl)` must validate the string scheme before fetching when the input originates from runtime messages.
**Prevention:** Always check `dataUrl.startsWith('data:')` before calling `fetch()` on data URL parameters in extension background scripts.

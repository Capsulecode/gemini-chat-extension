## 2026-10-25 - Background Worker Data URL Scheme Validation
**Vulnerability:** `dataUrlToBlob` in the background script called `fetch(dataUrl)` on `dataUrl` strings received via extension runtime messaging without scheme validation, potentially allowing arbitrary URL fetching / SSRF in the privileged background context.
**Learning:** Functions accepting `dataUrl` strings from web extension message handlers should always explicitly check `dataUrl.startsWith('data:')` before calling `fetch()` or processing.
**Prevention:** Enforce scheme validation on string input parameters in extension background handlers and message type guards before executing network requests.

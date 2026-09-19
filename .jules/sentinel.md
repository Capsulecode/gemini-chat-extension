## 2026-09-19 - Validate `data:` Scheme Before Fetching Data URLs in Background Context
**Vulnerability:** `dataUrlToBlob` passed arbitrary strings from message payloads directly into `fetch(dataUrl)` without scheme validation.
**Learning:** `fetch()` in extension background workers can resolve remote HTTP/HTTPS URLs or internal extension resources if a payload string is not strictly a `data:` URI, creating an SSRF/unintended request vector.
**Prevention:** Always validate `dataUrl.startsWith('data:')` before passing strings received from runtime message payloads into `fetch()`.

## 2026-09-21 - Data URL Scheme Validation in Background Runtime Messages
**Vulnerability:** `dataUrlToBlob` in the background script executed `fetch(dataUrl)` on user-provided audio asset strings without validating the `data:` protocol scheme.
**Learning:** Runtime message payloads received in background scripts should not trust strings passed into `fetch()`, as non-`data:` scheme URLs could trigger arbitrary network requests or SSRF in the privileged background context.
**Prevention:** Validate URL schemes (e.g. `dataUrl.startsWith('data:')`) in runtime message type guards and helper functions before passing string URLs to `fetch()`.

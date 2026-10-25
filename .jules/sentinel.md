## 2026-10-25 - Background Worker Data URL Scheme Validation
**Vulnerability:** `dataUrlToBlob` in background scripts accepted untrusted `dataUrl` strings via extension runtime messaging and passed them directly to `fetch()`, potentially allowing SSRF or unexpected remote URL fetching from privileged background context.
**Learning:** Functions accepting `dataUrl` strings from web extension message handlers should always explicitly check `dataUrl.startsWith('data:')` before calling `fetch()` or processing.
**Prevention:** Enforce scheme validation on string input parameters in extension background handlers before executing network requests.

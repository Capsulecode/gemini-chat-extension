## 2026-09-08 - Background fetch SSRF via extension runtime messages
**Vulnerability:** `dataUrlToBlob` in background script passed message payload `dataUrl` directly to `fetch()` without scheme validation.
**Learning:** Background scripts in web extensions execute `fetch()` with broad privileges. Unsanitized URLs in extension messaging can allow content scripts or malicious pages to trigger SSRF/arbitrary requests.
**Prevention:** Always validate schemes (e.g. `dataUrl.startsWith('data:')` or `parsed.protocol === 'https:'`) in runtime message type guards and background handler functions before passing URLs to `fetch()`.

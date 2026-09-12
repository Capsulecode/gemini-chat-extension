## 2026-09-12 - Runtime Message Data URL Validation
**Vulnerability:** Background runtime message handler for saving audio assets called `fetch(payload.dataUrl)` without scheme validation, allowing potential SSRF or arbitrary fetch from background script context if message contains non-`data:` URLs (e.g. `http://` or `file://`).
**Learning:** Background scripts in WebExtensions possess privileged capabilities. Any payload string intended to represent `data:` URIs must be strictly validated for the `data:` scheme both in message type guards and prior to passing into `fetch()`.
**Prevention:** Validate `candidate.payload.dataUrl.startsWith('data:')` in message type guards and check `dataUrl.startsWith('data:')` inside `dataUrlToBlob`.

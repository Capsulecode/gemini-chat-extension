## 2026-10-22 - Validate Data URL Scheme in Background Messaging Handlers

**Vulnerability:** `dataUrlToBlob` in `responseCompleteNotification` background listener called `fetch(dataUrl)` directly on user- or message-provided data without checking the URL scheme. An attacker or compromised content script sending a runtime message could pass an `http://` or `https://` URL to trigger background network requests (SSRF / unexpected data fetching).

**Learning:** `fetch()` in Chrome extension background service workers handles `data:`, `http:`, `https:`, and extension origins seamlessly. When accepting `dataUrl` parameters over runtime messaging channels, assuming the string is always a `data:` URI without explicit prefix validation allows arbitrary URL fetching with extension privileges.

**Prevention:** Always validate that inputs expected to be Data URLs strictly begin with `data:` before passing them to `fetch()` or resource-loading APIs in privileged background contexts.

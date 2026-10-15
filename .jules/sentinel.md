## 2026-10-15 - Background Script Arbitrary Fetch / SSRF via Runtime Messages
**Vulnerability:** The background script `handleSaveNotificationAudioAsset` handler executed `fetch(dataUrl)` on `dataUrl` received via `RESPONSE_COMPLETE_NOTIFICATION_AUDIO_ASSET_SAVE_MESSAGE` runtime messages without validating the URL scheme.
**Learning:** Passing message payload strings directly to background `fetch()` allows untrusted content scripts or extension message senders to make arbitrary HTTP/HTTPS or local requests with extension privileges.
**Prevention:** Always validate that runtime message payloads containing URLs adhere strictly to expected schemes (e.g. `data:`) before initiating network or resource fetches in background contexts.

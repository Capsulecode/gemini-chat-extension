## 2026-09-18 - Input URL Validation for Content Script Navigations
**Vulnerability:** Unvalidated URL string passed to `window.open` or background messaging in content scripts could allow `javascript:` execution (XSS) or open redirects to external origins.
**Learning:** `window.open(url)` or extension tab creation requests in content scripts must always parse and validate `parsed.protocol` (`http:`/`https:`) and `parsed.origin` against `window.location.origin` before invocation.
**Prevention:** Always parse URLs with `new URL(url, window.location.origin)` and verify protocol and origin before opening new tabs or passing URLs to extension runtime messages.

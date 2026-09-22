## 2026-09-22 - Firefox background runtime message listener input validation
**Vulnerability:** Runtime message listeners receiving non-object or null message payloads could throw uncaught runtime exceptions when evaluating type guards or property access.
**Learning:** Browser runtime message handlers (`browser.runtime.onMessage`) can receive unexpected or primitive values from malformed messages.
**Prevention:** Always validate that incoming runtime `message` parameter is a non-null object before calling message type guards or accessing properties.

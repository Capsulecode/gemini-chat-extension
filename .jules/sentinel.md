## 2026-10-21 - Remove Raw User Session Network Dumps from Test Suite
**Vulnerability:** Test file `src/utils/stuffMediaParser.test.ts` attempted to read raw captured network request dumps from `.original/library/request.md`, which could contain real user session tokens, internal RPC payloads, or personal image URLs.
**Learning:** Captured network fixtures should not be saved as unversioned local markdown/text dumps where sensitive session data can easily leak or cause ENOENT test breakages in clean checkouts.
**Prevention:** Construct sanitized synthetic mock payloads inline or in controlled, sanitized sample fixtures for unit test cases.

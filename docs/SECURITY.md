# Security and Privacy Checklist

## Authentication
- Hash passwords with a maintained password-hashing algorithm and appropriate work factor (bcrypt or Argon2id).
- Prefer secure, HttpOnly, SameSite cookies for browser sessions/tokens when architecture permits; protect state-changing requests against CSRF if cookie auth is used.
- If using JWT, keep access tokens short-lived, validate signature/issuer/audience/expiry, rotate refresh tokens, revoke sessions on logout/password reset, and never put secrets or sensitive personal data in claims.
- Rate-limit login and recovery endpoints; avoid account-enumeration messages.
- Use MFA for privileged roles if feasible.

## Authorization
- Deny by default and check permissions on every server-side operation.
- Enforce department/record scope in database queries, not only in UI.
- Test insecure direct object reference cases by changing IDs.
- Keep the optimizer service private; authenticate service-to-service calls.

## Data protection
- Use TLS in deployment.
- Keep secrets in environment variables or a managed secret store.
- Commit `.env.example`, never real `.env`.
- Use synthetic student/faculty data in development and screenshots.
- Define retention, backup, restore, export, and deletion policies with the institution.
- Avoid logging passwords, tokens, full personal records, or sensitive payloads.
- Restrict CSV/PDF export and audit log access.
- Encrypt backups and limit access to them.

## Application security
- Validate and normalize all input server-side.
- Use ORM parameterization; do not concatenate user input into SQL.
- Configure CORS narrowly, secure headers, request size limits, and rate limiting.
- Protect file uploads/imports with size/type checks and safe parsing.
- Patch dependencies and run dependency/security checks.
- Return safe error messages with correlation IDs.
- Record important actions: login events, eligibility-rule changes, schedule generation, approval, publication, rescheduling, exports, role changes.

## Release gates
- No high-severity known vulnerability left unreviewed.
- Authorization tests cover every role and scoped resource.
- Backup restore has been tested.
- `.env` and personal data are absent from Git history.
- Production uses separate credentials and database from development.

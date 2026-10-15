# Environment, CI, and Release Checklist

## Environment configuration
Create `.env.example` with placeholders only. Typical variables may include:
- `NODE_ENV`
- `API_PORT`
- `DATABASE_URL`
- `WEB_ORIGIN`
- `AUTH_SECRET` or provider-specific auth configuration
- `OPTIMIZER_BASE_URL`
- `OPTIMIZER_SERVICE_TOKEN`
- optional `REDIS_URL` only if Redis is actually used
- email provider configuration only after provider selection

Do not paste actual secrets into this document. Validate required environment variables at startup and fail with a safe, clear error.

## Local development
Document prerequisites and exact tested versions for Node.js, package manager, Python, PostgreSQL, and OR-Tools. Add repeatable scripts for install, migrate, seed, dev, lint, type-check, test, and build.

## CI gates
- Dependency install from lockfiles.
- Formatting check.
- Lint.
- Type check.
- Unit and integration tests.
- Optimizer tests.
- Production build.
- Dependency audit / secret scanning where practical.

## Production release checklist
- [ ] Environment variables configured in a secret store.
- [ ] Database backup taken and restore procedure verified.
- [ ] Migrations reviewed and applied in a controlled release.
- [ ] Health/readiness checks pass.
- [ ] Authentication and scoped authorization verified.
- [ ] Solver infeasibility and timeout behavior verified.
- [ ] No unvalidated or unapproved timetable can be published.
- [ ] Monitoring and error logs are available without sensitive payloads.
- [ ] Rollback plan documented.
- [ ] User guide and operational owner identified.

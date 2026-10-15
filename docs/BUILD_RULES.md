# Build Rules for Antigravity

## Agent workflow
For every phase:
1. Inspect the current repository and report what exists.
2. Restate the phase goal, scope, assumptions, and acceptance criteria.
3. Propose files to create/change.
4. Wait for approval if the work changes architecture, schema, dependencies, or security.
5. Implement only the approved phase.
6. Run formatting, lint, type-check, tests, and build where available.
7. Report exact commands run, outcomes, known failures, and next steps.
8. Update `docs/PHASES.md` and relevant documentation.

## Do not
- Implement every phase in one prompt.
- invent university eligibility rules or silently decide official policies.
- use in-memory arrays as the production database.
- put database access, optimization, and HTTP handlers in one giant file.
- commit `.env`, credentials, private keys, or real student records.
- trust a role or user ID sent by the browser.
- return stack traces or sensitive internals to users.
- auto-publish a timetable from the solver.
- use Redis just because it is listed in the synopsis; explain and implement a real use case first.
- claim tests passed unless commands were actually executed and results inspected.

## Preferred repository shape
```text
nexora/
  apps/
    web/                    # React + TypeScript
    api/                    # Express + TypeScript
  services/
    optimizer/              # Python + OR-Tools
  packages/
    contracts/              # shared API schemas/types if appropriate
  prisma/
    schema.prisma
    migrations/
  docs/
  scripts/
  .env.example
  .gitignore
  README.md
```
This is a target shape, not a requirement to create a monorepo if the team chooses separate repositories. Make the decision explicit before scaffolding.

## Engineering conventions
- TypeScript strict mode.
- ESLint + Prettier.
- Zod or an equivalent schema validator at API boundaries.
- Consistent error format and HTTP status codes.
- Pagination for list endpoints.
- UTC timestamps in storage; display institution-local time consistently.
- IDs should be stable identifiers, not student roll numbers.
- Database constraints should enforce uniqueness and referential integrity where possible.
- Add indexes based on actual query patterns.
- Use migrations and seed scripts with synthetic data.

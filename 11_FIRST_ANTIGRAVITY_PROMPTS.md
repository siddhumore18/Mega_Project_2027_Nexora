# Antigravity Prompts — Use One at a Time

## Prompt 1: Review only
Read `project.md` and all files in `docs/`. Do not edit or create files yet. Summarize the system, identify contradictions or missing decisions, list the highest risks, and propose a Phase 0 plan with acceptance criteria. Clearly separate facts from assumptions.

## Prompt 2: Phase 0 artifacts
Create only the Phase 0 artifacts agreed in the plan: a decision log, glossary, requirements questions for the examination cell, and risk register. Do not implement application code.

## Prompt 3: Scaffold
Implement Phase 1 only. Inspect the repository first. Propose the directory structure and dependency versions, then scaffold the minimum project, environment examples, health endpoints, lint/type-check/test/build scripts, and CI. Do not implement business features or database schema yet. Run checks and report actual results.

## Prompt 4: Database
Implement Phase 2 only after the domain model is approved. Create migrations and synthetic seed data. Add tests for foreign keys and unique constraints. Do not invent unresolved academic policies.

## Prompt 5: Authentication
Implement Phase 3 only. Before coding, explain the chosen session/token design and threat mitigations. Enforce authorization server-side and add negative tests for every role and data scope.

## Prompt 6: Scheduling engine
Implement a tiny OR-Tools prototype with synthetic fixtures before integrating it into the product. Demonstrate feasible, infeasible, and unknown/timeout outcomes. Add independent hard-constraint validation and do not implement publishing yet.

## Prompt 7: Phase review
Review the current implementation against `docs/PHASES.md`, the relevant acceptance criteria, security rules, and test strategy. Do not make changes until you produce a prioritized gap report. After approval, fix only the agreed gaps.

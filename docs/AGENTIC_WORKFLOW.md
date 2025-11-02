# Spec-to-PR Agentic Workflow

Treat AI like a junior dev that turns a feature ticket into a ready PR.

## Flow Summary

1. Write a ticket file: `FEATURES/<id>-<slug>.md`.
2. Ask the AI: `@workspace plan this feature`.
3. It produces plan: file list, scaffolds (`ng g`), diffs.
4. You approve → AI writes code + tests following `ARCHITECTURE.md`, `CODING_GUIDELINES.md`, `AI_GUIDE.md`.
5. You run tests / light fixes → merge.

## Ticket Template (Drop-In)

```markdown
# Feature: <Title>

## Problem
Describe user need.

## Acceptance Criteria
- Routes / navigation.
- Persistence endpoints.
- Optimistic UI + rollback strategy.
- Test scope (unit + e2e).

## UX
High level layout + accessibility notes.

## Data Contracts
- API path (OpenAPI reference).
- Local state schema path.

## Implementation Plan (AI generates concrete commands)
- Routes file changes.
- Components (list).
- Services / state store.
- Telemetry or logging.

## Done Means
Clear, testable definition.
```

## Sample Ticket: User Preferences

See `FEATURES/123-user-preferences.md`.

## Approval Checklist

- Plan lists all files (no unexplained extras).
- Uses modern Angular control flow (`@if/@for`).
- Signals + `input()/output()/model()` where appropriate.
- Tests included (service + component + e2e stub).
- Styling is Tailwind-first.

## After Merge

Delete ticket or mark DONE, keep schema + docs.

---
TL;DR: One markdown spec → AI plan → scaffold → code + tests → PR.

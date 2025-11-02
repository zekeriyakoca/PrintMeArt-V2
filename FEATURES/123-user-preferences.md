# Feature: User Preferences Panel

## Problem

Users need to edit language, theme, and notification settings.

## Acceptance Criteria

- From `/settings`, users open `/settings/preferences`.
- Persist choices in `/api/v1/users/{id}/preferences`.
- Optimistic UI; rollback on 4xx/5xx with toast.
- Unit tests for component/service; e2e flow.

## UX

- Lazy loaded route; initial skeleton while loading.
- Tailwind layout; accessible form (labels, aria-live for save result).

## Data Contracts

- API path: `/users/{userId}/preferences` (document in spec before building).
- Local state schema: `SCHEMAS/feature_state/user-preferences.json`.

## Implementation Plan (AI generates exact)

- Route: add `preferences` child to settings routes file.
- Component: `preferences.component.{ts,html,spec.ts}`.
- Service: `preferences.service.ts` (signals: `prefs`, `saving`, `error`).
- Store: optional `preferences.store.ts` if derived signals grow.
- Telemetry: log `settings_preferences_saved`.

## Edge Cases

- Network fail → rollback form + toast.
- Server sends unsupported theme → default to `system`.

## Done Means

- Passing unit + e2e tests.
- Accessible form verified.
- Route appears in navigation.
- Docs/schema updated.

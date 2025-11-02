# AI Guide for This Angular Repo

## Immutable Rules

1. Use Angular 20 standalone components + OnPush.
2. Prefer Signals; RxJS only for external async streams.
3. No BehaviorSubjects inside components.
4. Tailwind utilities first; minimal SCSS.
5. Each new feature: route + schema JSON + tests + OpenAPI alignment.
6. Never introduce state libs without updating `ARCHITECTURE.md`.
7. All services return typed interfaces; no `any`.

## Checklist BEFORE Writing Code

- [ ] OpenAPI endpoint defined or stubbed in `API/openapi.yaml`. (when exist)
- [ ] State shape added/updated under `SCHEMAS/feature_state/*.json`.
- [ ] Routes planned (`app.routes.ts`) and lazy loading considered.
- [ ] i18n keys identified (if user-facing strings). (when exist)
- [ ] Error handling path (interceptor signal or typed Result) chosen.
- [ ] Tests planned (unit + e2e stub name).(when exist)

## Component Rules

- Use `@for`, `@if` control flow syntax.
- Dynamic classes: prefer direct Tailwind strings; `[class]` only when conditional.
- UI state: `const foo = signal<Type>(initial)`; derived: `const bar = computed(() => ...)`.

## Service Pattern

```typescript
@Injectable({ providedIn: 'root' })
export class ExampleService {
  data = signal<Model[]>([]);
  constructor(private http: HttpClient) {}
  load() {
    return this.http.get<Model[]>(url).pipe(tap(d => this.data.set(d)));
  }
}
```

## Error Handling Pattern (Target)

```typescript
export interface ApiError { status: number; code: string; message: string; }
// Interceptor maps HttpErrorResponse -> ApiError
// Service either throws or sets error signal
error = signal<ApiError | null>(null);
```

## Testing Pattern

- Component: render with Testing Library; assert DOM + signals.
- Service: mock HttpClient, assert signal mutation.
- E2E: Playwright scenario under `e2e/<feature>/feature.spec.ts`.

## Golden References

- State mutation: `CartService.addItemToCart`.
- Guard style: `AuthenticationGuard` (final form will include redirect & token check).

## Do NOT

- Use magic numbers or strings; elevate to constants/interfaces.
- Hardcode API URLs; use `environment.serviceUrls`.
- Access window/document without SSR guard.

## Output Format When AI Adds Code

1. List of new/edited file paths.
2. Provide full file contents (no ellipses, no TODO placeholders).
3. Include or update tests & docs simultaneously.

## Performance

- Use `@defer` for heavy route-level components or large lists.
- Avoid unnecessary subscriptions; convert Observables to signals.

## Security & Data

- Sanitize any HTML injection.
- Never log sensitive tokens.

---

Follow this document rigorously. Deviations must be justified by updating the docs first.

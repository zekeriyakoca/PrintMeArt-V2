# Coding Guidelines

Purpose: Fast to read rules for writing and reviewing code in this repo. Keep changes small, typed, and consistent.

## Scope

Angular 20 standalone app using Signals, TailwindCSS, small SCSS, HttpClient. Favor modern APIs (`@if`, `@for`, `input()`, `output()`, `model()`, `inject()`, `toSignal()`).

## Components

- Standalone only. No NgModules.
- Use `@if`, `@for`, `@switch` (avoid legacy `*ngIf`, `*ngFor`).
- Keep templates lean: data prep in class via computed signals.
- Track loops: `@for (item of items(); track item.id)`.
- Avoid large multi-purpose components; split for clarity.

## Inputs / Outputs / Model

- Use `input<T>()` and `output<T>()` helpers. Example:
  
  ```typescript
  readonly product = input.required<ProductDto>();
  readonly added = output<ProductDto>();
  ```
  
- Required when component cannot work without it (`input.required<T>()`).
- Use `model()` for two-way binding over manual `[value]` + `(valueChange)` when available.
- Never use `any`; always typed interfaces.

## Signals & State

- Writable: `signal<T>()`; derived: `computed(() => ...)`.
- No in-place mutation of arrays/objects; replace with new copies.
- Shared state lives in services (cart, filters, auth). Components stay dumb.
- Convert external Observables to signals with `toSignal()` when UI needs them.

## RxJS

- Keep RxJS logic in services, not templates.
- Use pipe operators for transformation, then set signals inside `tap` or result subscription in service.
- Unsubscribe by avoiding component-level manual subscriptions (expose signals instead).

## Services

- One responsibility (cart, products, auth). Keep functions short (<50 LOC).
- Inject dependencies with `constructor` or `inject()` for simple cases.
- Expose signals + mutation methods; avoid exposing raw HttpClient calls to components.
- Map errors to a simple `{ status, code, message }` shape (planned interceptor).

## Styling

- Tailwind utilities first; SCSS only for complex selectors or animations.
- Use readable ordering: layout | spacing | color | typography.
- Avoid deep nested SCSS (>2 levels). No global overrides.

## Error Handling

- Central interceptor (planned) converts `HttpErrorResponse` to `{ status, code, message }`.
- Service sets `error` signal. UI displays toast/banner.
- No permanent `console.log`; use a `LoggerService` (planned) for structured logging.

## Performance

- Track keys in lists; avoid creating new functions inline in template.
- Use `@defer` for heavy async sections or large lists.
- Use computed signals instead of recalculating in template.

## Testing

- Unit tests for services (mock HttpClient) and components with logic.
- Keep presentational-only components optional for tests.
- Use Testing Library for components; assert DOM + signal changes.
- E2E (Playwright) for core flows (add to cart, checkout path).

## Accessibility

- Semantic HTML elements, not div soup.
- Provide `<label for>` with matching `id` for form inputs.
- Add `alt` text for images that convey meaning.

## Security & SSR

- Guard browser APIs with platform check when SSR matters.
- Sanitize any user-provided HTML before rendering.
- Do not store tokens in signals; use interceptor for auth headers.

## Naming

- Components: `app-<feature>-<name>`.
- Services: `<Name>Service`.
- Signals/fields: concise nouns (`products`, `cartItems`, `loading`).
- Avoid misleading abbreviations.

## PR Checklist

1. Interfaces updated.
2. Service + signals added/changed.
3. Component implemented with modern APIs (`@if/@for`, `input()/output()/model()`).
4. Tests added or updated.
5. Styling follows Tailwind-first rule.
6. Error handling path respected.
7. No lint/type errors.
8. Architecture doc updated if rules changed.

## Anti-Patterns

| Bad | Why | Fix |
|-----|-----|-----|
| `BehaviorSubject` in component | Verbose, manual subscription | Use `signal<T>()` |
| Direct array mutation `items.push(x)` | Hard to track changes | `items.set([...items(), x])` |
| `*ngFor` / `*ngIf` in new code | Legacy syntax | Use `@for` / `@if` |
| Long chained template expressions | Hard to read, re-run cost | Move logic to computed signal |
| Hardcoded API URL | Environment drift | `environment.serviceUrls` |
| Giant SCSS blocks for utility-able styles | Inconsistent | Use Tailwind utilities |

## Example Micro Component

```typescript
@Component({
  selector: 'app-add-to-cart',
  standalone: true,
  template: `
    @if (product()) {
      <button (click)="add()" class="px-3 py-2 bg-blue-600 text-white rounded">Add {{ product().name }}</button>
    }
  `,
})
export class AddToCartComponent {
  readonly product = input.required<ProductDto>();
  readonly added = output<ProductDto>();
  private cart = inject(CartService);
  add() {
    this.cart.add(this.product());
    this.added.emit(this.product());
  }
}
```

---
Follow these. If you need a new pattern, update this file first.

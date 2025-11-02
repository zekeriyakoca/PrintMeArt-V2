# Project Architecture

Goal: Show what the app does, how it is built, and the rules for adding code.

## What This App Is

Angular 20 standalone app (SSR optional).

Domain: art prints (products, options, cart, checkout).
Styling: Tailwind utilities + small SCSS where needed.
State: Signals (component) + service signals (shared).
HTTP: HttpClient (typed models).
Interceptors: auth header + error mapping(planned):.
Guard (planned): block private routes.
Auth (planned): proper authentication for production

## Core Pieces

- Pages: route components in `src/app/pages`.
- Components: reusable UI pieces in `src/app/components`.
- Services: data + business logic in `src/app/services`.
- Models: interfaces in `src/app/models` (mirror API).
- Interceptors: auth, error (planned) in `src/app/interceptors`.
- Shared helpers: `src/app/shared`.
- State schemas: JSON in `SCHEMAS/feature_state`.

## Routes (Typical)

```text
/, /login, /products, /products/:productId, /cart, /checkout, /about
```

Auth guard will protect private routes later (not active yet).

## State Rules

- `signal<T>()` for writable data.
- `computed()` for derived values.
- No direct mutation; use `.set(newArrayOrObject)`.
- Shared state lives in a service.
- No `BehaviorSubject` in components.

## HTTP Pattern

Service wraps HttpClient: update signal first (optimistic) → call API → replace with server data or set error. Base URLs from `environment.serviceUrls`.

## Error Handling (Target)

Planned interceptor maps errors to `{ status, code, message }`. Service sets an `error` signal. UI shows a toast or banner. Avoid permanent `console.log`.

## Styling Rules

Tailwind classes first. SCSS only for complex selectors or animations. Avoid deep nesting.

## Performance

- Track items in `@for` (`track item.id`).
- Use `@defer` for heavy sections.
- Convert Observables to signals.

## Security & SSR

Guard browser-only APIs (`window`, `document`, `localStorage`). Sanitize any user HTML. Do not store tokens in signals.

## Accessibility

Use semantic elements. Add `<label for>` for inputs. Provide `alt` text for images.

## Adding a Feature (Checklist)

1. Define/extend model interfaces.
2. Add/adjust OpenAPI endpoint.
3. Add schema JSON file.
4. Create/update service (signals + error).
5. Add route + page component (or plain component if not a page).
6. Update this file if a rule changes.
7. Run lint, type checks.

## AI Output Contract

When AI adds code it must:

1. List changed or new file paths.
2. Show full file contents (no ellipses or TODO placeholders).
3. Give a short (1–2 sentence) reason for each non-trivial change.

## Anti-Patterns (Avoid)

| Bad | Why | Do Instead |
|-----|-----|------------|
| `BehaviorSubject` in component | Verbose, unneeded | `signal<T>()` |
| Hardcoded API URL | Env drift | `environment.serviceUrls` |
| Untracked `@for` | Extra re-renders | `@for (... track item.id)` |
| Subscribing in component for side effects | Hard to test | Move logic to service + signals |
| Heavy SCSS for simple styling | Inconsistent | Tailwind utilities |

## Simple Service Example

```typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly base = environment.serviceUrls.api;
  items = signal<CartItemDto[]>([]);
  error = signal<ApiError | null>(null);
  constructor(private http: HttpClient) {}
  add(item: NewCartItemDto) {
    const optimistic = [...this.items(), item];
    this.items.set(optimistic);
    return this.http.post<CartItemDto>(`${this.base}/cart`, item).pipe(
      tap({
        next: saved => this.items.set(this.items().map(i => i === item ? saved : i)),
        error: e => this.error.set(mapError(e))
      })
    );
  }
}
```

## Simple Component Pattern

```typescript
@Component({
  selector: 'app-product-list',
  standalone: true,
  templateUrl: './product-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class ProductListComponent {
  products = signal<ProductDto[]>([]);
  search = signal('');
  filtered = computed(() => this.products().filter(p => p.name.toLowerCase().includes(this.search().toLowerCase())));
  trackProduct = (i: number, p: ProductDto) => p.id;
}
```

## Open Items

- Implement error + auth interceptors.
- Add logging service.
- Add computed pricing helper.

---
If a change needs a new rule, update this file first.

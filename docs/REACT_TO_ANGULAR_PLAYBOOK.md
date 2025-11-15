# React → Angular Migration Playbook (Temporary)

## Scope
Input: React component (JSX/TSX) using Tailwind.  
Output: Angular 17+ standalone component(s) with OnPush, Signals for local state, Tailwind, tests.

This playbook exists only during the UI migration phase. Once all legacy React code is ported, archive or delete it. All automation (AI commands) MUST follow the hard rules and mapping tables here plus the global `ARCHITECTURE.md` and `CODING_GUIDELINES.md`.

## Hard Rules

- **Standalone** components (`standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`).
- **State**: Angular **signals** for local UI; RxJS only for async sources.
- **Inputs/Outputs**: React props → `@Input()`; callbacks/emitters → `@Output()` with `EventEmitter`.
- **Styles**: Keep Tailwind classes as-is in templates.
- **Forms**: Use Reactive Forms if form-like.
- **DI**: Use constructor inject; no service singletons in components.
- **Routing**: Lazy routes for pages; shared UI goes under `/src/app/shared/components/`.
- **Testing**: Jest + @testing-library/angular. Write at least: render + aria + event emits.
- **Control Flow**: Replace `cond && <A/>` with `@if (cond) { <A/> }`; `array.map(...)` with `@for (item of items; track item.id) { ... }`.
- **No legacy decorators**: Prefer `input()`, `output()` factory functions if we later adopt them—keep traditional `@Input/@Output` until repo-wide switch.
- **Accessibility**: Preserve roles/aria-labels from React; add labels if missing.

## Mapping Cheatsheet

- JSX → Angular template (`.html`). Self-close to paired tags as needed.
- `className` → `class`; conditional classes → `ngClass` (prefer `[class.foo]="cond"` for simple flags).
- Props (default values) → `@Input({ required: false })`. Provide sane defaults.
- Event props like `onClick` → `@Output() clicked = new EventEmitter<...>();` and `(click)="clicked.emit(...)"`.
- Internal `useState` → `const count = signal(0)`.
- Derived values → `computed(...)`.
- Effects → `effect(() => { ... })` (avoid side-effects in `computed`).
- Portals/Fragments → plain container nodes.
- Icons: replace with your icon lib; document in “Replacements” below.
- `cond && <Comp/>` → `@if (cond) { <app-comp/> }`
- Ternary output `<div>{cond ? 'A' : 'B'}</div>` → `@if (cond) { A } @else { B }`
- `{list.map(item => <Row key={item.id} x={item.x}/>)}` → `@for (item of list; track item.id) { <app-row [x]="item.x"/> }`
- `Fragment <>...</>` → container `<div>...</div>` or remove if not needed.
- Context usage → pass data via inputs OR create small service (signal store) scoped at feature module boundary.

## File Layout Output (example)

- `/src/app/shared/components/<kebab-name>/<kebab-name>.component.ts|html|spec.ts`
- `/src/app/shared/components/<kebab-name>/index.ts` (barrel)
- Optional styles file only if absolutely required (Tailwind preferred).

## Replacements

- Headless UI/Framer → native Angular + Tailwind motion (or your animation util).
- `clsx/cn` → inline class binding.
- Unknown libs: replace with minimal equivalent or TODO comment **with suggestion and link**.

## Done Checklist (enforce)

- [ ] Compiles with strict TS.
- [ ] No `any` in public API.
- [ ] Inputs documented via TSDoc.
- [ ] Emits covered by tests.
- [ ] Accessibility: labels/roles/aria-live where needed.
- [ ] Control flow uses `@if/@for` not `*ngIf/*ngFor` for new code (unless blocked by library constraints).
- [ ] Signals used for local mutable state (no Subjects unless streaming external source).
- [ ] Tailwind classes preserved or improved (no inline style regressions).

---

## 1. Automation Overview

AI migration command transforms a React component into Angular artifacts:

1. Parse React source (props, default values, hooks, effects, events, external libs, Tailwind classes, accessibility markers).
2. Generate Migration Spec JSON (see Schema section) and place under `SCHEMAS/migration/`.
3. Propose file tree (component + spec + test) as a diff in planning phase.
4. Produce Angular component + template + spec with mapping rules.
5. Insert TODO comments for any unsupported patterns (listed under Limitations).
6. Run lint + tests (user triggers) and adjust until clean.

## 2. Migration Spec Schema (reference)

Path: `SCHEMAS/migration/react-component-migration.json` (see file for authoritative schema). Fields capture enough to trace decisions: props, outputs, state, effects, external libraries, accessibility, and test matrix.

## 3. Migration Ticket Template

Use when requesting AI to migrate a component.

```markdown
# Migrate React Component: <Readable Name>
ID: migrate-XXX
Source Path: <path/to/Component.tsx>
Category: shared|feature|page

## Intent
Short description of what component does and why migrating now.

## Props
| Name | Type | Default | Required | Notes |
|------|------|---------|----------|-------|
|      |      |         |          |       |

## Events (Callbacks)
| Name | Payload Interface | Triggers | Notes |
|------|-------------------|----------|-------|
|      |                   |          |       |

## Internal State (React)
List `useState` variables + purpose.

## Effects
Summaries of each `useEffect` (deps, side-effects).

## External Dependencies
Libraries or hooks to substitute.

## Accessibility
Existing roles/aria and any gaps.

## Testing Targets
- Render with minimal props
- Event emit scenarios
- Accessibility roles
- Conditional rendering branches

## Risks / Edge Cases
List complex patterns (context, portals, dynamic keys...)

## Desired Angular Outputs
- Component name
- Inputs/Outputs names
- Services (if needed)
- Signal store notes

## Done Means
Expanded checklist from playbook applied.
```

## 4. AI Command Cheatsheet

- `@workspace plan-react-migration <path>` → produce migration spec draft + file tree.
- `@workspace apply-react-migration <id>` → generate component + tests from approved spec.
- `@workspace review-react-migration <id>` → summarize diffs vs rules.

Outputs MUST avoid guessing types; use explicit interfaces when unclear and mark with `TODO: refine type`.

## 5. Detailed Mapping Table

| React Concept | Angular 20 Equivalent | Notes |
|---------------|-----------------------|-------|
| Prop default  | `@Input()` + default field value | Avoid optional chaining defaults if not needed. |
| Callback prop | `@Output() eventName = new EventEmitter<Payload>()` | Event name kebab-case in template, camelCase in class. |
| `useState`    | `const value = signal<T>(initial)` | Keep types explicit. |
| Derived calc  | `const derived = computed(() => ...)` | No side-effects. |
| `useEffect` (DOM/event listener) | `effect(() => { ... })` | Cleanups inside effect body return function. |
| Conditional render `cond && <X/>` | `@if(cond){ <app-x/> }` | Multi-branch use `@if/@else`. |
| List render `.map()` | `@for(item of items; track item.id){...}` | Provide tracking strategy. |
| Context        | Service with signals OR inputs cascade | Choose service if >2 nested levels. |
| Portal         | Regular template or optional structural directive | Most cases remove. |
| Fragment       | Remove or minimal wrapper `<div>` | Keep semantics. |
| CSS Modules    | Tailwind utility classes | Move uncommon styles to component SCSS. |
| Suspense/Lazy  | Angular router lazy or deferred loading | Use skeleton placeholders. |
| ErrorBoundary  | Global error handler + localized *ngIf/`@if` fallback | Provide fallback template. |
| Ref access     | `ViewChild/ElementRef` signals | Limit direct DOM usage. |

## 6. State & Signals Strategy

Local signals only if:

- State pertains strictly to visual concerns.

Elevate to a service (signal store) when:

- Shared across sibling routes/components.
- Requires caching or persistence.
- Derived signals complexity > 2 computed chains.

Rules:

- Use `computed` for pure derivations.
- Use `effect` for performing side-effects: event listeners, logging, service calls triggered by state.
- Never mutate signals inside templates—only via explicit methods.

## 7. Event & Output Patterns

Conventions:

- Output names: `<noun><Action>` e.g. `cartItemAdded`, payload typed interface.
- If payload equals single primitive, still wrap in interface if expand likely.

Interfaces live in `src/app/models/` or colocated if very specific.

## 8. Testing Rules

Use @testing-library/angular.

Must cover:

- Rendering default + with key prop variations.
- Each output emits expected payload.
- Accessibility roles/aria attributes present.
- Conditional branches: one positive, one negative path.
- Snapshot tests are forbidden—assert semantics not markup shape.

Signals:

- Use `componentInstance.signalName()` to read current value.
- Test computed correctness after state mutation.

## 9. Edge Cases & Fallbacks

- Complex context hierarchies → create intermediate service.
- Third-party headless libs → replicate minimal behavior or TODO with link.
- Dynamic class builders (`clsx`) → inline `[class.foo]` or computed string.
- Portals/modals → Use existing modal service/component.
- `forwardRef` patterns → usually unnecessary; ignore unless circular.
- `dangerouslySetInnerHTML` → sanitize + `innerHTML` binding with security review.

## 10. Limitations (Mark TODO)

- React Suspense advanced waterfalls.
- Deep portal layering requiring DOM stacking contexts.
- Unmigrated animation libs (Framer specifics).
- Complex drag/drop requiring rewrite.
- Non-TypeScript prop typing (implicit any) → TODO refine.

## 11. Example Migration (Mini)

React Input:

```tsx
export function Counter({ start = 0, onChange }) {
  const [count, setCount] = useState(start);
  return (
    <button className="px-2 py-1 bg-blue-600 text-white" onClick={() => {
      const next = count + 1;
      setCount(next);
      onChange?.(next);
    }}>Count: {count}</button>
  );
}
```

Angular Output (simplified):

```ts
// counter.component.ts
@Component({
  selector: 'app-counter',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './counter.component.html'
})
export class CounterComponent {
  @Input() start = 0;
  @Output() change = new EventEmitter<number>();
  count = signal(this.start);
  increment() {
    const next = this.count() + 1;
    this.count.set(next);
    this.change.emit(next);
  }
}
```

```html
<!-- counter.component.html -->
<button class="px-2 py-1 bg-blue-600 text-white" (click)="increment()">Count: {{ count() }}</button>
```

Test Sketch:

```ts
it('emits change', async () => {
	const { fixture } = await render(CounterComponent, { componentInputs: { start: 2 } });
	const btn = screen.getByRole('button');
	fireEvent.click(btn);
	// expect emitted value (use spy on output)
});
```

## 12. Expanded Done Checklist

- [ ] Migration spec JSON added.
- [ ] Ticket created and linked.
- [ ] Component + template + spec generated.
- [ ] Mapping table followed (no stray React idioms).
- [ ] Accessibility validated.
- [ ] All TODOs reviewed or approved for later.

---

## 13. Removal Criteria

Remove this playbook when:

- 0 remaining React components.
- All migration specs closed.
- No open TODOs tagged `migration`.

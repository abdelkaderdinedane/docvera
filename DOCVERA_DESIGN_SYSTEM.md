# Docvera Design System

Reference for Docvera-specific UI patterns layered on top of the upstream paperless-ngx interface.

**Scope note**: this document currently contains only the sections that have actually been specified
and implemented so far, across "Increment 1" (empty states, loading states, error states,
accessibility). It is not a complete design system — sections not listed here (numbering below starts
at 5.7 because that's where this increment's work began) either don't exist yet or live outside this
repository. Do not assume gaps in the numbering are documented elsewhere in this repo; they simply
aren't written yet. Extend this file in place as later increments define more of it, rather than
starting a second document.

---

## 5.7 Empty states

**Component**: `pngx-empty-state` — `src-ui/src/app/components/common/empty-state/`

**Problem it replaces**: ad hoc plain-text messages ("No tags defined.", "No workflows yet.") rendered
directly in list templates, inconsistent in tone, with no visual weight and no next action for the user.

**Pattern**: icon + heading + one-sentence body explaining *why* it's empty and *what to do* + optional
primary action. Rendered consistently across every list, table, and panel in the app.

**Inputs**:

| Input | Type | Default | Notes |
|---|---|---|---|
| `icon` | `string` | `'inbox'` | Bootstrap icon name |
| `heading` | `string` | `''` | Short heading, plain language |
| `headingLevel` | `number` | `2` | ARIA heading level via `role="heading"`/`aria-level`, not a real `<hN>` — see [§7](#7-accessibility-wcag-21-aa); safe default for a component placed at varying page depths |
| `body` | `string` | `''` | One sentence: why it's empty, what to do |
| `actionLabel` | `string` | `null` | Omit to render without an action |
| `actionLink` | `string` | `null` | Router link for the action |
| `compact` | `boolean` | `false` | Reduced padding/type scale for use inside cards, dropdowns, modals |

**Usage rule**: import `EmptyStateComponent` and use it in place of any bare "No X yet"/"No X
defined" text. Copy should follow the pattern "No {things} yet" + a sentence describing what the
feature does and how to create the first one, not a restatement of the heading.

---

## 5.8 Skeleton loading states

**Component**: `pngx-skeleton` — `src-ui/src/app/components/common/skeleton/`

**Problem it replaces**: spinner + "Loading..." text, which causes a layout shift the instant real
content replaces it, and (as an unplanned side effect of auditing this) tends to hide the fact that
several list components had no error handling at all — see [Increment 1, error states](#59-error-states)
below.

**Pattern**: a placeholder that reproduces the *shape* of the content being loaded, so nothing jumps
when it's replaced.

**Inputs**:

| Input | Type | Default | Notes |
|---|---|---|---|
| `variant` | `'text' \| 'card' \| 'row' \| 'circle'` | `'text'` | Shape to mimic |
| `count` | `number` | `3` | Number of lines/items to repeat |
| `height` | `string` | `null` | Optional custom CSS height override per block |

**Behavior requirements**:
- Pulse animation is **subtle** and **must respect `prefers-reduced-motion`** — falls back to a static,
  slightly dimmed state (not full animation removal, so the placeholder is still visually distinct from
  loaded content).
- Colors come from existing Bootstrap CSS custom properties (`--bs-secondary-bg`, `--bs-tertiary-bg`),
  never hardcoded hex, so it works in light and dark mode automatically.
- **Only renders after a 200ms delay** from mount — fast responses (cache hits, small payloads) must
  never show a skeleton flash.
- Carries `role="status"` + a visually-hidden "Loading..." label, so it's still announced to assistive
  technology exactly once the delay elapses (see [§7](#7-accessibility-wcag-21-aa)).

**Usage rule**: replace `spinner-border` + "Loading..." with a skeleton shaped like the content that
will appear (`row` for list/table rows, `card` for card grids, `text` for short inline/paragraph
placeholders). Picking `variant` is a judgment call per context — match the layout being replaced, not
a generic default.

---

## 5.9 Error states

**Component**: `pngx-error-state` — `src-ui/src/app/components/common/error-state/`

**Absolute rule**: never show a raw exception, stack trace, or HTTP status code to a client. Log the
detail server-side (or, on the frontend, keep it available for support without exposing it by
default); show a human sentence.

**Four severity levels** (scope of the failure, not a color/copy distinction):

| Level | Scope |
|---|---|
| Field | A single input failed validation — handled by the shared input components' own `.invalid-feedback`, not this component. |
| Section | A self-contained region of a page failed to load (a list, a panel). Default level for `pngx-error-state`. |
| Page | The whole page's primary content failed to load. |
| System | An app-wide failure affecting more than the current page (e.g. settings failed to load at bootstrap, so the whole session is running degraded). |

**Component levels implemented**: `pngx-error-state`'s `level` input currently distinguishes
`'section' | 'page'` (sizing only, not color/copy). "Field" is handled separately by each input
component's own validation-error markup. "System" doesn't have a distinct visual treatment yet — the
one system-level case built so far (settings failed to load at bootstrap, rendered in
`app-frame.component.html`) uses `level="page"`; a true fourth level is not yet implemented as its own
input value.

**Inputs**:

| Input | Type | Default | Notes |
|---|---|---|---|
| `level` | `'section' \| 'page'` | `'section'` | |
| `icon` | `string` | `'exclamation-triangle'` | |
| `heading` | `string` | `''` | Plain-language statement of what failed |
| `headingLevel` | `number` | `2` | Same ARIA-heading technique as empty-state, same rationale |
| `body` | `string` | `''` | One sentence: what happened, what to do |
| `retryLabel` | `string` | `null` | Omit to render without a retry button |
| `retry` | `EventEmitter<void>` | — | Emitted on retry click |
| `showDetails` | `boolean` | `false` | Whether a technical-details disclosure is offered at all |
| `details` | `string` | `null` | The raw technical string itself — extract with `getHttpErrorDetail()` (`src-ui/src/app/utils/http.ts`), never pass a raw `HttpErrorResponse` or HTML body |

**Behavior requirements**:
- The technical-details disclosure, when offered, is a collapsed `<details>`/`<summary>` — **never
  open by default**, regardless of `showDetails`.
- Carries `role="alert"` (implicit `aria-live="assertive"`) so the failure is announced immediately.
- `getHttpErrorDetail()` must never surface raw HTML (e.g. a Django debug/500 page body) — it discards
  anything that looks like an HTML document and falls back to the HTTP status line.

**Usage rule**: any list/section/page that can fail to load must (a) actually handle the error — not
just the happy path — and (b) show `pngx-error-state` with a retry wired to the same reload method used
on init, instead of a raw error string, a silent failure, or a toast-only notification for a persistent
failure state. A transient, successfully-retriable background action (e.g. "delete failed") is still
fine as a toast; a list/page that *can't currently load at all* is not.

---

## 7. Accessibility (WCAG 2.1 AA)

Acceptance criteria for all Docvera UI work:

- **Contrast**: 4.5:1 for text, 3:1 for large text and UI-component borders.
- **Keyboard**: every interactive element reachable and operable by keyboard, in a logical order.
- **Focus**: a visible focus indicator on every focusable element, never removed without a replacement.
- **Accessible names**: every control has a name via visible text, `aria-label`, or `aria-labelledby` —
  a `title` attribute also satisfies this. An icon-only control repeated per row/item in a list needs a
  *distinguishing* name (e.g. `aria-label="Remove {{item.name}}"`), not a generic one, since
  screen-reader users navigating by control name can't otherwise tell repeated instances apart.
  A label hidden via a responsive utility class (e.g. Bootstrap's `d-none d-sm-inline`) is removed from
  the accessibility tree, not just visually — it does not satisfy this requirement at any viewport
  width where the class applies.
- **Semantics**: correct landmarks, heading hierarchy with no skipped level. Reusable components placed
  at varying page depths must not hard-code a heading level — see `empty-state`/`error-state`'s
  `headingLevel` input pattern above (a generic element with `role="heading"` + `[attr.aria-level]`,
  default level `2`, since a shallower-than-context level is never a WCAG skip but a deeper one can be).
- **Live regions**: toasts, validation errors, and status changes are announced via `aria-live` (or an
  equivalent implicit role, e.g. `role="alert"`/`role="status"`) — not left silent for assistive
  technology just because they're visible.
- **Motion**: respects `prefers-reduced-motion`.
- **Zoom**: usable at 200% without horizontal scrolling.
- **Color independence**: status is carried by an icon or text, never by color alone.

### Known color-token decision (dark mode, Docvera Navy)

`--pngx-primary-lightness` (dark mode, `theme.scss`'s `paperless-green-dark-mode` mixin) was raised
from 42% to **58%** to bring Navy-colored text/links up to the 4.5:1 minimum against the dark page
background (was ≈2.76:1, now ≈4.85:1). This was an explicit accessibility-over-brand-fidelity decision:
raising the same token makes a second pairing — light-gray button label text on a Navy button
background — measurably worse (was already failing at ≈3.07:1, now ≈1.75:1). That second pairing is a
known, currently-unresolved gap, not a false negative — see `DOCVERA_ACCESSIBILITY_AUDIT.md` §4 for the
full numbers and the recommended fix (a second, distinct color token, or a different foreground color
for text-on-primary-background specifically, rather than reusing the same lightened value everywhere).

Full findings, methodology, and what's not yet covered: `DOCVERA_ACCESSIBILITY_AUDIT.md`.

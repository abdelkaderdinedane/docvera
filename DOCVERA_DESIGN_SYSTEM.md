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
fine as a toast; a list/page that *can't currently load at all* is not. **Exception**: a request that
fails specifically because the user lacks permission (HTTP 403) is not an error in this sense — see
§5.12, which takes precedence over this rule for that one status code.

---

## 5.10 Dashboard section cards

**Tokens**: `src-ui/src/styles.scss`, `:root` block.

A small 4px-based spacing/radius scale, introduced for the dashboard redesign (Increment 2) and reusable
anywhere a similar bordered content block is needed:

| Token | Value | Token | Value |
|---|---|---|---|
| `--dv-space-1` | `0.25rem` (4px) | `--dv-radius-sm` | `0.25rem` (4px) |
| `--dv-space-2` | `0.5rem` (8px) | `--dv-radius-md` | `0.5rem` (8px) |
| `--dv-space-3` | `0.75rem` (12px) | | |
| `--dv-space-4` | `1rem` (16px) | | |

Not color, so no dark-mode variant is needed — same values in both themes.

**Classes**: `.docvera-section-card` / `.docvera-section-title` (also in `styles.scss`).

**Problem it replaces**: `pngx-widget-frame`'s default (non-cardless) card uses Bootstrap's `bg-light`,
which in this app's dark mode resolves to a color very close to the page background with a barely-visible
border — every widget using it is affected, but it reads as most noticeable on small, content-sparse
widgets (see `DOCVERA_CHANGELOG.md`, dashboard bug-fix pass, item 7). `widget-frame` itself wasn't changed
(shared by every widget app-wide), so this is an opt-in alternative surface for widgets that need clearer
definition.

**Pattern**: wrap `<pngx-widget-frame [cardless]="true">` in a `.docvera-section-card` div, with a
`.docvera-section-title` for the section's own heading:

```html
<div class="docvera-section-card">
  <span class="docvera-section-title" role="heading" aria-level="2">Section title</span>
  <pngx-widget-frame [cardless]="true">
    <ng-container content> ... </ng-container>
  </pngx-widget-frame>
</div>
```

`.docvera-section-card` is `1px solid var(--bs-border-color)`, `border-radius: var(--dv-radius-md)`
(8px), `padding: var(--dv-space-4)`. `.docvera-section-title` uses the same accessible-heading technique
as `empty-state`/`error-state`/the onboarding checklist — `role="heading"` + `aria-level="2"` on a plain
element, not a hard-coded `<h2>` — for the same reason: these are reusable pieces placed at a fixed page
depth today, but a hard-coded level risks a skip if reused elsewhere later.

**Usage rule**: not a replacement for `widget-frame`'s normal card mode everywhere — use it specifically
when a widget needs a clearly-defined, bordered surface (the dashboard's "Quick actions" and "Recent
documents" sections were the first two examples; the onboarding checklist below is a third — it doesn't
use `pngx-widget-frame` at all, since it isn't a draggable dashboard-grid widget, but applies
`.docvera-section-card` directly to its own root element for the same border/contrast reason). Most
widgets should keep using `widget-frame`'s default card.

---

## 5.11 Onboarding checklist i18n and derived-state pattern

**Component**: `pngx-onboarding-checklist` — `src-ui/src/app/components/dashboard/widgets/onboarding-checklist/`

**Pattern**: for a component whose job is to guide a user through first-time setup, don't persist
per-step completion. Derive each step's `done` state at read time from a real, cheap count of the
relevant resource (`SomeService.list(1, 1)`, reading only `Results.count`) instead of a hand-maintained
flag. The only thing actually persisted is a single dismissal boolean (manual dismiss, or automatic once
every *required* step is derived as complete) — see `DOCVERA_CHANGELOG.md`'s "Onboarding checklist
rebuild" entry for the full rationale (a persisted per-step flag goes stale the moment data changes
outside the component's own action, and doesn't survive multi-tenant provisioning without its own
migration; derived state can't go stale and needs none).

A checklist step can be marked `optional`: it's still displayed and can still be completed, but it's
excluded from both the completion fraction shown to the user (`X of N`, where `N` counts only the
required steps) and from the check that triggers automatic dismissal.

**i18n convention**: every user-visible string in a Docvera-specific (non-upstream-derived) component gets
an explicit custom message id, not the framework's auto-generated hash id, so the string is easy to find
in a locale `.xlf` file by name rather than by a 19-digit number. The onboarding checklist establishes the
convention for this: `i18n="@@docvera.<feature>.<element>[.<field>]"` — e.g.
`docvera.onboarding.step.upload.label` / `.description` / `.action`. Apply the same
`docvera.<feature>.*` prefix pattern to future Docvera-specific (not upstream-shared) components that
carry several related strings, so they stay grouped and greppable in the `.xlf` files the same way.

**Usage rule**: any new "guide the user through setup" surface (this checklist, or a future equivalent
elsewhere in the app) should derive its steps the same way — cheap per-resource count reads, no
persisted step state, only a dismissal flag if the surface is dismissible at all.

---

## 5.12 Permission boundaries vs. errors

**Rule**: an HTTP 403 is not an error. It's the backend correctly enforcing a permission the frontend's
own gating either can't predict (a request fired before checking, or a case the local permission cache
doesn't cover) or got right — either way, the user did nothing wrong and nothing is *broken*. Rendering
it through the same path as a 500 or a network failure — `pngx-error-state`, a red/alert-toned surface,
a "Retry" button — is actively misleading: retry cannot ever succeed for a permission problem, and
alarming copy implies a fault that isn't there. A 403 gets a plain, calm explanation instead — reuse
`pngx-empty-state` for it, never invent a new component or visual pattern for "you can't see this."

**What differs from a genuine error**:

| | Genuine error (500, network) | Permission boundary (403) |
|---|---|---|
| Component | `pngx-error-state` | `pngx-empty-state` |
| Tone | Alert-level, `role="alert"` | Calm, informational |
| Retry button | Yes — wired to the same reload method | **Never** — retrying the identical request cannot change the outcome |
| Copy | "Something went wrong... try again" | States plainly what's missing and who can fix it (an administrator) — never assumes the reader isn't that administrator themselves; a permission can be missing from an otherwise-admin account |

**Implementation pattern**: don't guess a request's outcome from the frontend's own permission cache
alone and stop there — that cache can be wrong, stale, or (for a request fired before any check, e.g. a
service constructor) not consulted at all. Catch the actual response and branch on `error.status === 403`
specifically, setting a distinct boolean (e.g. `permissionDenied`) rather than reusing the generic
`error` flag, so the template can render the right component. Where a request is genuinely optional to
the view (it only decorates primary content, doesn't gate it — see the recent-documents widget's
`tasks/`/`tags/` calls, which only add status badges to a documents list the user can already read).
Two things need to happen together in that case, not one or the other:
1. **Guard it with a permission check first** so it's never even issued for a user known not to have
   the right — see `PermissionsService.currentUserCan()`, used the same way `*pngxIfPermissions` uses it
   in templates.
2. **Independently, wrap it in `catchError` to degrade to an empty result** rather than propagating —
   permission checks aren't the only way such a request can fail (a stale cache, an object-level
   restriction the flat permission check can't see), and an optional decoration failing must never take
   the primary content down with it. `forkJoin` treats any unhandled inner error as fatal to the whole
   join, so an un-caught supplementary observable can silently break a widget that has nothing wrong
   with its actual primary data — this is not a hypothetical, it's the exact bug this pattern was
   introduced to fix (see `DOCVERA_CHANGELOG.md`).

A card/section whose *entire* content is permission-gated (not just one supplementary call within it)
should hide itself outright rather than render a `pngx-empty-state` explaining the obvious — see §5.10's
`.docvera-section-card` usage note on the Quick Actions card hiding completely when zero of its actions
survive gating, versus a widget like Recent Documents (gated as a whole by `*pngxIfPermissions` on
`Document` view, but whose *own* primary request can still independently 403 in the defensive case above)
showing the calm explanation instead.

## 5.13 Sidebar navigation

**Grouping is by frequency of use, not by object type.** The sidebar (`app-frame.component.html`) groups
nav items into an unheaded top group (dashboard-level views used every session: Dashboard, Documents,
Trash), **Organization** (the taxonomy an operator maintains regularly: Correspondents, Tags, Document
Types, Storage Paths, Custom Fields), **Automation** (configured occasionally, then left running:
Workflows, Mail, the Saved Views *management* link), and **Administration** (configured once, by an
admin: Settings, Configuration, Users & Groups, File Tasks, Logs). An item's permission gate is a property
of the item, not the group — moving an item between sections never changes, drops, or merges its own
`*pngxIfPermissions` guard (or, for Logs specifically, its `permissionsService.isAdmin()` guard — a
separate mechanism, preserved as-is). `app-frame.component.spec.ts`'s `sidebar regrouping` describe block
asserts the full expected item set per section survives, and that permission denial on one item in a
section doesn't hide its neighbors, specifically to catch a future regrouping edit from silently dropping
or ungating an item.

Do not confuse the **Organization/Automation/Administration** static management-link groups above with
the separate, always-present **"Saved views"** nav-group rendered just above them — that one is the
user's own dynamic, drag-reorderable shortcut list (`savedViewService.sidebarViews`), gated the same way
but structurally and functionally distinct from the single static "Saved Views" link (which opens the
saved-views management page and lives in Automation).

**Icons**: every sidebar item icon comes from the registered `ngx-bootstrap-icons` subset in
`src-ui/src/main.ts` — never a raw character (the old Document Types icon, `hash`, rendered as a literal
"#" glyph rather than a drawn icon, visibly lighter and differently weighted than its neighbors; it's now
`bookmark`, registered in `main.ts` in alphabetical position in both the import list and the `icons`
object, matching the existing convention). If a needed icon isn't already registered, add it in its
alphabetical slot in both places rather than importing it ad hoc in the component.

**New section headings use the standard `docvera.*` custom i18n id** (§5.11's convention) —
`docvera.sidebar.section.organization` / `docvera.sidebar.section.automation` — with French targets added
to `messages.fr_FR.xlf` by hand, verified via a full `ng build --configuration production` checked against
`src/documents/static/frontend/fr-FR/main.js` (not `--localize=fr-FR`, which silently produces an
unlocalized build under this project's custom webpack builder, and not `dist/`, which isn't this project's
production output path — see the extraction procedure this pattern follows in `DOCVERA_CHANGELOG.md`).
The pre-existing "Administration" heading was left as a plain, auto-hash-id `i18n` string since it's
unchanged content, not new — only genuinely new source text gets a custom id.

**Active-state contrast** — see the accessibility subsection below; the short version is that the active
item's background and text-color decisions are deliberately decoupled from each other, because the
dark-mode Navy text color alone doesn't have contrast headroom left to also sit on a tinted background.

**Collapsed-mode tooltips use the existing `ngbPopover` mechanism** (not `ngbTooltip`, which isn't used
elsewhere in this codebase), already wired to every item via `[disablePopover]="!slimSidebarEnabled"`.
The trigger was `mouseenter:mouseleave` only — hover-only, unreachable by keyboard — and is now
`mouseenter:mouseleave focus:blur` throughout, so tabbing to a collapsed icon-only item opens its
identifying popover the same way hovering it does. The one interactive popover in the sidebar (the
disabled-update-check popover, containing Enable/Disable buttons) is deliberately left `mouseenter`-only:
making an interactive popover open-on-focus/close-on-blur would close it as soon as focus moves from the
trigger to a button inside it, making the buttons unreachable by keyboard — worse than the hover-only
status quo. Every `routerLinkActive="active"` item also now carries `ariaCurrentWhenActive="page"`, so the
active item is identified to assistive technology (`aria-current="page"`) independently of the visual
treatment.

**"Open documents" stays a fixed-height, internally-scrolling region** (`.sidebar-open-documents-list`,
`max-height: 14rem; overflow-y: auto`) rather than growing without bound — with enough documents open it
used to push every section below it (Organization, Automation, Administration) further down the page per
additional open document, leaving them at an unpredictable vertical position. The heading itself
(`<h6>Open documents</h6>`) stays outside the scroll container so it's never scrolled out of view while
its list is mid-scroll.

**Icon audit findings, not fixed (flagged for a future pass, out of scope for this change)**: the
Documentation link's icon (`<i-bs name="question-circle">`) is missing the `me-1` spacing class every
other sidebar icon carries, and the two GitHub/update-check footer icons (`info-circle`) use an explicit
`width="1.2em" height="1.2em"` where the rest of the sidebar relies on the icon's implicit default size —
both are minor, low-traffic inconsistencies rather than the "typographic character instead of a drawn
icon" defect this task specifically targeted, so left as-is rather than folded into an unrelated change.

## 5.14 Branded Django error pages (400 / 403 / 403_csrf / 404 / 500)

**These pages must render with no Angular app, no API, and no logged-in session available** — a 500 may
well mean exactly those things are down. They are plain Django templates
(`src/documents/templates/400.html`/`403.html`/`403_csrf.html`/`404.html`/`500.html`, extending a shared
`src/documents/templates/paperless-ngx/error_base.html`), picked up automatically by Django's default
error-handling hooks — bare template names, resolved by the app-directories loader without an app
namespace, hence these five live at the app's template root rather than nested under `paperless-ngx/` the
way the auth pages are. This is the **complete set** Django itself exposes a template hook for — confirmed
by grepping Django 5.2.5's own source for every `TEMPLATE_NAME`/`loader.get_template(...)` call across
`django/views/defaults.py` and `django/views/csrf.py`; there is no sixth one to discover later.
`400`/`403`/`404`/`500` share one mechanism (`django/views/defaults.py`, wired via `response_for_exception`
in `django/core/handlers/exception.py`); `403_csrf.html` is a **separate** mechanism entirely —
`CsrfViewMiddleware` calls `settings.CSRF_FAILURE_VIEW` (`django.views.csrf.csrf_failure`) directly when
CSRF validation fails, never going through `response_for_exception`/`handler403` at all, which is why it
needed its own investigation rather than being assumed covered by the 403 work.

**Reachability, verified against this app's actual `urls.py` and Django's own `URLResolver.resolve()`
source, not assumed**: `paperless/urls.py`'s last pattern is an unconditional catch-all
(`re_path(r".*", login_required(ensure_csrf_cookie(IndexView.as_view())), name="base")`). Django's root
`URLResolver.resolve()` loops over every top-level pattern and, on a `Resolver404` raised by any nested
`include()` (e.g. nothing under `api/` matching), **continues to the next sibling pattern** rather than
propagating the failure — confirmed by reading `django/urls/resolvers.py` directly. The practical effect:
there is essentially no request path in this app — mistyped, under `/api/`, under `/accounts/`, anywhere —
that fails to resolve to *some* view, because the catch-all always matches last. **404/403 therefore cannot
fire from a routing miss in this app; they only fire when a URL resolves successfully to a real view and
that view's own code explicitly raises the exception during execution.** Concretely: `documents.views.
serve_logo` (`/logo`) raises `Http404` when no custom logo is configured; Django admin's own
`get_object_or_404` calls (bad primary key on a real admin URL) and its per-model `PermissionDenied` (see
§5.13's Task 3 note) are the other confirmed cases — real, but narrow, staff/admin-adjacent paths, not
general customer navigation. `403_csrf.html` is different and **broadly reachable** — any authenticated
session that goes stale while a form sits open (the common case: a login tab left open overnight) hits it
on the next submit, independent of routing entirely since it fires from `CsrfViewMiddleware`, before view
dispatch. `500.html` is the most broadly reachable of all: it fires for *any* unhandled exception in *any*
successfully-routed view, including `IndexView` itself — which every authenticated page load hits, and
which does a real DB query (`request.user.ui_settings...`) that can fail if the database is unavailable.
**The takeaway for anyone extending this set**: 400/403/404 cover real but narrow paths and are
cheap defense-in-depth, not the primary customer error surface (Angular's own client-side router already
owns that for typo'd paths, by design — the catch-all above is intentional architecture, not a gap to
close). 403_csrf and 500 are the two that matter most for an actual customer hitting them in the ordinary
course of using the product.

**Layout deliberately does not reuse `paperless-ngx/base.html`'s two-column brand panel** — that layout is
built for a page whose job is to hold someone's attention (a login form with marketing copy alongside it);
an error page's job is the opposite; get out of the way. `error_base.html` instead reuses the same tokens
(`--pngx-primary`, `--pngx-surface`, `--pngx-text-muted`), the same logo snippet
(`paperless-ngx/snippets/svg_logo.html`), and the same typography scale as the auth pages, in a single
centered column — matching the *visual language*, not the layout, per the explicit instruction that
produced this section.

**Tone differs per page, and reuses the §5.12 reasoning rather than inventing a second convention**: 403 is
a permission boundary (calm, muted icon, no alarm styling — "your account doesn't have permission... ask
an administrator," the same framing §5.12 established for in-app 403s); 404 states plainly that nothing is
broken, the address doesn't exist; 400 is similarly calm/generic (a malformed or oversized request, not a
Docvera fault); 500 is a genuine failure and says so, without ever including a stack trace or technical
detail (`{% translate %}`-only copy, nothing from `{{ exception }}` is ever rendered). **403_csrf is
deliberately written in plain, non-technical language** — "your session has expired... sign in again," not
Django's own "CSRF verification failed" security vocabulary — because the overwhelmingly common trigger is
mundane session staleness, not an actual attack, and a customer should never have to parse security
jargon to understand "sign in again."

**Critical constraint, verified by reading Django's own `django/views/defaults.py` and `django/views/
csrf.py` source rather than assumed**: the five default error views pass *different* context to their
template:

| Handler | Context passed | Context processors run? |
|---|---|---|
| `bad_request` (400) | `request=request` only — no extra dict (`"Context: None"` per Django's own docstring) | Yes |
| `permission_denied` (403) | `request=request, context={"exception": ...}` | Yes |
| `csrf_failure` (403_csrf) | `request=request` only — **the `reason`/`no_referer`/`no_cookie`/`DEBUG` dict Django builds is used only by its own fallback template, never passed to a custom one** | Yes |
| `page_not_found` (404) | `context, request` (`request_path`, `exception`) | Yes |
| `server_error` (500) | **`template.render()` — no arguments at all** | **No — and no `request` either** |

The 500 template therefore cannot rely on **anything** context-processor-driven (this app's own
`documents.context_processors.settings`, which supplies the dynamic `APP_TITLE`/`APP_LOGO` used elsewhere,
included) or on a `request` object being present. `{% static %}`, `{% translate %}`/`{% blocktranslate %}`,
and `{% include %}` with only literal (`with x="..."`) arguments all still work with zero context — that's
exactly what `error_base.html` and all five pages are built from, deliberately. Anyone extending these
pages later must keep that constraint in mind: something that works when testing 400/403/403_csrf/404 can
still break the 500 page specifically, because only 500 gets an empty context — and 403_csrf specifically
cannot differentiate *why* CSRF failed (stale cookie vs. missing referer vs. no cookie at all) even if a
future revision wanted to, since none of those flags reach a custom template.

**Gap found while verifying this task's own contrast — now fixed, see the dedicated §7 subsection below**:
`base.css` defined `--pngx-primary` once (`#1A3D7C` Navy) with no dark-mode override, unlike
`src-ui/src/theme.scss`'s Angular equivalent. The new error pages sidestepped the pairing entirely (their
action button uses `.btn.btn-primary`'s solid Navy **fill** with white text, ≈10.49:1, mode-independent,
rather than Navy text directly on the page background), but the underlying gap remained live on the
already-shipped login/password-reset pages until the follow-up fix documented in §7 — see "Navy-as-text
dark-mode fix (`base.css`)" for the full before/after contrast table and why a single token couldn't
safely serve both the text and fill roles.

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

**This is a recorded, intentional deviation from the brand token, not an unexplained inconsistency.**
Dark mode does not render the exact Docvera Navy brand color — it renders a deliberately lightened
variant, approved specifically to meet WCAG AA contrast. Documented here so that stays true going
forward, even as the surrounding code changes.

**The values** (`src-ui/src/theme.scss`):

| | HSL | Approx. RGB / hex | Where |
|---|---|---|---|
| Brand Navy (`DOCVERA_BRAND.primaryColor`, light mode) | `hsl(217, 65%, 29%)` | `#1A3D7C` | `paperless-green` mixin — `--pngx-primary: 217, 65%; --pngx-primary-lightness: 29%` |
| Adjusted dark-mode value | `hsl(217, 65%, 58%)` | ≈ `rgb(78, 132, 218)` | `paperless-green-dark-mode` mixin — `--pngx-primary-lightness: 58%` |

Same hue and saturation (`217, 65%`) in both modes — only `--pngx-primary-lightness` moves, from **29%**
(light mode's true brand value) to **58%** in dark mode. (The dark-mode mixin's own lightness was
previously **42%** — see below — before this fix; 29% was never used in dark mode at all, since dark
mode has always applied its own override.)

**Measured contrast, before and after** (WCAG relative-luminance ratios, computed not eyeballed — full
methodology in `DOCVERA_ACCESSIBILITY_AUDIT.md` §4):

| Pairing | Before (42% lightness) | After (58% lightness) | Requirement |
|---|---|---|---|
| Navy text/links directly on the dark page background (`.text-primary`, default `<a>`, `.btn-link` text, against `--bs-body-bg` `#161618`) | ≈ 2.76:1 — **fails** | ≈ 4.85:1 — **passes** | 4.5:1 (normal text) |
| Light-gray button label text (`--pngx-primary-text-contrast`, `#abb2bf`) on a Navy button background | ≈ 3.07:1 — fails | ≈ 1.75:1 — **fails, and is worse than before** | 4.5:1 (button label text) |

**Why the deviation exists**: both pairings share the single `--pngx-primary-lightness` token but need
it to move in *opposite* directions to pass — lightening the token fixes the first pairing by pulling
the color away from the dark background, but by the same motion pulls it *toward* the light-gray
button-text color, actively worsening the second. There is no value of this one token that passes both.
Faced with that trade-off, the explicit decision was **accessibility over exact brand-color fidelity**:
fix the pairing that's read constantly as body text and links (pairing 1), accept that the rarer
Navy-button-with-gray-label pairing (pairing 2) gets worse in the process, and track pairing 2 as a
known, currently-unresolved gap rather than silently accepting either a contrast failure or an unexplained
color shift. The recommended fix for pairing 2 — a second, distinct color token (or a different
foreground color specifically for text-on-primary-background), rather than reusing the same lightened
value everywhere — is documented but not yet implemented; see `DOCVERA_ACCESSIBILITY_AUDIT.md` §4.

**Rule going forward**: any brand color that gets applied to a dark surface — a new accent color, a
future update to the Navy value itself, a third-party brand color introduced by an integration — must be
checked against WCAG AA (4.5:1 text, 3:1 large text/UI boundaries) for every pairing it's actually used
in on that surface, computed (not eyeballed), *before* shipping. If it fails, adjust the token the same
way this one was: document the exact before/after values and ratios here, name which pairing(s) were
fixed and which (if any) got worse as a trade-off, and record the decision explicitly rather than
shipping an as-is brand value that happens to fail in dark mode. A color that hasn't been checked this
way is not yet ready to ship on a dark surface.

Full findings, methodology, and what's not yet covered: `DOCVERA_ACCESSIBILITY_AUDIT.md`.

### Sidebar active-state contrast decision

The sidebar's `.nav-link.active` state (see §5.13) deliberately uses a **different text color than
`:hover`/`:focus`**, rather than the single shared color the rest of the codebase would default to. This
is intentional, computed the same way as the dark-mode Navy decision above, and documented here so a
future "simplify this, it looks redundant" edit doesn't silently reintroduce a contrast failure.

**The problem**: the obvious design — Navy-colored active text (matching `:hover`/`:focus`) on top of a
visibly-tinted background, so the active item reads as "the same color, just highlighted" — fails WCAG AA
in dark mode. Dark-mode Navy text is already set to the *minimum* lightness (58%, see above) that clears
4.5:1 against the plain page background (`--bs-body-bg`, ≈4.85:1, almost no headroom above the 4.5:1
floor). Any background lighter than page-background pulls that ratio down further. Two candidates were
computed and rejected before landing on the current design:

| Candidate background | Text color | Computed contrast (dark mode) | Result |
|---|---|---|---|
| `--pngx-primary-faded` (the existing "highlight" tint token, used elsewhere) | Navy (`--bs-primary`, 58% lightness) | ≈ 1.69:1 | **Fails badly** |
| `--pngx-bg-alt` (`#242529`) | Navy (`--bs-primary`, 58% lightness) | ≈ 4.09–4.11:1 | **Fails**, narrowly — below the 4.5:1 floor |

Solving algebraically for the maximum background luminance that keeps Navy-58% text at 4.5:1 gives
`L_bg ≤ 0.01262`; the page background itself is already at `L ≈ 0.00808`, leaving almost no margin for a
perceptibly different, still-passing background under Navy text.

**Resolution — decouple background and text color**: `.active` uses a neutral surface token,
`--pngx-bg-alt2` (`#232323` dark / `var(--bs-gray-200)` light), as the background, paired with the
**default body text color** (`--bs-body-color`) rather than Navy — computed at ≈7.19:1 in dark mode, and
comfortably over 10:1 in light mode (near-black text on light grey). Navy is kept *only* for `:hover` and
`:focus`, unchanged, still safe against the unmodified page background. The brand-color signal that Navy
text used to carry on the active item is now carried instead by a `border-inline-start: 3px solid
var(--bs-primary)` accent bar — a non-text UI-component boundary, so it only needs to clear 3:1, which
Navy does easily against either surface token. `border-inline-start` (not `border-left`) since Docvera
plans RTL locale support later this phase; a hard-coded `left` would render on the wrong edge under RTL.
The transparent-border reservation on every `.nav-link` (`border-inline-start: 3px solid transparent`)
exists purely so gaining the colored border on `.active` doesn't shift layout by the border's width.

**Rule going forward**: don't reuse `--pngx-primary-faded` or reintroduce Navy-colored text on any new
tinted background in dark mode without first computing the pairing — Navy at 58% lightness has almost no
contrast budget left, by design (see the color-token decision above), so it fails on backgrounds that
would be perfectly safe for default body-color text.

### Secondary text color decision (dark mode, `--bs-secondary-color`)

**Defect #3 / regression-matrix F2**: `.recent-document-meta` (and, once traced, 8 other call sites across
`empty-state`, `error-state`, and `onboarding-checklist`) rendered secondary/de-emphasized text at
**3.85:1** in dark mode against `--bs-body-bg` (`#161618`) — below the 4.5:1 floor. Root cause:
`@mixin dark-mode` (`src-ui/src/theme.scss`) set `--bs-secondary-color: #6c757d` — Bootstrap's
`$gray-600`, reused as-is with no adjustment for the dark background it would actually sit on. Every other
token the mixin touches was deliberately re-picked for dark-mode contrast (`--bs-body-color`,
`--pngx-bg-alt`, `--pngx-primary-lightness`); this one was simply never given a deliberate value — the
grey a Bootstrap default happened to leave behind, not a decision.

**Fix**: new `$text-color-dark-bg-secondary: #999999`, computed at **6.34:1** against `#161618` (before/
after: 3.85:1 → 6.34:1) — a plain neutral grey, not a brand color (dark-mode Navy has no contrast budget
to spare for a secondary role — see the color-token decision above) and not merely a dimmed version of the
primary dark-mode text color (`$text-color-dark-bg`, `#abb2bf`) either, so it still reads as visually
secondary relative to primary text while clearing AA with real margin. Light mode was verified unaffected
— this app never overrides `--bs-secondary-color` in light mode, so it still inherits Bootstrap's own
`rgba(33, 37, 41, 0.75)`-on-white default, ≈6.73:1, untouched by this fix.

**Rule going forward**: a Bootstrap default CSS custom property is not pre-verified for this app's dark
surfaces just because Bootstrap ships a value for it. Bootstrap's own defaults (grays, `$body-secondary-color`,
etc.) are authored and contrast-checked against *light* backgrounds; reusing one as-is inside
`@mixin dark-mode` — or introducing any new Bootstrap variable into that mixin in the future — must be
computed against this app's actual dark-mode background (`--bs-body-bg`, `#161618`) before shipping, the
same way a brand color would be, rather than assumed safe because "it's just Bootstrap's default." When a
shared token fails, fix the token (checking every consumer first, per §5.13's icon-registration-style
audit habit) rather than patching the one component that happened to surface it — the other consumers are
equally broken, just not yet reported.

### Navy-as-text dark-mode fix (`base.css`, Django-rendered pages)

**Found while verifying the new error pages' own contrast** (§5.14), then fixed as a dedicated follow-up:
`src/documents/static/base.css` — which styles the Django-rendered auth pages (login, signup, password
reset, MFA) and the new error pages — defined `--pngx-primary` (`#1A3D7C` Navy) with no dark-mode override
at all, unlike its Angular `theme.scss` counterpart. Every consumer of the token (and of
`--bs-link-color-rgb`, which turned out to share the identical value and the identical gap — see below)
was checked before choosing a fix, per the same discipline as the `--bs-secondary-color` fix above.

**Every consumer, checked before fixing**: `--pngx-primary` is used for two *different* roles that turned
out to need *opposite* dark-mode treatment:

| Role | Consumers | Dark-mode need |
|---|---|---|
| Text on the page background | `.text-primary`, `.btn-link` (base color), the two `:focus-visible` outline rules, and — the actively-used one — the implicit Bootstrap `a { color: rgba(var(--bs-link-color-rgb), ...) }` default applied to every plain `<a>` on these pages (e.g. "Forgot password?", "Contact support") | Needs a **lighter** Navy to clear 4.5:1 against the dark page background |
| Solid fill (background), with white text on top | `.btn.btn-primary` (submit/action buttons), `.auth-brand` (the two-column auth pages' left panel) | Already safe as the **original, darker** Navy — a filled background's contrast doesn't depend on the page background at all, and lightening it would *break* it (see below) |

`.text-primary` and `.btn-link` turned out not to be used in any current template (grepped
`src/documents/templates/`, zero matches) — but `--bs-link-color-rgb` is: Bootstrap's own default anchor
color rule consumes it for every unstyled `<a>` tag, and this app overrides it unconditionally in the base
`body {}` rule to the same Navy value, with no dark-mode adjustment either. That's the actively-broken
consumer this fix needed to reach, not just the two unused utility classes.

**Why one dark-mode value couldn't serve both roles — computed, not assumed**: the already-approved
Angular dark-mode Navy value (`hsl(217, 65%, 58%)` ≈ `#4E84DA`, see the color-token decision above) fixes
the text role, but applying it to the *fill* role too breaks it: white button/panel text on that lighter
fill computes to **≈3.73:1 — a regression below 4.5:1**, down from the original (unmodified) fill's
≈10.49:1. The fix therefore had to decouple the two roles into separate tokens, the same pattern already
used for the sidebar active state above, rather than reuse one token for both.

**Fix**: new `--pngx-primary-text` token (defaults to `var(--pngx-primary)` in light mode — identical
value, no light-mode change), overridden only inside the existing dark-mode media query to `#4E84DA` — the
same already-vetted value used by the Angular app, for cross-surface brand consistency rather than
inventing a second dark-mode Navy shade. `--bs-link-color-rgb` gets the equivalent dark-mode override
(`78, 132, 218`, the RGB-triplet form Bootstrap's `rgba(var(...))` consumption requires).
`.text-primary`/`.btn-link`/both focus-outline rules were repointed from `--pngx-primary` to
`--pngx-primary-text`. `--pngx-primary` itself, `.btn.btn-primary`, and `.auth-brand` were **not touched at
all** — they keep resolving to the original, unmodified Navy in both modes, since that pairing was already
safe.

**Computed contrast, every pairing, before and after**:

| Pairing | Before | After | Requirement | Result |
|---|---|---|---|---|
| Navy text/links (`--bs-link-color-rgb`/`--pngx-primary-text`) on dark page bg (`#161618`) | `#1A3D7C` → **1.72:1** | `#4E84DA` → **4.85:1** | 4.5:1 (text) | **Fixed** |
| Same pairing, light mode (unchanged) | `#1A3D7C` on `#f5f5f5` → **9.62:1** | unchanged — light mode never touched | 4.5:1 | **Unaffected, still passes** |
| Focus-visible outline (UI boundary) on dark page bg | `#1A3D7C` → **1.72:1** — this was *also* failing the 3:1 UI-boundary floor, not caught by name in the original report but the same root cause | `#4E84DA` → **4.85:1** | 3:1 (UI component boundary) | **Fixed as a side effect of the same token change** |
| White text on `.btn.btn-primary`/`.auth-brand` solid fill (mode-independent — a fill's contrast never depended on page background) | `#1A3D7C` fill → **10.49:1** | **unchanged** — `--pngx-primary` itself was never modified | 4.5:1 (button label text) | **Unaffected, still passes** — confirmed the rejected all-in-one-token approach would have regressed this to ≈3.73:1 |

**Discovered here, fixed as a separate follow-up (Phase 2 exit-gate item)**: `--bs-link-hover-color-rgb:
15, 56, 20` and `.btn.btn-primary`'s hover/active border colors (`#0c2c10`, `#09220d`) in `base.css` were
dark **green** — leftover from the original upstream paperless-ngx branding, never updated during the
Docvera rebrand. A wrong-brand-color defect, not a contrast defect, so out of scope for this fix at the
time — see "Leftover upstream-green audit" below for the full fix, which also closes a UI-boundary
contrast gap on the button's *base*-state border found while computing the replacement values.

**Rule going forward**: when a color token serves both a text/foreground role and a solid-fill/background
role, dark-mode adjustment must be computed **separately for each role**, even if today's value happens to
be identical for both — as this case shows, the value that fixes one role can silently break the other.
Split into distinct tokens (as done here) rather than assuming one dark-mode value serves every consumer of
a shared token name.

### Leftover upstream-green audit (`base.css`)

**Phase 2 exit-gate item — "no unintended source-brand UI remains."** Audited every color literal in every
Django-side stylesheet (`base.css`; `bootstrap.min.css`, vendored/unmodified, not a branding surface;
every Django template checked for inline `style=`/`<style>` colors — none found outside `base.css`) for
anything not a Docvera brand token or a neutral, rather than fixing only the three values already known.
**Result: exactly three**, all in `base.css`, all upstream paperless-ngx green (`#17541f`-family) never
touched during the Docvera rebrand:

| Token | Was (upstream green) | Role |
|---|---|---|
| `--bs-link-hover-color-rgb` | `15, 56, 20` | Text — link color while hovered |
| `--bs-btn-hover-border-color` | `#0c2c10` | UI boundary — button border, hover state |
| `--bs-btn-active-border-color` | `#09220d` | UI boundary — button border, active state |

**Fix, using the existing token system rather than new hex values, per instruction**: the link-hover text
color now mirrors `--pngx-primary-hover` (`19, 45, 92` / `#132D5C`) in light mode, and gets its own
dark-mode override (`129, 167, 228` — `hsl(217, 65%, 70%)`, noticeably lighter than the 58%-lightness base
dark-mode link color for a clear hover affordance) — it previously had **no** dark-mode override at all, so
the green value was silently applying in dark mode too, not just light. The two button border colors now
use `--pngx-primary-text` (the token from the fix above) instead of a hardcoded hex.

**Why the button border uses `--pngx-primary-text`, not `--pngx-primary`, and why all three button states
(base included) end up with the identical border value**: a border is a UI boundary judged against the
*page* background, not the fill it outlines — the same distinction the fix above already established for
text. Computing it surfaced that the **base** (non-hover) button border, `--bs-btn-border-color: var(
--pngx-primary)`, had the *identical* gap (1.72:1 against the dark page background, same root cause) even
though it was never green and so was never named in the report. Rather than fix the two named states and
leave the base state inconsistently broken, all three route through `--pngx-primary-text` — which is
already verified safe against the page background in both modes (see the table above). Because the border
color no longer varies between base/hover/active, the "hover must stay distinguishable from base" test is
satisfied by the **fill** (`--pngx-primary` → `-hover` → `-active`, three distinct darkening navy shades),
not by the border — the border was never the mechanism carrying that distinction in the original design
either (base border already equalled base fill before this fix).

**Computed contrast, every replacement, both modes**:

| Pairing | Light mode | Dark mode | Requirement | Result |
|---|---|---|---|---|
| Link hover text vs. page bg | `#132D5C` on `#f5f5f5` → **12.37:1** | `rgb(129,167,228)` on `#161618` → **7.38:1** | 4.5:1 | **Passes both**, and clearly distinguishable from each mode's own base link color (9.62:1 light / 4.85:1 dark) |
| Button border (base/hover/active, now identical) vs. page bg | `#1A3D7C` on `#f5f5f5` → **9.62:1** | `#4E84DA` on `#161618` → **4.85:1** | 3:1 (UI boundary) | **Passes both** — base state's previously-undiscovered dark-mode gap (1.72:1) is fixed as part of this change |
| White button text on fill (unaffected — fill itself untouched) | `#1A3D7C` fill → **10.49:1** | unchanged | 4.5:1 | **Still passes**, confirming the border change didn't touch the already-safe fill/text pairing |

**Not fixed, flagged, genuinely out of scope**: `.btn-link`'s hover/active colors (`--pngx-primary-hover`/
`--pngx-primary-active`, unmodified) share the same dark-mode-as-text gap in principle, but `.btn-link` is
confirmed unused in every current template (grepped, zero matches) — same status noted in the fix above,
carried forward rather than re-investigated, since nothing renders it today.

**Rule going forward**: "the hex doesn't match the brand token" is not the only sign of leftover
upstream branding — a value can be the *correct* brand color and still be missing the dark-mode-safe
variant a sibling value already received, as the base button border shows. When auditing for leftover
branding, check every consumer of a color family for *consistency of treatment*, not just correctness of
hue.

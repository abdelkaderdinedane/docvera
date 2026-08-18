# Docvera Accessibility Audit — WCAG 2.1 AA

Targeted audit of `src-ui/src/app/components/` against the Docvera design system's section 7
acceptance criteria (contrast, keyboard, focus, accessible names, semantics, live regions, motion,
zoom, color independence). Scope: fix what's achievable without heavy restructuring; report and
prioritize the rest. Conducted by grepping/reading the whole component tree against each criterion,
not by running an automated scanner (e.g. axe-core) or a live screen-reader pass — see
[Methodology limits](#methodology-limits) for what that means for these findings' reliability.

## Summary

| Criterion | Status |
|---|---|
| Accessible names (icon-only controls) | **32 violations found, 32 fixed.** 1 ambiguous case left for judgment. |
| Focus indicator | **1 real violation found, fixed.** 4 borderline cases reviewed, not violations. |
| Live regions (toasts, validation) | Toasts already compliant (via `ngb-toast`). **11 violations found (validation messages), 11 fixed.** |
| Color contrast (Docvera Navy) | Light mode passes comfortably. Dark mode had two interdependent pairings failing. **One fixed by raising `--pngx-primary-lightness` 42% → 58%** (text/link-on-page-background, now ≈4.85:1); **the other (button label text on primary background) got worse as a result, ≈3.07:1 → ≈1.75:1 — accepted trade-off, needs its own follow-up fix.** See [Contrast](#4-color-contrast--docvera-navy). |
| New components (empty-state, skeleton, error-state) | **1 real defect found (hard-coded heading level), fixed in both affected components.** Everything else already compliant. |
| Motion (`prefers-reduced-motion`) | Only `pngx-skeleton` had motion to control; it already handles it. Broader app-wide animation audit not attempted (see [Not covered](#not-covered-in-this-pass)). |
| Keyboard, semantics/landmarks, zoom | Spot-checked, not exhaustively audited — see [Not covered](#not-covered-in-this-pass). |

---

## 1. Accessible names — icon-only controls

**32 icon-only interactive controls had no accessible name** (no visible text, no `aria-label`,
`aria-labelledby`, or `title`) — invisible to screen reader users, who would hear only "button" with
no indication of what it does. All 32 are fixed, each with `i18n-aria-label`/`i18n-title` so the label
translates like any other UI string.

### Fixed — no accessible name at all (22)

| Control | Files |
|---|---|
| "More actions" kebab menu (`three-dots-vertical`) | `manage/management-list/management-list.component.html` (shared by the tag/correspondent/document-type/storage-path list pages), `manage/custom-fields/custom-fields.component.html`, `manage/workflows/workflows.component.html`, `manage/mail/mail.component.html` (×2 — accounts and rules rows), `admin/trash/trash.component.html` |
| Empty split-toggle buttons | `document-detail/document-detail.component.html` ("More download options"), `document-list/bulk-editor/bulk-editor.component.html` ("More download options") |
| Clear filter (`x`) | `admin/tasks/tasks.component.html`, `document-list/filter-editor/filter-editor.component.html` |
| Task details (`info-circle`) | `admin/tasks/tasks.component.html` |
| Rotate clockwise/counter-clockwise | `common/confirm-dialog/rotate-confirm-dialog/rotate-confirm-dialog.component.html` |
| Remove condition / remove group (`x-circle`) | `common/custom-fields-query-dropdown/custom-fields-query-dropdown.component.html` |
| Pick date (`calendar-event`) | `common/custom-fields-query-dropdown/custom-fields-query-dropdown.component.html` |
| Create tag / add item (`plus`) | `common/input/tags/tags.component.html`, `common/input/select/select.component.html` |
| Randomize color (`dice5`) | `common/input/color/color.component.html` |
| Open date picker (`calendar`) | `common/input/date/date.component.html` |
| Main toggle + 4× calendar toggle + 6× clear-selection link | `common/dates-dropdown/dates-dropdown.component.html` |

### Fixed — per-row/interpolated labels (needed to distinguish repeated identical buttons in a list)

- `document-list/bulk-editor/custom-fields-bulk-edit-dialog/custom-fields-bulk-edit-dialog.component.html`
  — `aria-label="Remove {{field.name}}"`
- `common/input/custom-fields-values/custom-fields-values.component.html` —
  `aria-label="Remove {{ getCustomField(fieldId)?.name }}"`
- `common/input/entries/entries.component.html` — entries are unnamed key/value pairs, so
  `aria-label="Remove entry {{ i + 1 }}"` (positional, best available)

### Fixed — systemic pattern: accessible name hidden below the `sm` breakpoint (10)

Multiple dropdown toggles put their only text label inside `<div class="d-none d-sm-inline">…</div>`.
Bootstrap's `d-none` is `display: none`, which removes that text from the accessibility tree — not
just visually — so on narrow/mobile viewports these buttons had **no accessible name at all**, even
though they read fine on desktop. Fixed by adding a static or `[attr.aria-label]`-bound label
independent of viewport width:

`document-detail/document-detail.component.html` (Actions, Send), `document-list/bulk-editor/bulk-editor.component.html`
(Actions), `common/custom-fields-dropdown/custom-fields-dropdown.component.html`, `document-list/document-list.component.html`
(Select, Show, Sort, Views), `common/dates-dropdown/dates-dropdown.component.html`,
`common/permissions-filter-dropdown/permissions-filter-dropdown.component.html`,
`common/filterable-dropdown/filterable-dropdown.component.html`,
`common/custom-fields-query-dropdown/custom-fields-query-dropdown.component.html`

### Left for judgment (1)

- `common/system-status-dialog/system-status-dialog.component.html:26` — an `exclamation-triangle-fill`
  icon with an `ngbPopover` (`versionPopover`) as its only content, no title/aria-label. Not fixed:
  the right label depends on what `versionPopover` actually says, which needs a human decision, not a
  guess. Low traffic (admin-only diagnostic dialog). **Needs a design/copy decision.**

---

## 2. Focus indicator

Searched every `.scss` file for `outline: none`/`box-shadow: none` on `:focus` without a visible
replacement (WCAG 2.4.7).

### Fixed — real violation

**`app-frame/global-search/global-search.component.scss`** had `* { --pngx-focus-alpha: 0; }` — this
zeroed the shared app-wide focus-ring variable for **every** focusable element inside the global
search feature (the nav search box, bound to the `/` hotkey, and its entire live results dropdown:
document/tag/user/etc. result buttons, "Download"/"Open" actions). The only partial substitute was a
background darken on `.dropdown-item:has(button:focus)`, which doesn't cover the search `<input>`
itself or any non-button element. **This was the single most severe finding in the whole audit** — a
keyboard-driven feature with its focus indicator globally suppressed.

Root cause: the default focus ring is colored from `--pngx-primary` (Docvera Navy), which has poor
contrast sitting on this same navbar's navy background — so it was killed outright rather than given a
replacement. Fix: removed the blanket suppression (dropdown items sit on a light `dropdown-menu`
background, where the default navy ring works fine) and added a targeted `:focus-visible` outline
(`2px solid rgba(255,255,255,0.9)`) on the search `<input>` specifically, since that's the one element
actually sitting on the dark navbar (contrast of white on Navy ≈ 10.5:1, comfortably passing the 3:1
non-text minimum).

### Reviewed — not counted as violations

Four other spots change the focus style but keep *some* visible replacement (a background or text
color shift, no ring/border): `styles.scss` (`.nav-item a:focus-visible`, `a.navbar-brand:focus-visible`),
`app-frame.component.scss` (`.sidebar .nav-link:focus-visible`), and the global-search input's
`.form-control:focus-within` background darken. These meet the letter of "a replacement exists" but
are weak in practice (color-only, no shape) — worth a second design pass, not fixed here since a
color-only indicator is a judgment call about what counts as "visible enough," not a clear violation.

---

## 3. Live regions — toasts and validation errors

**Toasts**: already correct, no fix needed. `pngx-toast` wraps `<ngb-toast>`
(`@ng-bootstrap/ng-bootstrap`), whose host element applies `role="alert"`, `aria-atomic="true"`, and
`aria-live="polite"` automatically — confirmed by reading the compiled library source, not assumed.

**Inline validation errors**: fixed. All 11 of the app's shared reusable form-input components render
their `error` message in a `.invalid-feedback` div with no `role`/`aria-live` — meaning every validation
error in every form in the app (tag/correspondent/document-type/storage-path/custom-field/mail-account/
mail-rule/user/group/workflow/saved-view edit dialogs, settings forms, all of it) was visible but
silent to screen reader users. Added `role="alert"` to each:

`common/input/text`, `number`, `select`, `textarea`, `monetary`, `entries`, `file`, `password`, `url`,
`date`, `color` — one `.component.html` each. Single highest-leverage fix in this whole pass: 11 small
identical edits remediate validation-error announcements for essentially every form in the app.

---

## 4. Color contrast — Docvera Navy

Computed WCAG relative-luminance contrast ratios (not eyeballed) for the theme's Navy primary color
in both light and dark mode.

### Light mode: passes comfortably, no action needed

`--bs-primary` in light mode is `hsl(217, 65%, 29%)` ≈ `rgb(26, 61, 124)` — matches
`DOCVERA_BRAND.primaryColor` (`#1A3D7C`). Against a white page background (links, `.btn-link` text,
`.text-primary`) or as white text on a Navy button/navbar background: **≈ 10.5:1** either direction —
passes both the 4.5:1 text and 3:1 non-text thresholds with wide margin.

### Dark mode: two pairings shared one token and needed it to move in opposite directions

Dark mode raises the primary's lightness in `theme.scss`'s `paperless-green-dark-mode` mixin. Two
separate pairings use this same color, and originally (at the previous 42% lightness,
`hsl(217, 65%, 42%)` ≈ `rgb(37, 91, 177)`) both failed:

1. **As literal text/link color directly on the page background** (Bootstrap's default `<a>` link
   color, `.text-primary`, `.btn-link` text — all inherit `--bs-primary` as `color`, not background)
   against `--bs-body-bg` in dark mode (`#161618`): was **≈ 2.76:1**, failing both the 4.5:1 normal-text
   and 3:1 non-text minimums.
2. **As a button/badge background with `--pngx-primary-text-contrast` (`#abb2bf`, a light gray) as the
   foreground text** (`.btn-primary` label text, dark mode): was **≈ 3.07:1**, failing the 4.5:1 minimum
   required for button label text (it's text content, not a lone UI-boundary indicator, so 3:1 doesn't
   apply here).

Raising lightness fixes pairing 1 but worsens pairing 2, since the background then converges toward the
light gray button-text color instead of staying dark. **Decision made explicitly by the user, prioritizing
accessibility over exact brand-hue fidelity**: `--pngx-primary-lightness` raised from 42% to **58%**
(`hsl(217, 65%, 58%)` ≈ `rgb(78, 132, 218)`). Applied in `theme.scss`.

- **Pairing 1 (text/link on page background): now ≈ 4.85:1 — passes** the 4.5:1 requirement, with a
  small margin.
- **Pairing 2 (button label text on primary background): now ≈ 1.75:1 — still fails, and is
  meaningfully worse than the pre-fix ≈3.07:1.** This is the accepted trade-off, not a fixed item —
  `.btn-primary` label text in dark mode is now less readable than before this change, not more. Needs
  its own follow-up: either a second, distinct color token (this lightened value for links/text, a
  separate one for button backgrounds), or a different foreground color for button-on-primary text in
  dark mode (e.g. darkening `--pngx-primary-text-contrast` for this specific pairing instead of white/
  light gray). Not fixed here — flagged as the immediate next accessibility item for dark mode.

Also flagged, not independently recomputed: the keyboard focus ring (`box-shadow` built from
`--pngx-primary`/`--pngx-primary-lightness`/`--pngx-focus-alpha`, see §2) shares the same underlying
dark-mode color variables and moved together with this change — re-verify its contrast against the
surfaces it appears on now that the base hue is lighter.

### Not applicable today

Teal (`#0E7490`) and the accent blue (`#3B82F6`) are declared in `DOCVERA_BRAND` but — per the branding
inventory recorded in `DOCVERA_BRANDING.md` from a prior pass — **not currently wired into any live UI
element**. No contrast violation is possible for a color nothing renders. Check both against light and
dark backgrounds *before* wiring either one in.

---

## 5. New components — empty-state, skeleton, error-state

Verified all three (`pngx-empty-state`, `pngx-skeleton`, `pngx-error-state`) against every criterion in
scope.

### Fixed

**Hard-coded heading level.** Both `pngx-empty-state` and `pngx-error-state` rendered their heading as
a literal `<h5>`. As reusable components dropped into pages with varying heading depth (some pages'
deepest heading might be `h2`, others `h4`), a hard-coded `<h5>` risked skipping levels (WCAG 1.3.1 /
2.4.6) depending on where the component landed — a violation the component itself can't know about at
authoring time. Fixed by switching to the standard technique for this exact problem: a generic element
with `role="heading"` and `[attr.aria-level]`, plus a new `headingLevel` input (default `2`). Default 2
is safe in effectively every placement — going *shallower* than the surrounding context is not a WCAG
skip, only going *deeper* would be, and hard-coded `5` was the deeper, riskier direction. Same CSS class
kept (`.empty-heading`/`.error-heading`, styled by class not tag), so no visual change; callers that
need a different depth in a specific page can now pass `[headingLevel]="3"` etc.

### Already compliant, verified

- **Live regions**: `pngx-skeleton` already has `role="status"` + a visually-hidden "Loading..." label;
  `pngx-error-state` already has `role="alert"` (implicit `aria-live="assertive"`). `pngx-empty-state`
  correctly has neither — it renders as ordinary page content (a list that legitimately has zero items
  needs no announcement, same as if it always had zero items).
- **Motion**: `pngx-skeleton`'s pulse animation is disabled under
  `@media (prefers-reduced-motion: reduce)` (falls back to a static `opacity: 0.6`).
- **Keyboard / accessible names**: `pngx-empty-state`'s optional action renders as a real `<a
  [routerLink]>` with the label as visible text; `pngx-error-state`'s optional retry is a real
  `<button>` with the label as visible text. Both natively focusable and operable, both have accessible
  names via text content — no icon-only controls in any of the three.
- **Focus indicator**: none of the three components' stylesheets touch `:focus` at all — they inherit
  the app's default (global) focus styles rather than overriding them.
- **Color independence**: `pngx-error-state` conveys its status through an icon *and* a heading
  sentence *and* body text — never through color alone.
- **Zoom / reflow**: all three use `rem` units, `max-width` constraints, and `flex-wrap` rather than
  fixed pixel widths or absolute positioning — should reflow correctly at 200% zoom (not tested in an
  actual browser at 200%, see [Methodology limits](#methodology-limits)).

---

## Not covered in this pass

Reported honestly rather than silently skipped:

- **Full keyboard walkthrough / tab-order check** of any page — not performed. Nothing found in this
  audit's file-by-file reading suggested a `tabindex` misuse or a focus trap, but that's not the same
  as testing it live with a keyboard.
- **Landmarks / heading hierarchy across real pages** — spot-checked only (`app-frame.component.html`
  already has `<main role="main">`; the new-component heading-level fix in §5 addresses the one concrete
  skip-risk found). A full landmark/heading audit of every page template was out of scope for this pass.
- **200% zoom / reflow** — verified by code inspection (relative units, no fixed widths) for the three
  new components only; not verified in an actual browser across the wider app.
- **App-wide `prefers-reduced-motion` coverage** — `pngx-skeleton` was the only component in scope (the
  three requested for verification) with meaningful motion, and it already handles this. A grep found
  six *other*, pre-existing `.scss` files with `transition:`/`animation:` rules that don't check the
  media query (`app-frame`, `global-search`, `rotate-confirm-dialog`, `tags`, `saved-view-widget`,
  `file-drop`) — these are short hover/UI transitions, not the sustained/large motion WCAG's
  reduced-motion criterion targets, so they weren't treated as violations or fixed here, but are noted
  for a future pass if the design system wants stricter coverage than base WCAG AA requires.
- **Automated scanner pass** (axe-core, Lighthouse, etc.) and **live screen-reader testing** (NVDA/VoiceOver)
  — see below.

## Methodology limits

Every finding above came from reading source (HTML/SCSS/TS) and computing contrast ratios by hand
against the WCAG relative-luminance formula — not from running an automated accessibility scanner or a
real screen reader/keyboard session against the running app. This catches structural issues (missing
attributes, wrong roles, computable contrast) reliably, but it cannot catch everything a live audit
would: dynamic ARIA states that only appear at runtime, focus order that only manifests through actual
tabbing, or screen-reader-specific quirks in how a given AT announces a given pattern. Treat this
document as a strong first pass, not a substitute for running an automated scanner and a manual
keyboard/screen-reader pass before treating any page as fully WCAG 2.1 AA verified.

# Docvera Modification Changelog

Record of every branding modification made on top of the pinned upstream baseline (`UPSTREAM_VERSION` /
`UPSTREAM_COMMIT`), reconstructed from the git history of `docvera-baseline-v2.20.15`. One entry per
branding commit, in chronological order. Each entry lists the file(s) touched, why the change was made,
how it was implemented, and its impact on future upstream upgrades.

Non-branding supporting commits (docker image pinning, `.gitignore`/`.gitattributes` housekeeping) are
listed at the bottom for traceability but don't get full entries.

---

## `3012c6e6f` — feat(branding): apply Docvera Phase 2 branding changes on top of v2.20.15 baseline

- **Files**: `src-ui/src/app/data/docvera-brand.ts` (new), `src-ui/src/app/data/ui-settings.ts`,
  `src-ui/src/app/components/admin/settings/settings.component.html`,
  `src-ui/src/app/components/app-frame/app-frame.component.html`,
  `src-ui/src/app/components/common/welcome-widget/welcome-widget.component.html`,
  `src-ui/src/assets/logo*.svg`, `docker/compose/docker-compose.env`
- **Reason**: kick off Phase 2 branding — replace Paperless-ngx product identity with Docvera across the
  settings screen, sidebar and welcome widget, and establish a single frontend source of truth for brand
  values.
- **Approach**: introduced `DOCVERA_BRAND` in `docvera-brand.ts`, swapped in Docvera logo assets, and
  edited the three upstream Angular templates/settings files directly to reference the new branding.
  This commit also accidentally included a local `files (2)/` download folder (raw logo/favicon assets
  outside `src-ui/src/assets`) — that was removed in the immediate follow-up commit `a14a4ecca`.
- **Upgrade impact**: `settings.component.html`, `app-frame.component.html`, and `ui-settings.ts` are
  upstream files edited in place — expect merge conflicts here on future `git merge tags/vX.Y.Z` when
  upstream touches settings or the app shell. `docvera-brand.ts` itself is additive and low-risk.

## `637ca40ea` — fix(branding): reapply Docvera text changes on correct v2.20.15 component files

- **Files**: `src-ui/src/app/components/admin/settings/settings.component.html`,
  `src-ui/src/app/components/app-frame/app-frame.component.html`, `src-ui/src/app/data/ui-settings.ts`
- **Reason**: the previous commit had been authored against a mismatched/outdated version of these files,
  producing duplicated or incorrectly placed branding text.
- **Approach**: reapplied the same text substitutions cleanly against the actual pinned v2.20.15 baseline
  content of these three files.
- **Upgrade impact**: same as `3012c6e6f` — these remain modified upstream files. Lesson for future
  rebrand patches: verify against the exact pinned baseline commit before editing, not against a possibly
  stale local checkout.

## `ff4d86ea9` — feat(branding): replace hand-drawn Paperless-ngx SVG logo with Docvera logo asset reference

- **Files**: `src-ui/src/app/components/common/logo/logo.component.html`
- **Reason**: the shared logo component still rendered an inline, hand-drawn Paperless-ngx leaf SVG
  regardless of any custom logo configuration.
- **Approach**: replaced the inline SVG markup with an `<img>` tag pointing at `assets/logo.svg` (falling
  back the same way as before when a `customLogo` override is set).
- **Upgrade impact**: `logo.component.html` is a shared upstream component — any upstream rework of logo
  rendering (new theming support, dark-mode inline SVG, etc.) will conflict here. Re-verify the
  `DOCVERA_BRAND` logo paths still resolve after each upgrade.

## `f5fbbffc7` — feat(branding): replace Paperless-ngx branding in Django templates (loading page, login, logo snippets)

- **Files**: `src/documents/templates/index.html`, `src/documents/templates/paperless-ngx/base.html`,
  `src/documents/templates/paperless-ngx/snippets/svg_leaf.html`,
  `src/documents/templates/paperless-ngx/snippets/svg_logo.html`
- **Reason**: server-rendered Django pages (app loading screen, auth pages) are outside the Angular
  bundle and don't pick up `DOCVERA_BRAND`, so they still showed "Paperless-ngx" in the title, author
  meta tag, and inline logo SVGs.
- **Approach**: updated `<title>`/`<meta name="author">`, and replaced the inline leaf/logo SVG snippets
  with `<img>` tags served from the static Docvera assets via `{% static %}`.
- **Upgrade impact**: highest merge-conflict risk of the branding changes — these are core Django
  templates upstream restructures periodically. Diff carefully against every upstream template change.

## `eb1f796e3` — feat(branding): replace inline paperless leaf SVG with Docvera logo asset in sidebar

- **Files**: `src-ui/src/app/components/app-frame/app-frame.component.html`
- **Reason**: the app shell sidebar still rendered the inline hand-drawn "leaf" SVG in addition to (and
  inconsistently with) the settings/logo changes made in `3012c6e6f`/`637ca40ea`.
- **Approach**: replaced the inline leaf SVG markup with a reference to the Docvera logo asset.
- **Upgrade impact**: `app-frame.component.html` is the core navigation shell and changes frequently
  upstream — moderate-to-high conflict risk on upgrade.

## `a322e343a` — feat(branding): replace Paperless green theme with Docvera Navy (#1A3D7C) in light and dark modes

- **Files**: `src-ui/src/theme.scss`
- **Reason**: switch the app's primary theme color from upstream Paperless green to Docvera Navy, in both
  light and dark mode.
- **Approach**: changed only the HSL values inside the existing `paperless-green` (light:
  `hsl(217, 65%, 29%)`) and `paperless-green-dark-mode` (dark: `42%` lightness) mixins. The mixin *names*,
  the `--pngx-*` custom property names, and the `.paperless-input-*` selectors were deliberately left
  untouched (see `DOCVERA_BRANDING.md`).
- **Upgrade impact**: low — a value-only change inside mixin bodies upstream is unlikely to touch. Merges
  cleanly as long as the mixins aren't renamed or restructured upstream.

## `60170b0a2` — feat(branding): set appTitle to Docvera in both environments and apply Navy theme colors

- **Files**: `src-ui/src/environments/environment.ts`, `src-ui/src/environments/environment.prod.ts`
- **Reason**: the browser tab title / app chrome still read the upstream default rather than "Docvera".
- **Approach**: changed the `appTitle` value in both the dev and prod environment config files.
- **Upgrade impact**: very low — single-field value change in files that rarely change structurally
  upstream.

## `6c926787f` — docs: replace upstream README with Docvera product README

- **Files**: `README.md`
- **Reason**: the repository README described upstream Paperless-ngx rather than the Docvera product,
  its phase/status, or its repository conventions.
- **Approach**: full rewrite as a Docvera-specific product README, while preserving the GPLv3 licensing
  section and upstream attribution requirements.
- **Upgrade impact**: none functionally — `README.md` is never merged for behavior, only reconciled by
  hand on each upstream sync regardless of this change.

## `fb58d3710` — chore: add locale rebranding script with URL and identifier guards

- **Files**: `scripts/docvera-rebrand-locales.ps1` (new)
- **Reason**: hand-editing 47 locale `.xlf` files to rebrand every "Paperless-ngx" string was impractical
  and error-prone; an automated, repeatable, and safe substitution tool was needed.
- **Approach**: PowerShell script that rewrites human-facing brand strings while explicitly guarding
  against rewriting URLs (e.g. `docs.paperless-ngx.com`) and translation-unit/technical identifiers.
- **Upgrade impact**: none on runtime code. The script should be re-run (and its guard list reviewed)
  after every future Crowdin/locale sync from upstream, since new or changed translations will reintroduce
  unbranded strings.

## `dd4e4baf8` — feat(branding): apply Docvera branding across all 47 locale files (704 strings)

- **Files**: `src-ui/src/locale/messages.*.xlf` (all 47 locale files)
- **Reason**: apply Docvera branding to human-facing strings in every translated locale, not just the
  English source strings.
- **Approach**: ran the `scripts/docvera-rebrand-locales.ps1` script (from `fb58d3710`) across all locale
  files, changing 704 strings total, guarded against touching URLs and translation-unit ids/keys.
- **Upgrade impact**: high file churn expected on every future Crowdin sync — new or updated upstream
  translations will reintroduce "Paperless-ngx" strings in locale files and require re-running the
  rebrand script before merging.

## `817d67009` — fix(branding): correct Django auth page colours, byline duplication and favicon path

- **Files**: `src/documents/static/base.css`, `src/documents/templates/index.html`,
  `src/documents/templates/paperless-ngx/base.html`
- **Reason**: post-launch bug pass found three visual defects from the earlier branding commits: the
  Django auth pages used the wrong link color, the "by Veltrix AI" byline rendered twice under certain
  conditions, and the favicon path was broken.
- **Approach**: corrected `--bs-link-color-rgb` to the Navy value (`26, 61, 124`), fixed the template
  conditional that was duplicating the byline block, and corrected the static favicon path.
- **Upgrade impact**: low — narrow, targeted fixes (specific property values / a conditional branch), but
  `base.css` and the auth templates are core upstream files, so re-verify visually after any upstream
  auth-page changes.

---

## `e0fb8c87a` — feat(ui): add shared empty-state component, roll out across app

Not a branding-identity change (no product name/color/logo touched) — logged here at the user's request
because it continues the design-system work started by the `pngx-empty-state` component
(`src-ui/src/app/components/common/empty-state/`), which was already applied to `saved-views`,
`custom-fields`, `workflows`, `mail`, `users-groups`, `processed-mail-dialog` and `document-history`.
This pass found and converted the remaining plain-text empty states elsewhere in `src-ui/src/app/components/`.

- **Files**: `src-ui/src/app/components/common/share-links-dialog/share-links-dialog.component.html`,
  `.ts`
- **Reason**: the document share-links modal rendered its empty state ("No existing links") as a bare
  italic `<li>` instead of the shared component used everywhere else.
- **Approach**: replaced it with `<pngx-empty-state compact="true" icon="link-45deg" ...>`, imported
  `EmptyStateComponent` into the component's standalone `imports`. Body copy avoids the product name
  per `DOCVERA_BRANDING.md` (don't hardcode brand strings in components).
- **Upgrade impact**: low — an isolated dialog component, unlikely to be touched by upstream.

- **Files**:
  `src-ui/src/app/components/common/edit-dialog/workflow-edit-dialog/workflow-edit-dialog.component.html`,
  `.ts`
- **Reason**: the "advanced filters" section of a workflow trigger showed "No advanced workflow filters
  defined." as plain muted text.
- **Approach**: replaced it with `<pngx-empty-state compact="true" icon="funnel" ...>`, added
  `EmptyStateComponent` to the dialog's large standalone `imports` array.
- **Upgrade impact**: moderate — `workflow-edit-dialog.component.html`/`.ts` are large, frequently-touched
  upstream files; re-check this block after upstream workflow-editor changes.

- **Files**: `src-ui/src/app/components/app-frame/toasts-dropdown/toasts-dropdown.component.html`, `.ts`
- **Reason**: the notifications bell dropdown showed "No notifications" as a plain centered `<em>`.
- **Approach**: replaced it with `<pngx-empty-state compact="true" icon="bell" ...>`.
- **Upgrade impact**: low — small, self-contained dropdown component.

- **Files**: `src-ui/src/app/components/app-frame/global-search/global-search.component.html`, `.ts`
- **Reason**: the global search dropdown's "no results" state was a plain `<h6 class="dropdown-header">`.
- **Approach**: replaced it with `<pngx-empty-state compact="true" icon="search" ...>`, preserving the
  existing custom Angular i18n message id (`@@searchResults.noResults`) on the `heading` input via
  `i18n-heading="@@searchResults.noResults"` so existing locale translations for that string are not
  orphaned.
- **Upgrade impact**: low-to-moderate — `global-search.component.html` is a core app-shell file; re-verify
  after upstream search UI changes.

Two other `length === 0` empty-text candidates were reviewed and deliberately left as-is because they
don't match the "plain-text list empty state" pattern the shared component targets: the dashboard's
"Hint: saved views can be created…" card (already has its own icon/card styling, not raw text) and
`drag-drop-select.component.html`'s inline `{{emptyText}}` badge placeholder (a tiny reusable input
widget, not a page/panel-level empty state — wrapping it in the full component would look disproportionate
in its compact badge layout).

---

## `9c81cb9e6` — feat(ui): add shared skeleton component, replace loading spinners

Not a branding-identity change — logged here at the user's request as the second piece of "Docvera
design system Increment 1" (after the empty-state work above). Design system section 5.8 specifies
skeleton placeholders that reproduce the shape of the content being loaded, replacing spinner +
"Loading..." text that causes layout shift once real content arrives.

- **Files**: `src-ui/src/app/components/common/skeleton/skeleton.component.ts`, `.html`, `.scss` (new)
- **Reason**: no shared skeleton component existed; loading states across the app were ad hoc
  `spinner-border` + "Loading..." text, causing a layout jump when content replaced them.
- **Approach**: new standalone `pngx-skeleton` component modeled on `pngx-empty-state`. Inputs:
  `variant` (`'text' | 'card' | 'row' | 'circle'`, default `'text'`), `count` (default `3`), `height`
  (optional CSS override). Colors use `var(--bs-secondary-bg)` / `var(--bs-tertiary-bg)` so it works in
  light and dark mode without new custom properties. The pulse animation is disabled under
  `@media (prefers-reduced-motion: reduce)` (opacity drops to a static 0.6 instead). Rendering is gated
  behind a 200ms `setTimeout` (`visible` flag, cleared in `ngOnDestroy`) so fast responses never show a
  skeleton flash. A `role="status"` + visually-hidden "Loading..." span is kept for screen readers,
  matching the accessibility semantics of the spinners it replaces.
- **Upgrade impact**: none — brand-new, self-contained file.

- **Files**: `src-ui/src/app/components/manage/management-list/management-list.component.html`
  (shared template), plus `tag-list`, `correspondent-list`, `document-type-list` and
  `storage-path-list` `.component.ts` (each has its own standalone `imports`, all four render the same
  shared HTML)
- **Reason**: the tags/correspondents/document types/storage paths tables all showed a spinner in a
  `<tr><td colspan="5">` while the first page loaded.
- **Approach**: replaced it with `<pngx-skeleton variant="row" [count]="3">` inside the existing
  `<td colspan="5">`, keeping the table structurally valid. `SkeletonComponent` added to all four
  concrete list components' `imports` (the abstract `ManagementListComponent` directive has no
  `imports` of its own to edit).
- **Upgrade impact**: moderate — `management-list.component.html` is shared by four components and is a
  file upstream also touches; re-check after upstream table changes. The four `.ts` files are otherwise
  low risk (isolated `imports` array edits).

- **Files**: `src-ui/src/app/components/document-list/document-list.component.html`, `.ts`
- **Reason**: the pagination bar shows a spinner + "Loading..." next to the selection count while
  `list.isReloading`. This is a small inline status indicator, not a full list placeholder.
- **Approach**: replaced it with a single-line `<pngx-skeleton variant="text" [count]="1" height="1rem">`
  sized to sit inline in the existing flex row without disrupting the pagination bar layout. The
  document card/table grid itself has no separate loading indicator in this file, so nothing else
  changed here.
- **Upgrade impact**: low — the pagination `<ng-template>` is small and self-contained.

- **Files**: `src-ui/src/app/components/manage/custom-fields/custom-fields.component.html`, `.ts`
- **Reason**: custom fields list showed a spinner + "Loading..." `<li>` while fetching.
- **Approach**: replaced it with `<pngx-skeleton variant="row" [count]="3">` inside the existing
  `<li class="list-group-item">`.
- **Upgrade impact**: low — isolated list component.

- **Files**: `src-ui/src/app/components/manage/saved-views/saved-views.component.html`, `.ts`
- **Reason**: saved views list showed a spinner + hidden "Loading..." `<li>` while fetching.
- **Approach**: same `<pngx-skeleton variant="row" [count]="3">` replacement inside the existing `<li>`.
- **Upgrade impact**: low — isolated list component.

- **Files**: `src-ui/src/app/components/manage/workflows/workflows.component.html`, `.ts`
- **Reason**: workflows list showed a spinner + "Loading..." `<li>` while fetching.
- **Approach**: same `<pngx-skeleton variant="row" [count]="3">` replacement.
- **Upgrade impact**: low — isolated list component.

- **Files**: `src-ui/src/app/components/manage/mail/mail.component.html`, `.ts`
- **Reason**: three separate loading spinners — the mail accounts list, the mail rules list, and a
  page-level fallback shown while neither has loaded yet.
- **Approach**: all three replaced with `<pngx-skeleton variant="row" [count]="3">`, in place inside
  their existing `<li>`/`<div>` wrappers.
- **Upgrade impact**: low — isolated component, three independent, non-overlapping replacements.

- **Files**: `src-ui/src/app/components/admin/users-groups/users-groups.component.html`, `.ts`
- **Reason**: the combined users/groups page-level spinner shown before either list has loaded.
- **Approach**: replaced with `<pngx-skeleton variant="row" [count]="3">` inside the existing `<div>`.
- **Upgrade impact**: low — isolated component.

- **Files**: `src-ui/src/app/components/admin/tasks/tasks.component.html`, `.ts`
- **Reason**: page-level spinner shown before the first batch of file tasks has loaded.
- **Approach**: replaced with `<pngx-skeleton variant="row" [count]="3">` in place of the spinner block.
- **Upgrade impact**: low-to-moderate — `tasks.component.html`/`.ts` are large, frequently-touched files;
  re-check after upstream task-list changes.

Note: `custom-fields`, `saved-views`, `workflows`, `mail` and `users-groups` also carry empty-state
changes from the previous commit (`e0fb8c87a`) — the two features touch the same files but were kept as
separate commits by temporarily reverting the skeleton hunks, committing the empty-state ones, then
reapplying the skeleton hunks for this commit.

Verified with `pnpm run build` after each pass — production build succeeds; only the expected
"No translation found" warnings appear, for the new English source strings not yet present in the 47
locale `.xlf` files (pre-existing pattern from the empty-state increment, not a regression).

---

## `eee16f0e9` — error states, Increment 1

Landed in the same commit as the accessibility section below (`eee16f0e9`) — both were still uncommitted
when the accessibility pass started, so they were committed together rather than split retroactively.
Not a branding-identity change — logged here at the user's request as the third piece of "Docvera
design system Increment 1" (after empty states and skeleton loading states above). Design system
section 5.9 specifies four severity levels (field, section, page, system) and one absolute rule: never
show a raw exception, stack trace or HTTP status code to a client — log the detail, show a human
sentence. Investigating the two symptoms reported (a raw "Error loading settings" toast for a
no-permission user, and a document list that could show a raw backend error string) surfaced a much
wider, pre-existing bug: across nearly every list in the admin/manage section, a failed load left
`loading` stuck `true` forever with no error shown at all — not just an unclear error, but no feedback
and no way to retry.

- **Files**: `src-ui/src/app/components/common/error-state/error-state.component.ts`, `.html`, `.scss`
  (new)
- **Reason**: no shared component existed for section/page-level errors; every list handled (or failed
  to handle) load failures differently.
- **Approach**: new standalone `pngx-error-state` component modeled on `pngx-empty-state` and
  `pngx-skeleton`. Inputs: `level` (`'section' | 'page'`, default `'section'`), `heading`, `body`,
  `retryLabel` (+ a `retry` output, both optional — omit to render without a button), `showDetails`
  (boolean — gates whether a technical-details disclosure is offered at all), `details` (the raw
  technical string itself; added beyond the requested input list because `showDetails` needs content to
  gate), `icon` (default `exclamation-triangle`). The `<details>`/`<summary>` disclosure is collapsed by
  default and never auto-opened, matching "never visible by default." Colors use `var(--bs-danger)` /
  `var(--bs-tertiary-bg)` / `var(--bs-secondary-color)` for light/dark compatibility, no hardcoded hex.
- **Upgrade impact**: none — brand-new, self-contained file.

- **Files**: `src-ui/src/app/utils/http.ts` (new export `getHttpErrorDetail`)
- **Reason**: every fixed component below needs to turn an `HttpErrorResponse` into a short,
  support-useful string for the error-state's collapsed details — without ever surfacing raw HTML (e.g.
  a Django debug/500 page body), which several backend error paths can return as `error.error`.
- **Approach**: single shared helper: prefers `error.error.detail`, falls back to `error.error` /
  `error.message`, discards anything that looks like an HTML document (`<!doctype`/`<html`), and falls
  back further to the HTTP status line (`"500 Internal Server Error"`) if nothing usable remains.
- **Upgrade impact**: none — additive utility function.

- **Files**: `src-ui/src/app/components/document-list/document-list.component.html`, `.ts`
- **Reason**: the reported "raw HTTP error" symptom — `list.error` (from
  `DocumentListViewService.reload()`, which stores the backend's raw error text/object) was interpolated
  directly into an `alert-danger` div: `Error while loading documents: {{list.error}}`.
  `DocumentListViewService` itself was not changed — it's a service, out of this task's
  `src-ui/src/app/components/` scope, and it already isolates the raw text into one `error: string`
  field rather than leaking it into markup elsewhere.
- **Approach**: replaced the alert with `<pngx-error-state level="page" ...>`, `retryLabel` wired to
  `list.reload()`, `[details]="list.error"` behind `showDetails`.
- **Upgrade impact**: low — a single, well-isolated `@if` branch in the main document list template.

- **Files**: `src-ui/src/app/components/manage/management-list/management-list.component.ts`, `.html`
  (shared by `tag-list`, `correspondent-list`, `document-type-list`, `storage-path-list`
  `.component.ts`, one `ErrorStateComponent` import added to each of the four)
- **Reason**: worst version of the systemic bug — `reloadData()`'s error handler only special-cased
  "Invalid page"; any other failure (permission denied, 500, network) left `loading = true` forever with
  the skeleton spinning indefinitely and nothing else shown.
- **Approach**: added `error`/`errorDetail` fields; the error branch now sets `loading = false`,
  `error = true`, and stores `getHttpErrorDetail(error)`. Template shows
  `<pngx-error-state level="section" ...>` (heading interpolates `typeNamePlural`, e.g. "Couldn't load
  tags" — the same abstract-class-shared-template pattern already used for the collection-size text
  elsewhere in this file) inside the existing `<td colspan="5">`, ahead of the skeleton branch, retry
  wired to `reloadData()`.
- **Upgrade impact**: moderate — same file already flagged moderate-risk in the skeleton increment,
  shared by four components; re-check after upstream table changes.

- **Files**: `src-ui/src/app/components/manage/custom-fields/custom-fields.component.ts`, `.html`
- **Reason**: `reload()`'s `.subscribe(() => {...})` had no error handler at all — an RxJS single-callback
  subscribe silently drops errors, so `loading` never resets and nothing is shown on failure.
- **Approach**: split into `next`/`error` callbacks; error path sets `loading = false`, `error = true`,
  captures detail. Template shows `pngx-error-state` ahead of the skeleton branch inside the existing
  `<li>`, retry wired to `reload()`; the empty-state condition gained an `&& !error` guard so it can't
  fire simultaneously.
- **Upgrade impact**: low — isolated list component.

- **Files**: `src-ui/src/app/components/manage/workflows/workflows.component.ts`, `.html`
- **Reason**: identical bug to custom-fields — `.subscribe(() => {...})`, no error handler, permanently
  stuck loading on failure.
- **Approach**: same fix — `next`/`error` split, `pngx-error-state` ahead of the skeleton branch, retry
  wired to `reload()`, `&& !error` added to the empty-state guard.
- **Upgrade impact**: low — isolated list component.

- **Files**: `src-ui/src/app/components/manage/saved-views/saved-views.component.ts`, `.html`
- **Reason**: same bug, in `ngOnInit()` directly (`.subscribe((r) => {...})`, no error handler, no
  retry method existed at all since load only ever happened once at init).
- **Approach**: extracted the load into a new `reload()` method (called from `ngOnInit()`), added
  `next`/`error` handling, `pngx-error-state` ahead of the skeleton branch inside the existing `<li>`,
  retry wired to the new `reload()`.
- **Upgrade impact**: low — isolated list component; the new `reload()` method is additive.

- **Files**: `src-ui/src/app/components/manage/mail/mail.component.ts`, `.html`
- **Reason**: both the mail-accounts and mail-rules lists had `error:` handlers, but each only called
  `toastService.showError(...)` — `loadingAccounts`/`loadingRules` were never reset to `false`, so both
  skeletons spun forever in addition to the toast firing.
- **Approach**: extracted each load into its own `loadAccounts()`/`loadRules()` method (called from
  `ngOnInit()`), each now sets `loading = false` and tracks its own `accountsError`/`rulesError` +
  detail; toasts removed in favor of the inline `pngx-error-state` (ahead of each skeleton branch),
  retry wired to the respective load method; both empty-state guards gained an error exclusion.
- **Upgrade impact**: low — isolated component, two independent, non-overlapping fixes. Note: a
  pre-existing, unrelated dead-code condition — `@if (!mailAccounts || !mailRules)` at the bottom of the
  template — was left as-is; `mailAccounts`/`mailRules` are initialized to `[]` (truthy), so that branch
  can never render. Out of scope for this pass (not an error-display bug), flagged here for a future
  cleanup.

- **Files**: `src-ui/src/app/components/admin/users-groups/users-groups.component.ts`, `.html`
- **Reason**: same shape of bug as mail — `error:` handlers only toasted, `users`/`groups` stayed
  `undefined`, so the page-level "loading" skeleton spun forever for either list on failure.
- **Approach**: extracted into `loadUsers()`/`loadGroups()` methods, added `usersError`/`groupsError` +
  detail, `pngx-error-state` shown per list ahead of the pre-existing sections, retry wired to the
  respective load method; the trailing combined skeleton condition gained `&& !usersError` /
  `&& !groupsError` so it stops once an error is shown instead of running alongside it.
- **Upgrade impact**: low — isolated component, two independent fixes.

- **Files**: `src-ui/src/app/services/tasks.service.ts`,
  `src-ui/src/app/components/admin/tasks/tasks.component.ts`, `.html`
- **Reason**: the worst instance found — `TasksService.reload()` had no error handler, so on failure
  `loading` stayed `true` forever, and `reload()` itself starts with `if (this.loading) return`: once
  stuck, every future call — including a user-triggered retry — became a permanent no-op requiring a
  full page reload to recover.
- **Approach**: added `error`/`errorDetail` to the service, `next`/`error` split in `reload()`'s
  subscribe. Template shows `pngx-error-state` ahead of the (pre-existing, separately dead-conditioned —
  see note below) skeleton branch, retry wired to `tasksService.reload()`.
- **Upgrade impact**: low-to-moderate — service fix is small and low-risk; `tasks.component.html`/`.ts`
  themselves are large, frequently-touched files. Note: the skeleton branch's guard,
  `!tasksService.completedFileTasks && tasksService.loading`, is itself dead code pre-dating this
  increment (`completedFileTasks` is a getter that always returns an array, so `!` on it is always
  `false`) — the new `error` branch uses a correct, independent condition instead of reusing it. Left
  the pre-existing skeleton condition untouched as out of scope for this pass.

- **Files**: `src-ui/src/app/services/settings.service.ts`,
  `src-ui/src/app/components/app-frame/app-frame.component.ts`, `.html`
- **Reason**: the reported "settings" symptom — `initializeSettings()` (called once at app bootstrap via
  `APP_INITIALIZER`, e.g. right after a no-permission user logs in) falls back to default settings on
  failure and fires `toastService.showError('Error loading settings', error)`, a transient 10-second
  toast with no persistent indication that the app is now running in a degraded state, and no retry.
  `settings.service.ts` and `app.module`'s `APP_INITIALIZER` wiring are services, not components — the
  `APP_INITIALIZER` factory runs before any component template exists, so there is no host template to
  put an error-state into at that point. The banner is instead rendered by `app-frame.component`, which
  is already mounted by the time the (500ms-delayed) toast fires.
  `settings.service.spec.ts` has an existing test asserting the toast fires on a 403
  ("You do not have permission...") — the exact no-permission scenario reported — so the toast call was
  kept as-is (not a `.spec.ts` file was touched) and the banner was added alongside it, not as a
  replacement.
- **Approach**: added `initializationFailed`/`initializationErrorDetail` to `SettingsService`, set in the
  same `catchError` block as the existing toast, cleared at the top of `initializeSettings()`; added a
  `retryInitialization()` method. `app-frame.component.html` renders `<pngx-error-state level="page"
  icon="gear" ...>` above the `<router-outlet>` when `settingsService.initializationFailed` is true,
  retry wired to `settingsService.retryInitialization()`.
- **Upgrade impact**: low — additive service fields/method; `app-frame.component.html` is a core,
  frequently-touched shell file, so re-verify placement after upstream app-frame changes.

Verified with `pnpm run build` — production build succeeds; only the expected "No translation found"
warnings appear, for the new English source strings not yet present in the 47 locale `.xlf` files
(same pre-existing pattern noted in the empty-state and skeleton increments, not a regression).

---

## `eee16f0e9` — accessibility (WCAG 2.1 AA), Increment 1

Not a branding-identity change — logged here at the user's request as the fourth and final piece of
"Docvera design system Increment 1" (after empty states, skeleton loading states, and error states
above). Design system section 7 sets WCAG 2.1 AA criteria as acceptance requirements. Full findings,
including what was *not* fixed and why, are in the new `DOCVERA_ACCESSIBILITY_AUDIT.md` — this entry
summarizes what changed.

- **Files**: 24 component `.html` files across `manage/`, `admin/`, `app-frame/`, `document-detail/`,
  `document-list/`, and `common/` (including `common/input/`) — full list in the audit report.
- **Reason**: 32 icon-only interactive controls (kebab menus, split-toggles, clear/remove/rotate/
  randomize/date-picker buttons, and a systemic pattern of labels hidden via Bootstrap's `d-none
  d-sm-inline` below the `sm` breakpoint — which removes the text from the accessibility tree, not just
  visually) had no accessible name at all.
- **Approach**: added `aria-label` (static via `i18n-aria-label`, or `[attr.aria-label]`/interpolated
  where the control repeats per-row and needs a distinguishing name, e.g. "Remove {{field.name}}").
  1 remaining ambiguous case (a popover-triggering icon whose right label depends on the popover's own
  copy) intentionally left for a design/copy decision — see audit report.
- **Upgrade impact**: low — additive attributes only, no markup restructuring.

- **Files**: `src-ui/src/app/components/app-frame/global-search/global-search.component.scss`
- **Reason**: `* { --pngx-focus-alpha: 0; }` zeroed the app-wide focus-ring variable for every
  focusable element inside the global search feature (nav search box, bound to the `/` hotkey, and its
  entire live results dropdown) — the most severe finding in this audit: a keyboard-driven feature with
  its focus indicator globally suppressed, apparently because the default Navy-colored ring has poor
  contrast against this same navbar's navy background.
- **Approach**: removed the blanket suppression (the dropdown results sit on a light background where
  the default ring works fine) and added a targeted `:focus-visible` outline
  (`2px solid rgba(255,255,255,0.9)`) on the search `<input>` specifically, since that's the one element
  actually on the dark navbar.
- **Upgrade impact**: low — single component-scoped stylesheet.

- **Files**: `src-ui/src/app/components/common/input/{text,number,select,textarea,monetary,entries,
  file,password,url,date,color}/*.component.html` (11 files)
- **Reason**: every shared reusable form-input component's `.invalid-feedback` validation-error message
  had no `role`/`aria-live` — meaning validation errors in essentially every form in the app (all
  edit dialogs, settings forms) were visible but silent to screen readers. Toasts were checked too and
  found already correct (`ngb-toast` applies `role="alert"`/`aria-live="polite"` automatically — no fix
  needed there).
- **Approach**: added `role="alert"` to each `.invalid-feedback` div. Single highest-leverage fix in
  this pass — 11 small identical edits cover validation announcements app-wide.
- **Upgrade impact**: low — one attribute added per file, no markup restructuring.

- **Files**: `src-ui/src/app/components/common/empty-state/empty-state.component.ts`, `.html`;
  `src-ui/src/app/components/common/error-state/error-state.component.ts`, `.html`
- **Reason**: both components hard-coded their heading as a literal `<h5>`. As reusable components
  dropped into pages with varying heading depth, this risked skipping heading levels (WCAG 1.3.1/2.4.6)
  depending on where a given page landed — something the component can't know about itself.
- **Approach**: added a `headingLevel` input (default `2`) and switched the heading markup to a generic
  element with `role="heading"` + `[attr.aria-level]="headingLevel"` — the standard technique for a
  configurable heading level in a reusable component. Same CSS class retained
  (`.empty-heading`/`.error-heading`, styled by class not tag), so no visual change. Default `2` is safe
  in effectively every placement, since going shallower than the surrounding context is never a WCAG
  skip — only the old hard-coded `5` (going deeper) risked one.
- **Upgrade impact**: none — additive input with a safe default; existing call sites are unaffected
  visually and behaviorally.

- **Files**: `DOCVERA_ACCESSIBILITY_AUDIT.md` (new)
- **Reason**: document color-contrast findings that were investigated and measured but not
  auto-fixed, per this task's own scoping rule ("only fix if it's a simple token adjustment").
- **Approach**: computed WCAG relative-luminance contrast ratios by hand for the Docvera Navy primary
  color. Light mode passes comfortably everywhere (~10.5:1). Dark mode fails on two pairings that both
  use the same `--pngx-primary-lightness` token and need it to move in *opposite* directions to pass:
  Navy-as-link-text-on-page-background (~2.76:1, needs lighter) vs. gray-button-text-on-Navy-background
  (~3.07:1, needs the background to stay dark, gets *worse* if lightened to fix the first pairing —
  recomputed at a lightness that fixes pairing 1, pairing 2 drops to ~1.81:1). Not a simple token bump;
  needs either a second distinct color token or a different foreground/background pairing strategy —
  flagged for a design decision rather than guessed at. Teal/accent blue not checked: confirmed (from a
  prior pass's branding inventory) not wired into any live UI element yet, so no violation is possible
  until they are.
- **Upgrade impact**: none — documentation only, no code change from this item.

Verified with `pnpm run build` — production build succeeds; only the expected "No translation found"
warnings appear, for the new English source strings (aria-labels included — they're `i18n`-tagged like
any other UI string) not yet present in the 47 locale `.xlf` files (same pre-existing pattern noted in
every prior increment in this section, not a regression).

What was investigated but explicitly not fixed in this pass — full keyboard walkthrough, landmark/heading
audit beyond the one concrete fix above, 200% zoom verification beyond the three new components, and
app-wide `prefers-reduced-motion` coverage beyond `pngx-skeleton` (six other `.scss` files have
short hover/UI transitions without the media query — not treated as violations, since WCAG's
reduced-motion criterion targets sustained/large motion, not brief hover transitions) — is recorded in
`DOCVERA_ACCESSIBILITY_AUDIT.md` rather than silently dropped.

---

## `4d4392d9a` — dark-mode contrast decision, Increment 1 follow-up

Direct follow-up to the accessibility audit above. `DOCVERA_ACCESSIBILITY_AUDIT.md` §4 flagged a
dark-mode contrast failure as needing a design decision rather than an automatic fix, because the
single `--pngx-primary-lightness` token was shared by two pairings that needed to move in opposite
directions. The user made that decision explicitly: accessibility over exact brand-hue fidelity.

- **Files**: `src-ui/src/theme.scss`
- **Reason**: apply the decision — Navy-colored text/links directly on the dark page background
  (`.text-primary`, default `<a>` links, `.btn-link` text) measured ≈2.76:1, failing the 4.5:1 minimum.
- **Approach**: raised `--pngx-primary-lightness` in the `paperless-green-dark-mode` mixin from `42%`
  to `58%` (`hsl(217, 65%, 58%)` ≈ `rgb(78, 132, 218)`). Recomputed: text/link-on-page-background now
  ≈4.85:1, passing. The trade-off flagged in the audit is real and not silently absorbed: light-gray
  button label text on this same Navy background (`.btn-primary` text, dark mode) was already failing
  at ≈3.07:1 and is now measurably worse at ≈1.75:1, since the background lightened toward the
  foreground text color instead of away from it. Documented, not fixed here — needs its own follow-up
  (a second distinct color token, or a different foreground for that specific pairing).
- **Upgrade impact**: low, single-value token change — but re-verify the keyboard focus ring (§2 of the
  audit; it derives its color from these same variables) and the newly-worse button-text pairing before
  calling dark mode fully AA-compliant.

- **Files**: `DOCVERA_ACCESSIBILITY_AUDIT.md`
- **Approach**: updated §4 (Color contrast) and the summary table with the applied fix, the recomputed
  numbers for both pairings, and the accepted trade-off — not marked as a second violation "fixed,"
  since pairing 2 is worse than before, only pairing 1 is resolved.

- **Files**: `DOCVERA_DESIGN_SYSTEM.md` (new)
- **Reason**: this file was referenced throughout Increment 1 (component docstrings, the audit report)
  as the source spec for sections 5.7 (empty states), 5.8 (skeletons), 5.9 (error states), and 7
  (accessibility) but never actually existed in this repository. Asked the user for clarification
  rather than silently fabricating it; the user asked for it to be created now.
- **Approach**: reconstructed sections 5.7/5.8/5.9/7 from what was actually specified and implemented
  across this increment (inputs, behavior requirements, usage rules per component, the WCAG 2.1 AA
  criteria list, and this color-token decision), with an explicit scope note that this covers only what
  Increment 1 built — not a claim that the rest of a complete design system exists in this file.
- **Upgrade impact**: none — new reference documentation.

Verified with `pnpm run build` after the `theme.scss` change — production build succeeds.

---

## `07acdcf24` — feat(ui): redesign auth pages as two-column layout, Increment 2

Approved plan increment (Mahmoud), distinct from "Increment 1" (empty/loading/error states +
accessibility) above. Scope, per the request: redesign the login page and every page it shares a base
template with into a two-column layout — Navy brand panel + form — without touching authentication
logic. These are Django-rendered pages (`src/documents/templates/`), not Angular.

- **Files**: `src/documents/templates/paperless-ngx/base.html`
- **Reason**: this one file is the shared shell for every account-flow page in the app (confirmed by
  grepping for `extends "paperless-ngx/base.html"` — 11 templates, covering `account/`, `mfa/`, and
  `socialaccount/`), so redesigning it once reskins the whole flow consistently rather than duplicating
  layout markup per page.
- **Approach**: replaced the single centered-form body with a two-column grid: a `<aside class="auth-brand">`
  (Navy `#1A3D7C` background, logo + "by Veltrix AI" byline, "Intelligent document management"
  title, bilingual-search-automation-isolation subtitle, four value points with inline SVG icons, a
  copyright line) and a `<main class="auth-form-col">` (the existing `form-account` form, now preceded
  by new `form_title`/`form_subtitle` blocks, followed by a new support-link footer pointing at the
  existing `DOCVERA_BRAND.supportUrl` rather than a made-up address). The brand panel is a genuine
  `<aside>` landmark (not `aria-hidden`) since its copy has real informational value, not just
  decoration — screen reader users can still reach it, and since it contains no interactive controls,
  including it doesn't disturb tab order either way.
- **Upgrade impact**: high blast radius by design (every account-flow page inherits it) but low
  mechanical risk — no field names, `name=`/`action=`/`method=` attributes, URL tags, or view logic
  were touched, only the surrounding chrome and block structure.

- **Files**: `src/documents/templates/account/{login,signup,password_reset,password_reset_done,
  password_reset_from_key,password_reset_from_key_done,account_inactive}.html`,
  `src/documents/templates/mfa/authenticate.html`,
  `src/documents/templates/socialaccount/{login,signup,authentication_error}.html` (10 files)
- **Reason**: (a) fill in the new `form_title`/`form_subtitle` blocks per page so none render an empty
  `<h1>`; (b) replace Bootstrap's `.form-floating` pattern (a real `<label>`, but one that overlaps the
  input until focused/filled — closer in spirit to a placeholder than a persistently visible label)
  with a standard always-visible label-above-input pattern, per design system §5.2's "visible
  persistent labels, not placeholder-as-label."
- **Approach**: every `<input>` kept its exact `name`/`id`/`type`/`required`/`autocomplete` attributes;
  only the wrapping markup changed (`.form-floating` divs → `.auth-field` divs, `<label>` moved above
  the input, `placeholder=` attributes dropped since the label already states the purpose). The
  now-unused `.form-stacked-{top,middle,bottom}` CSS (previously used to visually merge floating inputs
  into one seamless bordered stack) was removed from `base.css` along with the classes' last usages.
  Login gained a "Remember me" checkbox + "Forgot password?" link in one row, and an "or" divider
  followed by a disabled "Single sign-on (SSO)" button (native `title="Coming soon"` tooltip — no JS
  tooltip library is loaded on these pages — plus a small always-visible caption below it, so the
  "coming soon" information isn't hover-only and therefore isn't lost on touch devices or to
  screen-reader users who don't trigger `title`). Signup gained an `alert-info`/`role="status"` treatment
  for the first-install notice.
- **"Remember me" is conditionally rendered, not always shown**: the app's `LoginForm` only exposes a
  `remember` field when `ACCOUNT_SESSION_REMEMBER` is unset (`None`) at the Django settings level; this
  instance hardcodes it to a fixed `True`/`False` via `PAPERLESS_ACCOUNT_SESSION_REMEMBER`, so the field
  doesn't exist on the form today and the checkbox correctly doesn't render (`{% if form.remember %}`).
  Rendering a checkbox with a bogus `name="remember"` regardless would have been non-functional,
  misleading UI — out of scope to fix, since enabling it requires a `settings.py` change, which is
  authentication *configuration*, not presentation, and wasn't asked for.
- **Upgrade impact**: low per file — same auth logic, same URL names, same form field names throughout.

- **Files**: `src/documents/templates/account/signup_closed.html` (new)
- **Reason**: found while verifying the deployment, not part of the original request — this instance
  currently has signups closed, and `/accounts/signup/` was rendering allauth's own unbranded default
  template (`account/signup_closed.html`), never previously overridden by this app. Real, currently-live
  gap, not hypothetical.
- **Approach**: added the same `extends "paperless-ngx/base.html"` override used everywhere else. Purely
  static informational text, no form, no auth-logic risk.
- **Upgrade impact**: none — new file, no existing behavior changed.

- **Files**: `src/documents/static/base.css`
- **Reason**: implement the two-column grid, brand panel, feature list, field/label styling, "or"
  divider, disabled-SSO treatment, and the required breakpoint behavior.
- **Approach**: `.auth-layout` is a two-column CSS grid (`5fr`/`6fr`, brand panel slightly narrower than
  the form column) at ≥768px. Below 768px, per the request's own stated options ("passe au-dessus...,
  réduit, ou disparaît"), the brand panel is hidden entirely (`display: none`) rather than shown
  stacked-and-shrunk above the form — chosen for robustness on a page with zero JavaScript to help
  layout decisions, and because the instruction explicitly allowed it; a compact Docvera logotype
  (reusing the existing `svg_logo.html` snippet) appears above the form on narrow viewports instead, so
  brand identity isn't lost outright, only the marketing panel. Colors reuse the existing
  `--pngx-primary`/`--bs-body-bg`/dark-mode custom properties already defined in this file rather than
  introducing new ones; new `--pngx-surface`, `--pngx-surface-border`, `--pngx-text-muted` tokens were
  added (with dark-mode overrides in the existing `prefers-color-scheme: dark` block) for the divider
  line, muted subtitle/footer text, and field spacing that the previous single-column form didn't need.
  Focus indicators use an explicit `:focus-visible` outline (Navy on the light form column, white on the
  off-chance something focusable ever lands in the brand panel) *in addition to* Bootstrap's existing
  focus box-shadow, not instead of it.
- **Contrast verified by computation, not eyeballed**: white brand-panel text at the lowest opacity used
  (`rgba(255,255,255,0.65)`, the copyright line) blends to ≈`rgb(175,187,209)` against the Navy
  background, ≈5.4:1 — passes 4.5:1 with margin. Navy-on-white (labels, body text, the form column
  generally) inherits the ≈10.5:1 ratio already established in `DOCVERA_ACCESSIBILITY_AUDIT.md` §4.
- **Upgrade impact**: low — additive rules plus removal of the now-dead `.form-stacked-*` rules; no
  existing selector used elsewhere in the app was renamed or removed.

**Architecture finding, not fixed — flagged rather than silently worked around**: this app's `mfa/`
override (`mfa/authenticate.html`) and every `account/`/`socialaccount/` template use an older,
straightforward extension of `paperless-ngx/base.html`. This is *not* how allauth's own MFA subsystem
works internally, though — its other MFA pages (recovery codes, WebAuthn add/edit, TOTP setup, trust-
device, etc.) are not overridden by this app at all, and use a completely different, newer allauth
template architecture (`{% element %}`/`{% slot %}` tags rendering against `allauth/layouts/base.html`,
a deliberately bare, unstyled layout meant to be overridden by the consuming app). Only the one MFA page
in the actual login path (`mfa/authenticate.html`) was already overridden and is covered by this
increment. The rest of the MFA management UI (reached from account settings, not from login) remains
completely unstyled/unbranded. Fixing that properly means overriding `allauth/layouts/base.html` (and
possibly `allauth/elements/*.html` to restyle its buttons/fields/forms) — files outside
`src/documents/templates/paperless-ngx/` and `account/`, the two directories this task was explicitly
scoped to, and a distinct enough undertaking (a second template architecture, not a copy-paste of the
pattern used here) that it deserves its own explicitly-scoped follow-up rather than being extended to
silently now.

Deployed and manually verified via `docker exec curl` against the running container (not just a build
check, since these are server-rendered pages with no separate frontend build step): `/accounts/login/`,
`/accounts/signup/` (currently renders the new `signup_closed.html`, since signups are closed on this
instance), and `/accounts/password/reset/` all return HTTP 200 with the new two-column markup present;
`/static/base.css` returns HTTP 200; no errors in the webserver logs since the restart.

---

## Dashboard redesign — onboarding checklist + useful metrics, Increment 2 (pending commit)

Second piece of "Increment 2" (after the auth-pages redesign above). Approved plan: Mahmoud requested a
hybrid dashboard — a dismissible onboarding checklist for the admin, plus content useful to the everyday
user — to replace the permanent welcome alert and a statistics panel whose only headline number
("Total characters") has no business value. Not a branding-identity change; logged here at the user's
request, same as the empty-state/skeleton/error-state entries above.

- **Files**: `src/documents/views.py` (`StatisticsView`), `src/documents/tests/test_api_documents.py`
- **Reason**: the dashboard needed two numbers the `/api/statistics/` endpoint didn't expose yet:
  how many documents are currently being consumed/reprocessed, and how much storage is in use.
- **Approach**: added `documents_in_workflow` (count of `PaperlessTask` rows with
  `task_name=consume_file` and `status` in `PENDING`/`STARTED` — covers both first-time consumption and
  a document sent through "Redo OCR"/reprocess, since that re-runs the same task against an
  already-existing `Document` row) and `storage_used_bytes` (`os.statvfs(settings.MEDIA_ROOT)`, same
  technique already used by `SystemStatusView` for its disk stats, but exposed here to every
  `/api/statistics/` caller rather than staff-only, since the dashboard metrics widget is gated by
  `UISettings` view permission, not `is_staff`). Added matching assertions to the existing
  `test_statistics` test rather than a new test method, plus one `assertIn`/`assertGreaterEqual` pair for
  the storage field (an exact byte count isn't meaningfully assertable in a test environment).
- **Upgrade impact**: low — two additive keys on an existing response dict; no existing key changed
  shape or meaning.

- **Files**: `src-ui/src/app/data/ui-settings.ts`, `src-ui/src/app/services/settings.service.ts`
- **Reason**: the onboarding checklist's dismissal (manual, or automatic once all 5 steps are done) has
  to persist server-side per user, the same way `TOUR_COMPLETE` already does — a client-only flag would
  reappear on every new device/browser and defeat "ne doit pas réapparaître une fois écartée."
- **Approach**: added `SETTINGS_KEYS.ONBOARDING_CHECKLIST_DISMISSED`
  (`general-settings:dashboard:onboarding-checklist-dismissed`, boolean, default `false`) following the
  exact `TOUR_COMPLETE` pattern, plus `SettingsService.onboardingChecklistDismissed` (getter) and
  `dismissOnboardingChecklist()` (setter + `storeSettings()`), mirroring `completeTour()`.
- **Upgrade impact**: none — new setting key, additive.

- **Files**: `src-ui/src/app/components/dashboard/widgets/onboarding-checklist/*` (new)
- **Reason**: give a new admin a guided path to first value instead of an empty dashboard.
- **Approach**: a dismissible card, visible only to admins (`PermissionsService.isAdmin()`, checked by
  the parent `DashboardComponent`, not inside the widget), showing "Initial setup — X of 5" with a
  progress bar and five steps derived from real system state, not a hand-maintained flag: import a
  document (`statistics.documents_total > 0`), create a tag (`tag_count > 0`), set up a correspondent
  (`correspondent_count > 0`), connect a mailbox (`MailAccountService.listAll().length > 0`, only
  queried if the user can view `MailAccount`), and invite a collaborator
  (`UserService.listAll().length > 1`, only queried if the user can view `User`). Each incomplete step
  with an accessible target links to that page (`/tags`, `/correspondents`, `/mail`, `/usersgroups`); the
  "import a document" step instead emits a `triggerUpload` output, since there's no dedicated upload
  route — `DashboardComponent` wires that to a new `openFilePicker()` method on
  `UploadFileWidgetComponent` (a `@ViewChild('fileUpload')` on its existing hidden file input) via a
  `@ViewChild` reference, so it opens the same file picker the sidebar upload widget already uses rather
  than duplicating upload logic. When all 5 steps are complete, or the user clicks the close button, the
  card calls `dismissOnboardingChecklist()` and never renders again for that user. Uses
  `pngx-skeleton`/`pngx-error-state` for its own loading/error states per the design system.
- **Upgrade impact**: none — new component, only referenced from `dashboard.component.html`.

- **Files**: `src-ui/src/app/components/dashboard/dashboard.component.html`,
  `src-ui/src/app/components/dashboard/dashboard.component.ts`
- **Reason**: wire in the new checklist and the two new widgets below, and resolve the overlap between
  the new checklist and the pre-existing "welcome" alert (`pngx-welcome-widget`), which served a similar
  first-run purpose.
- **Approach**: admins now see the onboarding checklist instead of the welcome alert (the welcome
  alert's own `offerTour()` condition — dashboard empty, tour not completed — is unchanged and still
  governs it for non-admins, who can't act on most checklist steps anyway and still need a path to the
  tour). The tour itself isn't lost for admins: it's already reachable from Settings (existing
  "restart the tour" toast copy), unchanged. Added a `@ViewChild(UploadFileWidgetComponent)` and
  `triggerUpload()` method to route both the checklist's and the new quick-actions widget's upload
  requests to the sidebar upload widget's file picker.
- **Upgrade impact**: moderate — `dashboard.component.html`/`.ts` are shared upstream files touched
  directly; future `git merge tags/vX.Y.Z` that reworks the dashboard layout or the welcome-widget
  condition will need manual reconciliation here.

- **Files**: `src-ui/src/app/components/dashboard/widgets/statistics-widget/*`
- **Reason**: replace the old "peu utile" panel (led with total character count, a number with no
  business meaning) with the four metrics Mahmoud asked for, and bring the widget's loading/error
  handling up to the design system (it previously had no error handling at all — a failed
  `/api/statistics/` request just left the widget stuck on its loading placeholder forever).
- **Approach**: kept the component/selector (`pngx-statistics-widget`) since this is a redesign of the
  existing panel, not a new one — only its template and the `Statistics` interface changed. Now shows,
  in order: documents in inbox (unchanged position — kept first so the existing
  `should display inbox link with count` test, which asserts the *first* `<a>` in the widget is the inbox
  link, still passes unmodified), total documents, documents processing
  (`documents_in_workflow`, only shown when non-zero), storage used (`storage_used_bytes`, formatted via
  a new small `formatBytes()` utility in `src-ui/src/app/utils/bytes.ts`), and current ASN (unchanged).
  "Total characters" is gone entirely — not hidden, removed. The file-type distribution bar is
  unchanged in structure (it was already a single compact progress bar plus a wrapped legend inside this
  same card, not a separate block) but gained a small "File types" label so it doesn't read as an
  unlabeled continuation of the metrics list above it. Replaced the hand-rolled `placeholder-glow`
  loading markup with `pngx-skeleton`, and added a `pngx-error-state` branch with retry — the widget can
  now actually recover from a failed request instead of spinning forever.
- **Upgrade impact**: low — same component/selector, no other component references its removed
  `character_count` display (nothing else in the app reads that field off this widget).

- **Files**: `src-ui/src/app/components/dashboard/widgets/recent-documents-widget/*` (new)
- **Reason**: give the dashboard a live view of recent activity, per the request's "5 derniers
  documents" requirement.
- **Approach**: fetches the 5 most recently added documents (`DocumentService.list(1, 5, 'added', true)`)
  alongside the inbox tag IDs and any active `consume_file` tasks, then derives a status badge per
  document: "Processing" if an active task's `task_file_name` matches the document's
  `original_file_name` (the reprocess/redo-OCR case — a `Document` row only exists once first-time
  consumption has already finished, so this is the only real "still processing" state an existing row
  can be in), else "Needs review" if it carries the inbox tag, else "Processed". Each row shows a
  mime-type icon, title, correspondent (`correspondentName` pipe), and a relative date via the existing
  `customDate:'relative'` pipe format (no new date-formatting logic was written). Uses
  `pngx-empty-state`/`pngx-skeleton`/`pngx-error-state` for its three non-happy-path states, and is
  gated by `Document` view permission like the rest of the document UI.
- **Upgrade impact**: none — new component.

- **Files**: `src-ui/src/app/components/dashboard/widgets/quick-actions-widget/*` (new)
- **Reason**: the three shortcuts Mahmoud asked for (upload, search, manage tags).
- **Approach**: three permission-gated buttons/links: "Upload a document" (same `triggerUpload` output
  as the checklist, same underlying file picker — intentionally duplicates the sidebar upload widget's
  entry point rather than routing elsewhere, since upload has no dedicated page), "Search" (routes to
  `/documents`, the app's actual filter/search surface — a synthetic `/` keypress to focus the top-bar
  global search input was considered and rejected as more fragile than a plain route for a "quick
  action" button), "Manage tags" (routes to `/tags`).
- **Upgrade impact**: none — new component.

- **Files**: `src-ui/src/main.ts`
- **Reason**: `ngx-bootstrap-icons` only registers a curated subset of icons app-wide (a tree-shaking
  choice already established before this change); the new widgets needed icon names outside that
  existing set.
- **Approach**: added `circle`, `graphUp`, `inbox`, `fileEarmarkImage`, `fileEarmarkPdf`,
  `fileEarmarkSpreadsheet`, `fileEarmarkText`, `fileEarmarkWord` to both the import list and the `icons`
  object, in the same alphabetical position convention already used for the existing ~120 icons. Verified
  each export actually exists in the installed `ngx-bootstrap-icons` package before adding it.
- **Upgrade impact**: none — additive only; no existing icon entry touched.

**Not covered by this increment**: no new automated tests were added for the four new/rewritten
components beyond the backend `test_statistics` additions and the `dashboard.component.spec.ts`
`PermissionsService` mock fix (added a missing `isAdmin` stub the new template-level `isAdmin()` call
now requires — without it every existing dashboard test would have failed on `fixture.detectChanges()`).
Verified instead via `ng build --configuration production` (clean compile, all templates type-check) and
the full existing `dashboard`-scoped Jest suite (`npx jest --testPathPatterns=dashboard`), which passed
except one pre-existing, unrelated failure (`should show a welcome message` still asserts the string
"Paperless-ngx" instead of "Docvera" — a leftover from the branding rebrand, not touched or introduced by
this change).

### Bug-fix pass, same increment (post-review)

A first deploy of the above was reviewed live and seven issues were reported. Investigated each against
the running instance (via browser devtools/network — not just re-reading the code) before changing
anything, since two of the seven turned out not to be code bugs at all.

1. **Checklist never visible** — not a gating bug. `permissionsService.isAdmin()` was true and the
   checklist's own network calls (`/api/statistics/`, `/api/mail_accounts/`, `/api/users/`) were
   succeeding; confirmed via the browser's network panel. The real cause: this review instance
   genuinely has all 5 steps already satisfied (10 documents, 1 tag, 1 correspondent, 1 mail account, 2
   users), so `allComplete` was true on the very first load and `dismissOnboardingChecklist()` fired
   synchronously inside the same `reload()` callback that computed the steps — by the time Angular
   painted, `settingsService.onboardingChecklistDismissed` already read `true`, so the card never
   rendered even once. That's a real gap even though the dismiss-on-complete behavior itself is exactly
   what "Disparaît définitivement une fois les 5 étapes faites" asked for: an admin who finishes the last
   step gets zero visual confirmation before it vanishes.
   - **Files**: `onboarding-checklist.component.ts`, `onboarding-checklist.component.html`
   - **Approach**: added a `visible` flag captured once at `ngOnInit` from
     `!settingsService.onboardingChecklistDismissed`, instead of the template reading that getter live on
     every change-detection pass. Reaching 5/5 still calls `dismissOnboardingChecklist()` immediately (so
     a *future* load won't show it), but `visible` stays `true` for the remainder of *this* component's
     lifetime, and the template gained a distinct "Setup complete — all 5 steps are done" branch (green
     check, no progress bar) so completing the checklist is an event the admin actually sees, not a
     silent disappearance. Only the manual close button sets `visible = false` immediately.
   - For review purposes the test account's already-persisted `onboarding_checklist_dismissed: true` was
     reset via an authenticated `POST /api/ui_settings/` call so the fix could be verified end to end.

2. **Mixed English/French text** — real gap: `messages.fr_FR.xlf` had no entries for any of the new
   dashboard strings (and, discovered while fixing this, none for the shared `pngx-empty-state`/
   `pngx-error-state`/`pngx-skeleton` strings from Increment 1 either — that broader gap is pre-existing,
   not introduced here, and is flagged below rather than fixed, since it touches components this task
   didn't scope).
   - **Files**: `src-ui/messages.xlf`, `src-ui/src/locale/messages.fr_FR.xlf`
   - **Approach**: ran `ng extract-i18n` to refresh the tracked source-language `messages.xlf` (1844
     messages), then added 34 `<trans-unit>` entries to `messages.fr_FR.xlf` — every new/changed string
     introduced by this increment's four dashboard components, plus the two shared `error-state` strings
     they use ("Retry", "Technical details", which fixes those two app-wide as a side effect since
     translation lookup is by message content hash, not by which component renders it). IDs and exact
     `<source>` markup (including the `<x id="INTERPOLATION".../>` placeholders in "Initial setup — X of
     Y") were copied verbatim from the regenerated `messages.xlf`, not retyped, to guarantee exact
     matches. Verified with `ng build --configuration production --localize=fr-FR`: zero "No translation
     found" warnings for any of the 34 strings.
   - **Not fixed, flagged**: the pre-existing Increment 1 gap (empty-state/error-state/skeleton default
     strings across the rest of the app — settings, mail, workflows, etc. — never had French entries
     added when those components were built). Same root cause, much larger surface; left for its own pass.

3. **Recent-documents titles: dark gray on dark background** — real bug, and turned out to share a root
   cause with part of #2. Bootstrap 5.3's `.text-body`/`.text-muted` utility classes render via
   `color: rgba(var(--bs-body-color-rgb), ...)`, but this app's `@mixin dark-mode` in `theme.scss` only
   ever overrode the hex variables `--bs-body-color`/`--bs-secondary-color` — never their `-rgb`
   companions (unlike `--bs-light-rgb`, `--bs-danger-rgb`, `--bs-info-rgb`, `--bs-body-bg-rgb`, which
   **were** all paired correctly in the same mixin). So `.text-body`/`.text-muted` silently fell back to
   Bootstrap's light-mode RGB defaults in dark mode — dark gray text — while `color: var(--bs-body-color)`
   used directly (not through those utility classes) worked correctly. That's a real, previously-unknown,
   app-wide dark-mode contrast bug, not unique to this widget.
   - **Files**: `src-ui/src/theme.scss` (root cause), `recent-documents-widget.component.html`/`.scss`
     (the widget this was reported on)
   - **Approach**: added `--bs-body-color-rgb`/`--bs-secondary-color-rgb` to `@mixin dark-mode`, computed
     from the same `$text-color-dark-bg`/`#6c757d` values already driving the hex variables (via
     `color.channel()`, not the deprecated `color.red/green/blue()`) — fixes `.text-body`/`.text-muted`
     app-wide in dark mode as a side effect, not just this widget. Also, as instructed, stopped relying on
     the utility classes here specifically: the title and metadata line now use dedicated
     `.recent-document-title { color: var(--bs-body-color) }` / `.recent-document-meta { color:
     var(--bs-secondary-color) }` rules in the widget's own stylesheet, so this widget is correct
     independent of the shared-utility fix too.
   - **Not fixed, flagged**: `--bs-secondary-color: #6c757d` against the dark body background
     (`#161618`) measures ≈3.75:1 — below the 4.5:1 AA threshold for normal text, a pre-existing token
     *value* issue distinct from the `-rgb` wiring bug just fixed. Not changed here since it's a
     brand/token-value tradeoff (like the primary-lightness decision in
     `DOCVERA_ACCESSIBILITY_AUDIT.md` §4), not a wiring bug, and touching it would affect every
     `.text-muted`/`.text-secondary` usage app-wide — out of this task's scope.

4. **Storage: "93.5 GB" for ~2 MB of documents** — real bug. `StatisticsView.storage_used_bytes` was
   computed from `os.statvfs(settings.MEDIA_ROOT)` — total *disk/volume* usage, not document storage —
   inherited from copying `SystemStatusView`'s existing pattern without adjusting it for what this metric
   is supposed to represent.
   - **Files**: `src/documents/views.py`
   - **Approach**: replaced the `statvfs` call with a sum of `Path.stat().st_size` over each visible
     document's original file (`source_path`) and, if present, its archive file (`archive_path`), reusing
     the same permission-scoped `documents` queryset already built earlier in the view (re-`.only()`'d to
     just the fields `source_path`/`archive_path` need, since Django's `only()` replaces rather than
     unions the previous field list). Wrapped each `.stat()` in `try/except OSError` rather than an
     `.is_file()` pre-check, avoiding a TOCTOU gap. No test change needed — the existing
     `assertGreaterEqual(..., 0)` assertion already covers this correctly (test documents have no real
     files on disk, so the sum is legitimately 0).
   - **Upgrade impact**: low — same response key, corrected computation only.

5. **Duplicate statistics panel** — the sidebar's tag/correspondent/document-type/storage-path counts
   were a deliberate keep from the pre-redesign widget (not removed in the first pass), not an oversight,
   but the review is right that showing them at the same visual weight as the four new primary metrics
   reads as two competing panels.
   - **Files**: `statistics-widget.component.html`/`.scss`
   - **Approach**: replaced the four `list-group-item` rows (full-width, badge-pill styled, one skeleton
     placeholder each) with a single `d-flex flex-wrap` row of small, muted, un-bordered links
     (`.secondary-stats`/`.secondary-stat-link`, `0.8125rem`, `--bs-secondary-color`) below a `border-top`
     separator — same four counts, same links, clearly subordinate to the primary metrics list above
     instead of duplicating its weight. Loading/error states no longer render a separate placeholder for
     this row; it simply doesn't render until the primary content has successfully loaded.

6. **Correspondent metadata missing on recent documents** — not a code bug: checked via
   `GET /api/documents/?page=1&page_size=5&ordering=-added` directly and all 5 of this instance's most
   recent documents genuinely have `correspondent: null`. The widget's existing
   `@if (document.correspondent) { ... }` guard (already present before this fix-round) is exactly the
   "show it when it exists" behavior asked for — there's simply no correspondent on this instance's
   current 5 most recent documents to show. No change made.

7. **Quick actions / Recent documents lacking visual weight** — real, and traced to a pre-existing
   dark-mode characteristic: `widget-frame`'s default (non-cardless) card uses Bootstrap's `bg-light`,
   which in this app's dark mode resolves to `#1c1c1f` — very close to the page background `#161618` —
   with a barely-visible default card border. That's true of every widget using `widget-frame` in dark
   mode (including the pre-existing Statistics card), but reads as most noticeable on the two thinnest,
   content-sparsest new widgets. Rather than touching `widget-frame` itself (shared by every widget
   app-wide — out of this task's stated scope), gave these two specific widgets their own explicit
   surface.
   - **Files**: `src-ui/src/styles.scss` (new shared tokens/classes), `quick-actions-widget.component.html`,
     `recent-documents-widget.component.html`
   - **Approach**: introduced a small 4px-based spacing/radius scale (`--dv-space-1`..`--dv-space-4`,
     `--dv-radius-sm`/`--dv-radius-md`) and two reusable classes, `.docvera-section-card` (explicit
     `1px solid var(--bs-border-color)` border, `var(--dv-radius-md)` = 8px radius,
     `padding: var(--dv-space-4)`) and `.docvera-section-title` (the accessible `role="heading"
     aria-level="2"` pattern already used by `empty-state`/`error-state`/the onboarding checklist, sized
     as a real section heading rather than `widget-frame`'s generic `<h6 class="card-title">`). Both new
     widgets now render `<pngx-widget-frame [cardless]="true">` inside their own `.docvera-section-card`
     wrapper instead of using the frame's built-in card. Documented as design system §5.10 (see below) so
     these tokens have one definition, not one per component that needs them.
   - **Upgrade impact**: none — new global classes/tokens, `widget-frame` itself untouched.

**Verification**: `ng build --configuration production` (clean, all locales including the new fr-FR
strings), `npx jest --testPathPatterns=dashboard` (same 39 passing / 1 pre-existing unrelated failure as
before this fix round), manual check of both the checklist's incomplete and 5/5-complete states, and
visual review in both light and dark mode via the running container.

---

## Non-branding supporting commits (for traceability)

| Commit | Summary | Relation to branding work |
|---|---|---|
| `a14a4ecca` | chore: remove accidental download folder from repo | Cleanup of a `files (2)/` folder of raw logo/favicon assets accidentally committed alongside `3012c6e6f`. |
| `7ab416a35` | fix(docker): pin webserver image to exact v2.20.15 tag instead of floating latest | Ensures the local dev stack matches the pinned upstream baseline that branding was applied against. |
| `8cbc5d021` | fix(build): enforce LF line endings for container scripts | Cross-platform authoring hygiene, needed once branding work started touching scripts/containers from Windows. |
| `3564ea629` | feat(docker): use dedicated docvera image built from pinned source | Switches the compose stack to a `docvera`-tagged image containing the branding changes. |
| `5ef350a21` | chore: ignore locale backup directory | Supports the locale-rebranding workflow (`fb58d3710`/`dd4e4baf8`), which writes local backups before rewriting `.xlf` files. |
| `e5ba35838` | chore: ignore local document export directory | General local-dev hygiene, unrelated to branding content. |
| `b9a82a5ac` | chore(docker): bump image tag to docvera:0.3.0 (locale branding included) | Tags the image to reflect that locale branding (`dd4e4baf8`) is now included; matches `DOCVERA_VERSION`. |

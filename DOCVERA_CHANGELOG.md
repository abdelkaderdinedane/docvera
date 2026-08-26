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

## `23d0da4b9` — feat(ui): redesign dashboard with onboarding checklist and useful metrics

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

## Onboarding checklist rebuild against the architect's finalized spec

The onboarding checklist built in `23d0da4b9` above (and patched in that entry's post-review bug-fix
pass) was an earlier draft. The project architect has since finalized the checklist's exact spec, which
differs from that draft in several concrete ways, so this is a rebuild of the same component against the
finalized behavior rather than an incremental patch. Scoped strictly to the checklist itself — the
dashboard's other known issues (mixed-language strings, dark-mode contrast, the storage/duplicate-stats/
missing-correspondent items from the prior bug-fix pass) are unrelated and untouched here.

What changed relative to the `23d0da4b9` draft, and why:

- **Step set and order.** Spec: upload a document → create/confirm a tag *or document type* →
  add a correspondent → invite a team member → configure email ingestion (optional). The draft checked
  only tags (never document types) for step 2, and ordered mail ahead of the invite step.
- **The email-ingestion step is optional and excluded from completion.** The draft treated all 5 steps as
  equally required (`X of 5`, auto-dismiss only at 5/5). The spec requires a visible "Optional" step that
  can still be completed but never blocks and never counts toward the `X of 4` progress figure or the
  auto-dismiss trigger.
- **No error state on a failed count request.** The draft rendered `pngx-error-state` on failure. The
  spec is explicit that onboarding is non-critical and must never surface an error on the dashboard — a
  failed request now hides the whole checklist silently instead.
- **Cheap, per-service counts instead of a bespoke statistics endpoint.** The draft called
  `${apiBaseUrl}statistics/` (a bespoke aggregate endpoint extended with `documents_in_workflow`/
  `storage_used_bytes` in `23d0da4b9`, for the *separate* metrics widget) plus two `listAll()` calls
  (`MailAccountService`, `UserService`) that page through full result sets. The spec calls for reusing the
  existing per-resource Angular services directly, one `page_size=1` request per resource, reading only
  the `count` field off `Results<T>` — cheaper, and doesn't depend on an endpoint shaped for a different
  widget.
- **Dismissal flag is Docvera-namespaced.** The draft's persisted key,
  `general-settings:dashboard:onboarding-checklist-dismissed`, followed the pre-existing
  `general-settings:*` convention used for unrelated upstream-style settings; the spec asks for a
  Docvera-namespaced key specifically. Renamed to `docvera:onboarding-checklist:dismissed`. This is a
  breaking rename of the persisted value for any user who had already dismissed the old key — acceptable
  and intentional per the "derived state, no migration" rationale below: the checklist re-evaluates real
  object counts on next load, so a user with real setup progress will see it as already complete (and
  re-dismiss automatically) rather than getting a stale checklist back.
- **Every step always shows an action link/button, even once done** (draft hid the control once a step
  was marked complete); **i18n custom message ids** added under a `docvera.onboarding.*` prefix for every
  string (the draft used plain `$localize`/`i18n` with auto-generated hash ids); moved off the `card
  bg-light` wrapper (the exact dark-mode low-contrast pattern documented in §5.10/item 7 of the
  `23d0da4b9` bug-fix pass) onto the `.docvera-section-card` pattern instead, and onto CSS logical
  properties (`margin-inline-start`, `border-block-start`, …) in the component's own stylesheet.

**Alternatives considered — persisted per-step progress vs. derived state**: persisting each step's
completion (e.g. a JSON blob of booleans alongside the existing dismissal flag) was considered and
rejected, per the spec's explicit architectural constraint. Persisted flags can only be set at the moment
a step's action happens in *this* UI; they go stale the instant an object is deleted, or created through
the API/CLI/import rather than the checklist's own flow, and — for a multi-tenant product — persisting
per-step state means every new tenant needs that state initialized and every future step needs a
migration. Deriving each step from a live, cheap read of the real resource counts avoids all of that: the
checklist is always truthful, needs no backend model or migration, and the only genuinely stateful fact
(has this admin dismissed it) is exactly the one fact that *can't* be derived from data — so it's the only
thing persisted.

- **Files**: `src-ui/src/app/data/ui-settings.ts`
- **Approach**: changed `SETTINGS_KEYS.ONBOARDING_CHECKLIST_DISMISSED`'s value to
  `docvera:onboarding-checklist:dismissed`. The constant name, the `SettingsService` getter/setter
  (`onboardingChecklistDismissed` / `dismissOnboardingChecklist()`), and the `SETTINGS` default-value
  entry were already correctly shaped from `23d0da4b9` and needed no further change — only the persisted
  key string itself was non-compliant with the "Docvera-namespaced key" requirement.
- **Upgrade impact**: none — value-only change to an additive, Docvera-only settings key; no upstream file
  touched.

- **Files**:
  `src-ui/src/app/components/dashboard/widgets/onboarding-checklist/onboarding-checklist.component.ts`,
  `.html`, `.scss` (rewritten), `.spec.ts` (new — the `23d0da4b9` draft had none)
- **Approach**: `OnboardingChecklistComponent` now injects `DocumentService`, `TagService`,
  `DocumentTypeService`, `CorrespondentService`, `UserService`, and `MailAccountService` directly (instead
  of `HttpClient` + the statistics endpoint), firing `forkJoin({ documents: ..., tags: ..., documentTypes:
  ..., correspondents: ..., users: ..., mailAccounts: ... })` with every call as `.list(1, 1)` — one row
  per resource, only `Results.count` read off each. A `catchError` on the joined observable maps any
  failure to `null`; the subscribe handler treats `null` as "hide silently" (`visible = false`, no error
  state). Each `OnboardingStep` carries `id`, `done`, `optional`, and an optional `routerLink`; five
  named getters (`uploadStep`/`taxonomyStep`/`correspondentStep`/`inviteStep`/`mailStep`) expose them to
  the template by name instead of array index, since the template now needs to reference each step
  individually to give it its own custom-id'd label/description/action text.
  `requiredSteps`/`completedRequiredCount`/`requiredTotal`/`progressPercent` all filter out
  `optional: true` steps, so the mail step never affects the `X of 4` figure or the auto-dismiss check.
  `visible` is still captured once at `ngOnInit()` from `!settingsService.onboardingChecklistDismissed`
  (unchanged from `23d0da4b9`'s bug-fix-pass behavior, still correct under the new spec) so a
  same-session admin who finishes the fourth required step isn't cut off mid-render; reaching
  `allRequiredComplete` sets `visible = false` and calls `dismissOnboardingChecklist()` in the same tick
  — the spec's "hide automatically" language, read literally, doesn't call for the draft's separate
  "5/5 complete" confirmation panel, so that branch was dropped as unneeded complexity relative to what
  was actually specified. Template uses semantic `<ul>`/`<li>` markup, a status icon with
  `aria-hidden="true"` paired with a `.visually-hidden` "Completed"/"Not completed" span per step (so
  completion is never conveyed by icon/colour alone), a real `<button>` for dismiss with an
  `i18n-aria-label`, and every user-facing string tagged `i18n="@@docvera.onboarding.<step>.<field>"`.
  Root wrapper switched from `card shadow-sm bg-light` to `.docvera-section-card` (§5.10) to avoid the
  dark-mode low-contrast pattern already documented and fixed for the two sibling dashboard widgets in
  `23d0da4b9`'s bug-fix pass; the component's own stylesheet uses only `var(--bs-*)`/`var(--dv-*)` tokens
  and logical properties (`margin-inline-start`, `border-block-start`), no physical `left`/`right`/hex
  values, matching the RTL-readiness requirement for this phase.
  New `.spec.ts` covers: no fetch when already dismissed, tag-OR-document-type derivation, auto-dismiss
  triggering only on the four required steps, staying visible when only the optional step is incomplete,
  silent hide on a failed request (verified via `HttpTestingController`, including that `forkJoin`
  correctly cancels the sibling in-flight requests rather than leaving them open), and manual dismiss.
- **Upgrade impact**: none beyond what `23d0da4b9` already flagged — same component, same call site in
  `dashboard.component.html` (selector `pngx-onboarding-checklist` and the `(triggerUpload)` output are
  unchanged, so no edit was needed there or in `dashboard.component.ts`).

**New i18n source strings** (all under the `docvera.onboarding` prefix; not yet present in any of the 47
locale `.xlf` files — same pre-existing pattern as every prior increment, not a regression): `title`,
`progressText`, `progressAriaLabel`, `dismissLabel`, `step.status.done`, `step.status.pending`,
`step.upload.label`, `step.upload.description`, `step.upload.action`, `step.taxonomy.label`,
`step.taxonomy.description`, `step.taxonomy.action`, `step.correspondent.label`,
`step.correspondent.description`, `step.correspondent.action`, `step.invite.label`,
`step.invite.description`, `step.invite.action`, `step.mail.label`, `step.mail.description`,
`step.mail.action`, `step.optionalBadge`.

**Assumptions made, flagged rather than silently guessed past**: the spec's step 2 says "the relevant
screen" (singular) for a step that can be satisfied by either a tag or a document type; the action link
routes to `/tags` specifically (matching the `23d0da4b9` draft's choice) rather than to whichever of the
two is still empty, since the spec didn't call for that extra branching and it isn't a difference that
changes step completion. The upload step has no dedicated route to link to (same gap the `23d0da4b9`
draft found), so it keeps that draft's solution of emitting `triggerUpload` to reuse the sidebar upload
widget's file picker via `DashboardComponent`'s existing `@ViewChild`/`triggerUpload()` wiring, rather
than introducing a new upload surface.

**Verification**: `npx jest --testPathPatterns=onboarding-checklist` (6/6 passing, new suite) and
`npx jest --testPathPatterns=dashboard` (45/46 passing — the one failure is the same pre-existing
"Paperless-ngx" vs "Docvera" welcome-message string mismatch flagged as unrelated in `23d0da4b9`, not a
regression from this change). `ng build --configuration production` succeeds across all 47 locales;
confirmed the new strings compile into the `en-US` bundle and fall back to English source text in
untranslated locales (e.g. `fr-FR`), the same pattern already established for every prior increment's new
strings.

---

## Onboarding checklist follow-up — restore explicit permission gating (post-review, `b9900a218`)

Post-review fix on the rebuild above. The rebuild's `Write`-based rewrite of the component dropped the
`PermissionsService` import and every permission check that used to live in the pre-rebuild draft, without
a deliberate decision to remove them — an oversight, not a spec change. In the rebuilt code, a non-admin
was hidden from the checklist only as a side effect: their `/users/` or `/mail_accounts/` request comes
back 403, `catchError` maps that to `null`, and the "hide silently on any failed request" branch (the
correct behavior for transient failures) fired for the wrong reason. Two problems follow from that: (1)
visibility was never an explicit, auditable rule in the code — for a multi-tenant product, "only admins
see the setup checklist" has to be a decision that a reviewer can point at, not an emergent property of
which REST calls happen to fail for which roles; (2) a genuine admin hit by a transient network failure
on any of the six count requests was indistinguishable from a non-admin and lost the checklist the same
way.

- **Files**: `src-ui/src/app/components/dashboard/widgets/onboarding-checklist/onboarding-checklist.component.ts`
- **Reason**: see above — restore an explicit, intentional visibility rule instead of relying on request
  failure as a proxy for it.
- **Approach**: re-added `PermissionsService` (`isSuperUser`, `currentUserCan` with `PermissionAction`/
  `PermissionType`) as an injected dependency. `ngOnInit()` now checks, in order: (1) already dismissed →
  hide, no requests; (2) `canPerformSetupSteps()` false → hide, no requests; (3) otherwise, show and load.
  `canPerformSetupSteps()` returns true for a superuser, or for a non-superuser who holds the `add`
  permission for every resource behind a *required* step: `Document` (upload), `Tag` **or**
  `DocumentType` (taxonomy — matches the step's own "tag or document type" OR logic), `Correspondent`,
  and `User` (invite). The optional mail step is deliberately excluded from this gate: a user who can
  perform the four required steps but not configure mail should still see the checklist — mail is
  optional precisely because it's not a blocker. The pre-existing `catchError`-based silent hide in
  `load()` is unchanged and kept as a separate concern: it now only ever fires for an actual failure
  (permission or otherwise) on a request that was already deliberately made, not as the primary
  admin/non-admin gate.
- **Upgrade impact**: none — same component, same call site; no change to `dashboard.component.html`/`.ts`
  (the parent's own `*ngIf="permissionsService.isAdmin()"` gate around the whole widget is unrelated and
  untouched — it's a coarser, higher-level gate; the fix here is the checklist's own finer-grained rule
  for whether its *content* is actionable for the current user).

- **Files**: `src-ui/src/app/components/dashboard/dashboard.component.spec.ts`
- **Reason**: this spec's `PermissionsService` mock (`{ currentUserCan, isAdmin }`) predates
  `OnboardingChecklistComponent` calling `isSuperUser()` — with the method restored above, every test in
  this file threw `TypeError: this.permissionsService.isSuperUser is not a function` the moment the
  checklist (rendered as a child of `DashboardComponent`) called it during `ngOnInit`. Same shape of gap
  the `23d0da4b9` bug-fix pass already hit once with `isAdmin` on this same mock.
- **Approach**: added `isSuperUser: () => true` alongside the existing `currentUserCan`/`isAdmin` stubs.
- **Upgrade impact**: none — test-only fix.

- **Files**:
  `src-ui/src/app/components/dashboard/widgets/onboarding-checklist/onboarding-checklist.component.spec.ts`
- **Reason**: cover the restored gating rule.
- **Approach**: added a `PermissionsService` mock (`isSuperUser: true` by default, `currentUserCan: false`
  by default — false so `DocumentService`'s own unrelated constructor-time custom-fields fetch, gated on
  `View`+`CustomField`, doesn't fire in every test; `isSuperUser` alone already satisfies the checklist's
  gate for the existing tests). Two new cases: a non-admin (`isSuperUser: false`, `currentUserCan: false`)
  sees `visible === false` and triggers zero HTTP requests, asserted per-resource via
  `httpTestingController.expectNone()` for all six endpoints; a non-superuser who holds every required
  `add` permission (`currentUserCan` implemented as `action === PermissionAction.Add`) still sees the
  checklist and its six count requests still fire.
- **Upgrade impact**: none — test-only addition.

**Verification**: `npx jest --testPathPatterns=onboarding-checklist` (8/8 passing, two new). `npx jest
--testPathPatterns=dashboard` (47/48 passing — the same single pre-existing "Paperless-ngx" vs "Docvera"
failure noted in every prior entry, not a regression). `ng build --configuration production` (English
locale) succeeds.

---

## Dashboard permission-adaptivity fixes — Lot A: recent-documents widget fails on a non-critical 403

Real-world permission testing found three related dashboard defects sharing one root cause: parts of the
dashboard fired requests or rendered controls without accounting for what the current user is actually
allowed to do. Lot A, B and C (below) are each their own commit; this is Lot A.

**Symptom**: `RecentDocumentsWidgetComponent.reload()` joined three requests —
`documents/` (the widget's actual content), `tags/` (only used to derive the "Needs review" badge), and
`tasks/?task_name=consume_file&acknowledged=false` (only used to derive the "Processing" badge) — with a
plain `forkJoin`. A user without the `PaperlessTask` view permission gets a 403 on the `tasks/` call;
`forkJoin` treats any one inner error as fatal to the whole join, so `documents/` and `tags/` succeeding
didn't matter — the widget rendered `pngx-error-state` with a "Retry" button that could never succeed,
even though the user could read their own recent documents perfectly well. Diagnosed against the running
instance's network tab, not just by re-reading the code, per the pattern established for prior bug-fix
passes in this file.

- **Files**: `src-ui/src/app/components/dashboard/widgets/recent-documents-widget/recent-documents-widget.component.ts`
- **Reason**: see above.
- **Approach**: split `tags/` and `tasks/` out of the single `forkJoin` object literal into two
  independent observables (`inboxTags$`, `activeTasks$`), each: (1) guarded by
  `PermissionsService.currentUserCan(View, Tag|PaperlessTask)` — skipped entirely (`of(...)` an empty
  result) rather than issued at all when the permission is known to be absent; (2) piped through
  `catchError(() => of(<empty result>))` regardless, so a failure for any *other* reason (a stale
  permission cache, an object-level restriction the flat check can't see) still degrades to "no badge
  data" instead of failing the join. The two are deliberately not redundant — see design system §5.12.
  With both supplementary calls now guaranteed to never error, the outer `subscribe`'s `error` handler
  can only still fire from `documents/` itself; it now branches on `e.status === 403` into a new
  `permissionDenied` flag (distinct from the existing generic `error` flag) instead of always setting
  `error`.
- **Upgrade impact**: none — isolated widget component, no shared file touched.

- **Files**: `src-ui/src/app/components/dashboard/widgets/recent-documents-widget/recent-documents-widget.component.html`
- **Reason**: render the new `permissionDenied` state distinctly from `error`.
- **Approach**: added a `pngx-empty-state` branch (icon `lock`, no action/retry) ahead of the existing
  `pngx-error-state` branch, per the new §5.12 rule this lot establishes: a 403 is a permission boundary,
  not a broken widget, and must never get a "Retry" button that can't work.
- **Upgrade impact**: none.

- **Files**: `src-ui/src/app/components/dashboard/widgets/recent-documents-widget/recent-documents-widget.component.spec.ts` (new)
- **Reason**: this component had no test coverage at all before this fix (introduced without tests in
  `23d0da4b9`, same gap already noted for the onboarding checklist and quick-actions widgets from that
  same commit).
- **Approach**: four cases — `tasks/` is never requested for a user lacking that view permission (and
  the widget still loads documents normally); a `tasks/` failure (403) degrades to no processing badge
  rather than failing the widget; a `documents/` 403 sets `permissionDenied` (not `error`); a
  `documents/` 500 sets `error` (not `permissionDenied`). `httpTestingController.verify({ ignoreCancelled:
  true })` in `afterEach`, matching the pattern already established for the onboarding-checklist spec
  (`forkJoin` cancels sibling in-flight requests on the first error).
- **Upgrade impact**: none — new test file only.

**Alternatives considered**: keeping a single `forkJoin` and wrapping the *whole thing* in one
`catchError` was considered and rejected — it would silently swallow a genuine `documents/` failure
(the widget's actual content) the same way it swallows a supplementary-data failure, losing the
distinction between "nothing to show you" and "something is broken" that §5.12 exists to preserve.
Splitting the supplementary calls out and handling `documents/`'s error explicitly keeps that
distinction while still letting the widget render with partial data when only the decorations fail.

**Verification**: `npx jest --testPathPatterns=recent-documents-widget` (4/4 passing, new suite).
`ng build --configuration production` succeeds (both English-only and all 47 locales).

---

## Dashboard permission-adaptivity fixes — Lot B: quick actions card renders empty when no action survives gating

Lot B of the same permission-adaptivity pass as Lot A above.

**Investigated, not reproduced as reported**: the report described the "Import a document" quick action
rendering (and being clickable) for a user without add-document rights, producing a permission-denied
toast. Checked `quick-actions-widget.component.html` (and, since the report's "same for the other quick
actions" implicated every upload entry point on the dashboard, also `upload-file-widget.component.html`'s
sidebar widget and `file-drop.component.ts`'s global drag-and-drop dropzone) against the actual committed
source before changing anything, per this project's "trust but verify" convention. All three already
gate correctly: each quick-action button carries its own `*pngxIfPermissions` (`Add`+`Document` for
upload, `View`+`Document` for search, `View`+`Tag` for manage tags, added in `23d0da4b9`), the sidebar
upload widget is wrapped the same way (pre-existing upstream fix, `95c12c184`), and the global dropzone's
`dragDropEnabled` getter separately checks `Add`+`Document` (also pre-existing upstream code). No code
path was found today where an unprivileged user could see and click an unguarded upload control from
this dashboard. Not changed, since there was nothing to fix here — verified against current source before
touching anything, same discipline as the earlier Defect 2 false alarm on this same checklist feature.

**Real defect found while verifying**: the fix request's second requirement — "if no action survives the
gating, hide the whole Quick Actions card instead of rendering an empty bordered box" — was *not*
implemented. Each of the three buttons independently hides itself via `*pngxIfPermissions`, but the
`.docvera-section-card` wrapper and its "Quick actions" title rendered unconditionally regardless of
whether zero, one, two or three of the buttons inside it survived gating. A user with none of
`Add`+`Document`, `View`+`Document`, or `View`+`Tag` would see an empty titled card with nothing
actionable in it — a real, reproducible gap, just not the one the symptom paragraph described.

- **Files**: `src-ui/src/app/components/dashboard/widgets/quick-actions-widget/quick-actions-widget.component.ts`
- **Reason**: see above.
- **Approach**: added a `hasVisibleAction` getter that mirrors the three buttons' individual
  `*pngxIfPermissions` checks with OR logic (`PermissionsService.currentUserCan()` for each pair,
  `||`-combined) — the directive itself only supports AND-across-an-array, not OR-across-distinct-checks,
  so this couldn't be expressed as a single `*pngxIfPermissions` on the wrapper.
- **Upgrade impact**: none — additive getter, isolated component.

- **Files**: `src-ui/src/app/components/dashboard/widgets/quick-actions-widget/quick-actions-widget.component.html`
- **Reason**: apply the new getter.
- **Approach**: wrapped the entire `.docvera-section-card` in `@if (hasVisibleAction)`. No change to the
  three inner buttons' own individual gating.
- **Upgrade impact**: none.

- **Files**: `src-ui/src/app/components/dashboard/widgets/quick-actions-widget/quick-actions-widget.component.spec.ts` (new)
- **Reason**: no test coverage existed for this component before this fix (same `23d0da4b9` gap as Lot
  A's widget).
- **Approach**: three cases — the card renders when at least one action is permitted (default, all
  permitted); the card is entirely absent (not an empty box) when no action survives gating; the card
  still renders, with exactly one control, for a user who can only view tags.
- **Upgrade impact**: none — new test file only.

**Alternatives considered**: extending `IfPermissionsDirective` itself to support an "OR across array"
mode was considered and rejected as broader than this fix needs — every other existing call site relies
on its current AND semantics, and a mode flag would be a shared-directive change (higher blast radius,
touches every component that imports it) for a need only this one wrapper has today. A local
component-level getter is fully equivalent here and stays contained to the one file that needs it.

**Verification**: `npx jest --testPathPatterns=quick-actions-widget` (3/3 passing, new suite).
`ng build --configuration production` succeeds.

---

## Dashboard permission-adaptivity fixes — Lot C: ui_settings failure leaves the app in a broken half-state

Lot C of the same permission-adaptivity pass as Lots A and B above, and the most structural of the three.

**Symptoms, all confirmed against the actual committed source before changing anything**:
1. `SettingsService.initializeSettings()`'s `catchError` block called
   `this.toastService.showError('Error loading settings', error)` — a bare, un-tagged string literal with
   no `$localize` and no i18n mechanism at all. This one always renders in English regardless of the
   active UI locale, confirmed by inspection (not just inferred): every other user-facing string in this
   file and `app-frame.component.html` at least goes through Angular's `i18n`/`$localize`, this one
   didn't.
2. `permissionsService.initialize(uisettings.permissions, this.currentUser)` was only ever called inside
   the success (`tap`) branch of `initializeSettings()` — never in the `catchError` branch. Every sidebar
   nav item in `app-frame.component.html` is gated by `*pngxIfPermissions`, which calls
   `PermissionsService.currentUserCan()`; with `permissions`/`currentUser` left at their un-initialized
   class-field defaults after a failed fetch, every single one of those checks evaluates false — the
   entire sidebar goes empty, confirmed by reading through every `*pngxIfPermissions` guard in the
   sidebar template against this code path.
3. `app-frame.component.html` rendered `<pngx-error-state>` *above* `<router-outlet>`, not *instead of*
   it — the failed-init banner and the (now-permission-broken, effectively unusable) dashboard route
   both rendered on the same page at once, confirmed by reading the template structure directly.
4. The banner's body text ("...check with your administrator if the problem continues") assumes the
   reader isn't the administrator — not true in general, and specifically not true for the exact failure
   this banner exists to describe (a missing `UISettings` permission can be missing from an
   administrator's own account).

- **Files**: `src-ui/src/app/services/settings.service.ts`
- **Reason**: distinguish a genuine load failure from a permission boundary (§5.12) at the source, and
  fix the un-i18n'd toast (symptom 1).
- **Approach**: added `initializationPermissionDenied` alongside the existing `initializationFailed`,
  set from `error?.status === 403` in `catchError` (mirroring the same branch Lot A introduced in
  `RecentDocumentsWidgetComponent`) — `initializationFailed` is now genuinely "non-permission failure"
  only, matching its doc comment. The toast now picks between two `$localize` messages with
  `docvera.settingsInit.*` custom ids based on which branch fired, instead of one hardcoded English
  string; the raw `error` object is no longer passed to `toastService.showError()` (it was never
  rendered by the toasts-dropdown template — confirmed by grep — so dropping it is a pure simplification,
  not a behavior change).
- **Upgrade impact**: none — additive field, corrected i18n on an existing call; no upstream file.

- **Files**: `src-ui/src/app/components/app-frame/app-frame.component.html`, `.ts`
- **Reason**: fix symptoms 2, 3 and 4 together — they share one root cause (the degraded-but-still-
  rendered layout) and one fix (stop trying to partially render that layout at all).
- **Approach**: restructured the template so `settingsService.initializationPermissionDenied ||
  settingsService.initializationFailed` gates the *entire* `<div class="container-fluid">` — sidebar and
  `<router-outlet>` alike — behind a single `@if`. The `@else` branch is the pre-existing normal layout,
  unchanged. The failure branch renders one of two mutually exclusive states inside a bare `<main>`: a
  `pngx-empty-state` (icon `lock`, no action) when `initializationPermissionDenied`, explaining plainly
  that the account is missing the UI settings permission and that an administrator must grant it — worded
  to not assume the reader isn't that administrator, addressing symptom 4 directly — or the pre-existing
  `pngx-error-state` (`level="page"`, retry wired to `retryInitialization()`) for a genuine
  `initializationFailed`. This resolves symptom 2 as a side effect without touching
  `PermissionsService.initialize()`'s call sites at all: since the sidebar (where every broken permission
  check lived) no longer renders during a failure, there's no empty sidebar to see. The top navbar
  (branding, search, notifications, and — importantly — the *Logout* link) is left unconditional outside
  this `@if`, so a user stuck in either failure state still has a way to leave the page rather than being
  fully trapped. Every string in both new branches carries a `docvera.settingsInit.*` custom id, per
  §5.11's convention. `EmptyStateComponent` added to the component's standalone `imports` (`ErrorStateComponent`
  was already there from the prior `eee16f0e9` increment).
- **Upgrade impact**: moderate — `app-frame.component.html` is the core navigation shell and the file
  most likely to conflict on a future `git merge tags/vX.Y.Z`; the restructure wraps existing markup in a
  new outer `@if`/`@else` rather than rewriting the sidebar/main content itself, so a diff against
  upstream should still be mechanically resolvable, but re-verify placement after any upstream app-frame
  rework.

- **Files**: `src-ui/src/main.ts`
- **Reason**: the new permission-denied state needed an icon distinct from the generic error state's
  `gear`; no lock-style icon was registered in this app's curated `ngx-bootstrap-icons` subset.
- **Approach**: added `lock` to both the import list and the `icons` object, alphabetically positioned,
  following the exact convention from `23d0da4b9`'s icon additions. Verified the export exists in the
  installed package before adding it.
- **Upgrade impact**: none — additive only.

- **Files**: `src-ui/src/app/services/settings.service.spec.ts`, `src-ui/src/app/components/app-frame/app-frame.component.spec.ts`
- **Reason**: cover the new branch and the restructured template.
- **Approach**: two new `SettingsService` tests assert `initializationPermissionDenied`/
  `initializationFailed` are set correctly (and mutually exclusively) for a 403 vs. a 500 — the
  pre-existing "shows toast on 403" test was left as-is (still passes; it only asserts the toast fired,
  not its exact text, so it's compatible with the new i18n'd message). Two new `AppFrameComponent` tests
  assert that setting each flag removes both `#sidebarMenu` and `router-outlet` from the DOM and renders
  the correct one of `pngx-error-state`/`pngx-empty-state` — scoped to `<main>` specifically, since the
  top navbar's own notifications dropdown independently uses `pngx-empty-state` for an unrelated "No
  notifications" state and would otherwise produce a false pass/fail.
- **Upgrade impact**: none — test-only additions.

**Alternatives considered**: fixing symptom 2 directly (calling
`permissionsService.initialize([], someDefaultUser)` in the `catchError` branch, so the sidebar would at
least render its zero-permission-item state correctly instead of relying on the un-initialized default)
was considered and rejected in favor of not rendering the sidebar at all. A "correctly empty" sidebar
next to a dashboard that also can't really function is still two broken-looking regions on screen at
once — exactly what the fix request's "either the app loads or it explains why it cannot; showing both
is worse than either" line rules out. Blocking the whole content area is a stronger, simpler guarantee
than trying to make the degraded layout internally consistent.

**Verification**: `npx jest --testPathPatterns=settings.service` (all passing, 2 new) and `npx jest
--testPathPatterns=app-frame` (all passing, 2 new). `ng build --configuration production` succeeds for
both English-only and all 47 locales; confirmed no compile errors from the template restructure.

---

## Defect #4 status note — storage calculation ("93.5 GB" for ~2 MB of documents)

Not a code change — a status note for the architect's report, requested alongside the defect #5 fix
below rather than as its own commit. Re-verified against the running instance: the statistics panel now
reads a correct, small figure (e.g. 2.3 MB for 11 documents) instead of the previously-reported
`os.statvfs`-derived whole-volume figure. This was already fixed, in `23d0da4b9`'s own post-review
bug-fix pass (item 4 in that entry): `StatisticsView.storage_used_bytes` was changed from
`os.statvfs(settings.MEDIA_ROOT)` (total disk/volume usage) to a sum of `Path.stat().st_size` over each
visible document's `source_path`/`archive_path`. No further change made here, per instruction — storage
logic is untouched by this pass.

---

## Defect #5 fix — legacy secondary-stats row removed from the statistics widget

**Symptom**: below the redesigned primary metrics (document count, storage used, file-type breakdown),
`StatisticsWidgetComponent` still rendered a `.secondary-stats` row — "Tags N · Correspondents N ·
Document Types N · Storage Paths N" — carried over unchanged from the pre-redesign widget (`23d0da4b9`'s
bug-fix pass, item 5, deliberately kept it at the time, "not an oversight," reduced to a lighter visual
weight rather than removed). The architect has now asked for it to be removed outright as redundant.

**Data source checked before touching the request**: `tag_count`, `correspondent_count`,
`document_type_count` and `storage_path_count` are all fields on the single `/api/statistics/` response
object also used for `documents_total`, `documents_inbox`, `documents_in_workflow` and
`storage_used_bytes` — the metrics that stay. `reload()` issues exactly one `http.get()` for the whole
object; there's no separate request to stop making. Confirmed by reading the whole component that these
four fields are referenced nowhere else in the file. Per the instruction ("if the same request also
feeds something that is still displayed, leave the request and only remove the rendering"), the
`http.get<Statistics>()` call and the `Statistics` interface (which still accurately types the full
backend response shape) are both unchanged — only the rendering block was removed.

- **Files**: `src-ui/src/app/components/dashboard/widgets/statistics-widget/statistics-widget.component.html`
- **Reason**: see above.
- **Approach**: deleted the `.secondary-stats` `@if` block (four `*pngxIfPermissions`-gated links) in
  full.
- **Upgrade impact**: none — isolated widget template.

- **Files**: `src-ui/src/app/components/dashboard/widgets/statistics-widget/statistics-widget.component.ts`
- **Reason**: `IfPermissionsDirective` was only ever used by the now-removed block; every other template
  usage in this file (`routerLink`, the file-type popover, etc.) doesn't need it.
- **Approach**: removed the now-dead import and its entry in the standalone `imports` array. Left
  `extends ComponentWithPermissions` and the `Statistics` interface's four now-unrendered fields alone —
  the former costs nothing to keep and the latter is still an accurate description of the real API
  response, not dead code.
- **Upgrade impact**: none.

- **Files**: `src-ui/src/app/components/dashboard/widgets/statistics-widget/statistics-widget.component.scss`
- **Reason**: `.secondary-stats`/`.secondary-stat-link` styled only the removed markup.
- **Approach**: deleted both rules.
- **Upgrade impact**: none.

- **Files**: `src-ui/src/app/components/dashboard/widgets/statistics-widget/statistics-widget.component.spec.ts`
- **Reason**: no existing test referenced this row at all (checked by grep before writing a new one), so
  its removal had no existing coverage to update — add coverage for the new state instead of leaving it
  implicit.
- **Approach**: one new test flushes a response carrying all four legacy counts and asserts (a) no
  `.secondary-stats` element and no "Tags"/"Correspondents"/"Document Types"/"Storage Paths" text in the
  rendered output, and (b) the `statistics/` request itself was still made with `GET`, directly verifying
  the "leave the request, remove only the rendering" requirement rather than just asserting the negative.
- **Upgrade impact**: none — test-only addition.

**Alternatives considered**: stripping `tag_count`/`correspondent_count`/`document_type_count`/
`storage_path_count` out of the `Statistics` TypeScript interface, as a stricter "no dead code" cleanup,
was considered and rejected — that interface's job is to describe the actual `/api/statistics/` response
shape (a backend contract), not just the subset this one widget currently renders; removing fields that
the backend still genuinely returns would make the type less accurate for no benefit, since the fields
cost nothing left in place and the request that returns them isn't going away.

**Verification**: `npx jest --testPathPatterns=statistics-widget` (10/10 passing, one new).
`npx jest --testPathPatterns=dashboard` (55/56 passing — the one failure is the same pre-existing
"Paperless-ngx" vs "Docvera" welcome-message mismatch noted in every prior entry, not a regression).
`ng build --configuration production` succeeds.

---

## Defect #6 — investigated, not reproduced; no code change

Docs-only entry, no code touched. The reported symptom — recent-documents rows showing title and date
but not correspondent — does not reproduce against current source. Checked all three layers named in the
fix request before concluding this, rather than trusting the report at face value:

1. **`CorrespondentNamePipe` usage**: not unused. `recent-documents-widget.component.html` already has
   `@if (document.correspondent) { <span>{{ document.correspondent | correspondentName | async }}</span>
   <span aria-hidden="true"> &middot; </span> }` immediately before the relative-date span, and
   `CorrespondentNamePipe` is present in the component's standalone `imports` array — it's wired and
   active, not dangling.
2. **`documents/` response shape**: `src/documents/serialisers.py`'s `DocumentSerializer` declares
   `correspondent = CorrespondentField(allow_null=True)` and includes `"correspondent"` in its `fields`
   list — confirmed by reading the serializer directly, not assumed from the frontend type alone.
   `src-ui/src/app/data/document.ts`'s `Document.correspondent?: number` matches this (a plain nullable
   ID, not a nested object needing different handling).
3. **Supplementary-lookup handling (§5.12)**: `correspondentName` resolves through `ObjectNamePipe`
   (`src-ui/src/app/pipes/object-name.pipe.ts`), which already does exactly what the fix request asks
   for — checks `PermissionsService.currentUserCan(View, Correspondent)` before attempting the lookup
   (falling back to a localized "Private" string if the permission is absent, the same convention used
   everywhere else in the app this pipe is used, e.g. the document list's correspondent column — not
   something to special-case for one widget), and wraps the actual `listAll()` call in
   `catchError(() => of(''))` so a genuine lookup failure degrades silently rather than propagating. This
   is a per-document, per-pipe-instance failure (via `| async`) — it cannot take down the widget's own
   `documents`/`loading`/`error` state, which is already fully resolved by the time these pipes run.
4. **Clean rendering when absent**: the `@if (document.correspondent)` guard means a document with no
   correspondent renders neither the name nor the middle-dot separator — no placeholder text, matching
   the requirement exactly.

This exact scenario was already investigated once before, in `23d0da4b9`'s own post-review bug-fix pass
(item 6): "checked via `GET /api/documents/?page=1&page_size=5&ordering=-added` directly and all 5 of
this instance's most recent documents genuinely have `correspondent: null`... No change made." The
architect's report appears to be re-raising that same already-closed investigation — possibly against a
dataset where the most recent documents still happen to have no correspondent set (a data fact, not a
code defect), or against an environment not reflecting this commit history. No code change follows from
this entry; flagging it back rather than guessing at a change to make, per this project's own established
"verify before fixing" convention (see the Lot B entry above, which found the same pattern — a reported
symptom that didn't reproduce against current source, alongside a real but different defect found while
checking).

---

## Defect #6, corrected — AsyncPipe missing from recent-documents-widget's standalone imports

The "not reproduced" conclusion in the entry above was wrong, and the architect's follow-up correctly
called out why: it was based on reading the template and reasoning about the pipe chain, not on
rendering a document that actually has a correspondent. Every document used in that investigation (and
in every existing spec test for this widget) had `correspondent: null`, which never executes the `@if
(document.correspondent)` branch at all — so the bug was invisible to inspection and to every prior test,
by construction.

**Reproduction, per the request's own instructions — build the counter-example, don't reason about it**:
added a temporary test rendering a document with `correspondent: 5` and a flushed `correspondents/`
response containing `{ id: 5, name: 'veltrix' }`. It failed immediately, not on the `expect`, but on
`fixture.detectChanges()` itself:

```
NG0302: The pipe 'async' could not be found in the 'RecentDocumentsWidgetComponent' component.
```

**Root cause**: `recent-documents-widget.component.html` uses `document.correspondent | correspondentName
| async` — but `recent-documents-widget.component.ts`'s standalone `@Component({ imports: [...] })` array
never included Angular's `AsyncPipe` (from `@angular/common`). Standalone components must explicitly
import every pipe/directive they use, including framework-provided ones — `NgClass` was imported, but
`AsyncPipe` was not. The `@if (document.correspondent)` guard meant this instruction only executes for a
row that actually has a correspondent, so the missing import only throws for exactly the case that was
never tested. Angular's default `ErrorHandler` logs the thrown error to the console rather than crashing
the app, and the surrounding row's other bindings (title, date) had already rendered by the time the
correspondent binding's pipe lookup failed — which is exactly why the browser evidence showed a clean
row with a silent gap instead of a visible crash: title and date present, correspondent absent, no error
banner, easy to read as "the feature doesn't show this" rather than "this throws."

- **Files**: `src-ui/src/app/components/dashboard/widgets/recent-documents-widget/recent-documents-widget.component.ts`
- **Reason**: see above.
- **Approach**: added `AsyncPipe` to the existing `import { NgClass } from '@angular/common'` statement
  and to the component's `imports` array.
- **Upgrade impact**: none — one-line additive import in an isolated widget.

- **Files**: `src-ui/src/app/components/dashboard/widgets/recent-documents-widget/recent-documents-widget.component.spec.ts`
- **Reason**: close the coverage gap that let this ship unnoticed — every existing test used a
  correspondent-less document.
- **Approach**: two new tests. The first is the reproduction case itself, kept permanently rather than
  discarded once it passed: a document with `correspondent: 5`, a flushed `correspondents/` response
  naming it, asserting the rendered `.recent-document-meta` row contains both the resolved name and the
  `·` separator — this is the test that would have caught the bug before it shipped, and will catch a
  regression of the same shape (a future standalone `imports` array missing a pipe/directive the template
  actually uses) the moment a document with a real correspondent is involved. The second documents the
  complementary "must render cleanly" requirement explicitly: a `correspondent: null` document renders no
  `·` and issues no `correspondents/` request at all (the `@if` guard skips the pipe call entirely, so
  there's nothing to look up).
- **Upgrade impact**: none — test-only.

**A systemic check, not just a local patch**: before concluding this was an isolated mistake, audited
every other `.html` template under `src-ui/src/app/components/` for `| async` usage and cross-checked
each corresponding standalone component's `imports` array. Fourteen files use the `async` pipe; the
other thirteen (document-list, document-detail, mail, saved-views, document-history, settings, both
document-card variants, saved-view-widget, document-link, storage-path-edit-dialog, config) all already
import `AsyncPipe` correctly. This gap was isolated to `recent-documents-widget`, not a repo-wide pattern.

**Alternatives considered**: routing `document.correspondent` through a synchronous lookup instead (e.g.
resolving the name eagerly in the component and storing a `Map<documentId, correspondentName>`, avoiding
`| async` entirely) was considered and rejected — it would duplicate logic `ObjectNamePipe` already
provides consistently across the app (permission-gating, graceful degradation on failure, the shared
"Private" fallback convention) for no benefit; the actual bug was a missing import, not a design flaw in
using the shared pipe.

**Verification**: `npx jest --testPathPatterns=recent-documents-widget` (6/6 passing, two new — confirmed
the reproduction test fails against the pre-fix code with `NG0302` and passes after adding `AsyncPipe`).
`npx jest --testPathPatterns=dashboard` (57/58 passing — the one failure is the same pre-existing
"Paperless-ngx" vs "Docvera" mismatch noted in every prior entry, not a regression). `ng build
--configuration production` succeeds.

---

## Defect #2 fix — French targets for the 34 strings missing from messages.fr_FR.xlf

Follow-up to the diagnostic inventory above. Adds the French translations that inventory found missing:
the 31 `docvera.*` ids (onboarding, settingsInit, recentDocuments — none of which had ever been
extracted into `messages.xlf`, let alone translated) and the 3 pre-existing `welcome-widget` rebrand
strings that were extracted but never translated. `fr_FR` only, per instruction — the other 34
configured target locales are untouched and still correctly report these strings as missing (expected,
not a regression).

- **Files**: `src-ui/messages.xlf`
- **Reason**: step 1 of the documented procedure — the 31 `docvera.*` ids had never been captured by an
  extraction run.
- **Approach**: `npx ng extract-i18n` (1861 messages). Also caught up the file on drift accumulated
  across several prior sessions' component changes unrelated to this pass (286 insertions/167 deletions
  total) — the file hadn't been regenerated since `23d0da4b9`.
- **Upgrade impact**: none — English-source extraction artifact, not shipped.

- **Files**: `src-ui/src/locale/messages.fr_FR.xlf`
- **Reason**: step 2 — hand-add a `<trans-unit>` with a French `<target>` for each of the 34 missing ids.
- **Approach**: for every id, copied the `<trans-unit>` block (id, `<source>`, `<x id="...">`
  interpolation placeholders included) verbatim from the freshly regenerated `messages.xlf` — never
  retyped — then added a `<target state="translated">` matching the file's own established conventions
  (confirmed by lookup before writing anything): "étiquette(s)" for tags, "correspondant(s)" for
  correspondents, "type de document" for document type, "Réessayer" for Retry, "Impossible de charger
  X" for "Couldn't load X", "Ignorer" for Dismiss, "collaborateur" for team member/colleague (reusing the
  exact phrasing from an orphaned pre-rebuild trans-unit for the same concept), and "courriel" for email
  (the file's own established term throughout its mail-account strings — see note below). All 34 appended
  at the end of the file, matching the exact position and format `23d0da4b9`'s own 34-string addition
  used. Did not run `docvera-rebrand-locales.ps1` — it only rewrites existing text via regex and would
  have done nothing for entries that don't exist yet.
- **Upgrade impact**: none — additive-only translation content.

**Verification found a real gap in my own process, not a product bug**: my first `ng build
--configuration production --localize=fr-FR` came back with the exact same output hash as an unrelated
earlier English-only build, and inspecting the wrong (stale, leftover) `dist/paperless-ui/fr-FR/`
directory showed English text — this project's custom webpack builder
(`@angular-builders/custom-webpack:browser`) doesn't apply the single-locale `--localize=<locale>` CLI
override the way the standard Angular builder does, silently producing an unlocalized build instead of
erroring. Chased this through several dead ends (cache clearing, a position-in-file experiment moving a
translation to the top of the file) before recognizing the `--configuration production` config
overrides `outputPath` to `../src/documents/static/frontend/`, not `dist/paperless-ui` — the directory I
was checking was stale output from earlier in the session. Checking the *correct* path
(`src/documents/static/frontend/fr-FR/main.js`) after a full un-flagged `ng build --configuration
production` (which does correctly localize all 35 configured target locales, confirmed by the same
build's own console warnings correctly listing per-locale gaps) showed every one of the 34 new strings
compiled to French, and the English source text correctly absent. Recorded here so the working
verification command for this project is `ng build --configuration production` (no `--localize`
override) checked against `src/documents/static/frontend/<locale>/`, not the two-part command originally
documented in the diagnostic report above.

**Terminology note flagged for review**: the file's established term for "email" throughout its
mail-account strings is "courriel" (Québécois French), not "e-mail"/"email" (more common in
France/European French). Per instruction to match the file's existing conventions rather than invent new
terms, the two mail-related onboarding strings use "courriel". If a stricter European register is
wanted going forward, this — and the pre-existing "courriel" usage elsewhere in the file predating this
change — would need a deliberate, separate terminology pass, not something to silently override for only
the two new strings this commit adds.

**Verification**: `ng build --configuration production` (all 35 locales) — the four new `docvera.*`
group ids and the three welcome-widget ids each report exactly 34 "No translation found" occurrences
(35 target locales − fr-FR, matching every other untranslated string's expected count precisely), and
direct inspection of the compiled `fr-FR` bundle confirms all 34 French targets are present and no
English source fallback remains for any of them.

---

## Architect review follow-up 1 — hide the disabled SSO placeholder from customers

The login page's "coming soon" SSO button (`07acdcf24`, the auth-pages redesign) is disabled and
labeled as a future capability, but was still shown to every customer regardless of whether Phase 5 SSO
actually exists yet. The architect's instruction: unavailable functionality shouldn't be exposed, but the
extension point should stay easy to pick back up — not deleted outright.

**Preservation approach chosen: a feature flag defaulting to off**, not a commented-out block or an
unused-but-present component. Reason: this exact mechanism — a Django setting, sourced from a
`PAPERLESS_*` env var via `__get_boolean()`, exposed to templates through
`documents/context_processors.py`, gating a `{% if %}` block — is already the established convention in
this same file for `DISABLE_REGULAR_LOGIN`, `ACCOUNT_ALLOW_SIGNUPS`, and `FIRST_INSTALL`. Using it here
keeps the change consistent with three sibling conditionals already sitting in the same template,
keeps the markup/CSS/i18n strings live and real (not dead commented-out HTML someone has to first verify
still matches current markup conventions before re-enabling), and makes Phase 5's actual launch a
one-line env var flip (`PAPERLESS_SSO_PLACEHOLDER_ENABLED=yes`) with no code change at all.

- **Files**: `src/paperless/settings.py`
- **Reason**: define the new flag.
- **Approach**: added `SSO_PLACEHOLDER_ENABLED = __get_boolean("PAPERLESS_SSO_PLACEHOLDER_ENABLED")`
  immediately after `REDIRECT_LOGIN_TO_SSO`, with a comment distinguishing it from that setting —
  `REDIRECT_LOGIN_TO_SSO` is the real, already-functional upstream social-account SSO redirect;
  `SSO_PLACEHOLDER_ENABLED` only controls whether the Docvera-added disabled placeholder button renders.
  `__get_boolean()` defaults to `"NO"`, so the flag is off unless explicitly set.
- **Upgrade impact**: low — additive setting, same helper/pattern as its immediate neighbors.

- **Files**: `src/documents/context_processors.py`
- **Reason**: expose the new setting to templates, matching how `DISABLE_REGULAR_LOGIN` etc. are exposed.
- **Approach**: added `"SSO_PLACEHOLDER_ENABLED": django_settings.SSO_PLACEHOLDER_ENABLED` to the
  `settings()` context processor's return dict.
- **Upgrade impact**: none — one additional dict key.

- **Files**: `src/documents/templates/account/login.html`
- **Reason**: gate the placeholder's visibility on the new flag.
- **Approach**: changed the wrapping condition from `{% if not DISABLE_REGULAR_LOGIN %}` to
  `{% if not DISABLE_REGULAR_LOGIN and SSO_PLACEHOLDER_ENABLED %}` — the original condition is
  preserved (still nothing shown if regular login itself is disabled), the new one is additive and
  defaults closed. The button, its `disabled`/`title="Coming soon"` state, the "Centralized identity is
  coming in a future release" note, and the surrounding `.auth-sso-group` markup are all untouched inside
  the block — nothing was deleted, only newly gated. Added a template comment explaining the flag and
  pointing at `settings.py`, so a future Phase 5 implementer finds the on-switch immediately.
- **Upgrade impact**: low — single conditional in a Docvera-added block within an otherwise
  upstream-shared template; re-verify after upstream auth-template changes, same as the rest of the
  auth-pages redesign.

**i18n strings — checked, none orphaned**: `"Single sign-on (SSO)"`, `"Coming soon"`, and "Centralized
identity is coming in a future release." remain inside live, reachable `{% translate %}` tags — they're
gated by a runtime condition, not removed from the template, so `makemessages` still extracts them and
they stay genuinely translatable (the same way every other `{% if DISABLE_REGULAR_LOGIN %}`-gated string
in this file already does). Checked `src/locale/` directly: none of the three strings exist in any `.po`
file today (this project's Django `.po` files haven't been regenerated since these strings were added,
same gap as the Angular locale files documented earlier in this changelog) — so there was nothing to
remove from locale entries either way. The shared `"or"` divider text and its `.auth-divider` CSS class
are unaffected — that class is also used independently on `signup.html` for the real (non-placeholder)
social-provider list, confirmed by grep before touching anything, so it was left alone.

**Verification**: Python syntax of both edited `.py` files validated (`ast.parse`); this environment has
neither `uv` nor a configured Django virtualenv available, so `manage.py check`/the backend test suite
could not be run here — flagging rather than silently skipping. The change is mechanically identical to
three already-working, already-tested sibling conditionals in the same two files, which lowers risk, but
this should still be exercised (`manage.py check`, a manual login-page load with the flag both on and
off) before considering it fully verified.

---

## Architect review follow-up 2 — document the dark-mode Navy token deviation

The architect approved keeping the WCAG AA dark-mode fix from `4d4392d9a` (raising
`--pngx-primary-lightness` in dark mode so it no longer matches the exact brand Navy value), conditioned
on the trade-off being recorded in the design system itself — not just in the accessibility audit report
— so it reads as a documented, intentional decision rather than an unexplained deviation the next person
finds and has to re-investigate.

- **Files**: `DOCVERA_DESIGN_SYSTEM.md`
- **Reason**: see above.
- **Approach**: expanded the existing "Known color-token decision (dark mode, Docvera Navy)" subsection
  under §7 (Accessibility) — it already stated the ratio numbers but not the exact brand color value
  or a forward-looking rule. Added: (1) a table of the exact values read directly from
  `src-ui/src/theme.scss` — brand Navy `hsl(217, 65%, 29%)` / `#1A3D7C` (the `paperless-green` mixin,
  light mode's true value) versus the adjusted dark-mode value `hsl(217, 65%, 58%)` ≈ `rgb(78, 132, 218)`
  (the `paperless-green-dark-mode` mixin) — same hue/saturation in both, only lightness moves; (2) a
  before/after table of the two measured pairings this token affects (text/link-on-page-background:
  ≈2.76:1 fail → ≈4.85:1 pass; button-label-on-Navy-background: ≈3.07:1 fail → ≈1.75:1, still fails and
  is worse than before), cross-checked against `DOCVERA_ACCESSIBILITY_AUDIT.md` §4 rather than restated
  from memory; (3) an explicit statement of the trade-off and why accessibility was prioritized over
  exact brand-hue fidelity; (4) a new "Rule going forward" paragraph — the piece that didn't exist yet —
  requiring any future brand color applied to a dark surface to be checked against WCAG AA per pairing,
  computed rather than eyeballed, before shipping, with the same before/after/trade-off documentation
  this entry provides as the expected format.
- **Upgrade impact**: none — documentation only, no `theme.scss` value changed.

**Verification**: every numeric value in the new table cross-checked directly against
`src-ui/src/theme.scss` (the `--pngx-primary`/`--pngx-primary-lightness` declarations in both the
`paperless-green` and `paperless-green-dark-mode` mixins) rather than restated from this changelog's own
prior entries, per instruction. `theme.scss` itself was not modified.

---

## Defect — 9 login-page strings untranslated in French (Django templates, not Angular)

Same class of defect as the dashboard's `docvera.*`/`messages.fr_FR.xlf` gap, but a completely
different i18n mechanism: these live in Django templates (`{% translate %}`/`{% blocktranslate %}` +
gettext `.po` files), not Angular `$localize`/`.xlf`. Diagnosed each of the 9 reported strings against
actual template source before touching anything, per instruction.

**Step 1 — diagnosis, all nine are case (a)**: every one of the 9 strings was already correctly wrapped
in `{% translate %}` or `{% blocktranslate %}` — confirmed by reading
`src/documents/templates/paperless-ngx/base.html` (7 strings, the auth brand panel added by `07acdcf24`)
and `src/documents/templates/account/login.html` (1 string) directly, not assumed. **No case (b)
(hardcoded literal) and no case (c) existed — this was purely a missing-translation gap, not a code
defect requiring template changes**, so step 2 below touches only the `.po` file. Two things worth
flagging from the diagnosis itself:
- The copyright line was *already* correctly interpolated —
  `&copy; {% now "Y" %} Veltrix AI. {% translate "All rights reserved." %}` — the year is dynamic
  (`{% now "Y" %}`, not a hardcoded "2026"), "Veltrix AI" is correctly left untranslated, and "All rights
  reserved." is already its own separate translatable unit. Nothing to fix there beyond adding its
  French target.
- "Need help? / Contact support" is one `{% blocktranslate %}` unit containing an embedded `<a>` link,
  not two separate strings — the slash in the report reflects how it reads visually, not two `msgid`s.

**`.po` file identified**: `src/locale/fr_FR/LC_MESSAGES/django.po` serves French for these templates
(standard Django gettext layout: `src/locale/<lang>/LC_MESSAGES/django.po`). Checked before editing:
zero "Docvera"/"Veltrix" mentions and none of the 9 target strings present anywhere in the file — this
project has never added a single Docvera-specific French entry to it. `git log` on the file confirms the
last commit to touch it was `6c8a9b037`, an upstream "New Crowdin translations" sync, predating
`07acdcf24` (the auth-page redesign that introduced 8 of these 9 strings) — **`django-admin
makemessages` has never been run on this fork since the Docvera auth-page work**, same gap shape as the
Angular `.xlf` files.

**Whether regenerating would disturb existing translations — checked, not assumed**: this environment
has neither GNU `gettext` binaries (`msguniq`/`msgmerge`/`xgettext` — checked via `Get-Command`, none
found) nor a Django installation (`import django` fails), so `makemessages` genuinely cannot be run here
to test the question directly. Established the safe procedure without it: `.mo` compiled files are
`.gitignore`'d (confirmed) and compiled from `.po` at Docker image build time via `manage.py
compilemessages` (confirmed in `Dockerfile`) — so the `.po` file is the actual source of truth to edit,
and hand-adding new `msgid`/`msgstr` pairs in the file's own established format, without touching any
existing entry, carries none of the reordering/fuzzy-marking risk a full `makemessages` regeneration
would (the same risk profile difference already flagged for the `.xlf` files, confirmed applicable here
too).

- **Files**: `src/locale/fr_FR/LC_MESSAGES/django.po`
- **Reason**: step 2 — add the missing French targets.
- **Approach**: hand-added 9 new `msgid`/`msgstr` pairs, each `msgid` copied verbatim (byte-for-byte,
  including the literal `&amp;` entities as they appear in the template source — not decoded, not
  retyped) from the actual template lines, with an accurate `#: file:line` comment. Positioned each
  within the file's existing per-source-file grouping: the `login.html` entry next to that template's
  existing (already-stale, pre-redesign) cluster, the 8 `base.html` entries immediately before that
  template's two existing (also stale-lined but still-current) entries. Pure addition — `git diff`
  confirms 36 insertions, 0 deletions, and the `#: base.html:58`/`:62` entries plus every other existing
  entry in the file are untouched. The blocktranslate `msgid` keeps the exact `<a href="..." target=
  "_blank" rel="noopener">` markup from the source, translating only the visible text inside and outside
  the tag — the link target/attributes are identical in `msgid` and `msgstr`.
- **Upgrade impact**: none — additive-only `.po` entries; no template or code touched, since diagnosis
  found no case (b)/(c) strings.

**Translation choices**: "professional European French... matching the register already used in the
Angular locale file," per instruction. "Intelligent document management" (the product tagline, matches
`DOCVERA_BRAND.tagline` verbatim — checked, no existing French rendering anywhere in the repo) translated
as marketing copy rather than word-for-word: "La gestion documentaire intelligente." The two `&amp;`
bullets ("Bilingual OCR — English & Arabic", "Automated tagging & classification") are rendered with the
word "et" rather than carrying the `&`/`&amp;` symbol into the translation — sidesteps entirely whether
Django's autoescaping would double-escape a literal ampersand in the translated output (a question about
pre-existing template behavior this task wasn't scoped to investigate or fix), and reads as more natural
French UI copy regardless. "Étiquetage" for "tagging" matches "étiquette" — the term already established
for "tag" in `messages.fr_FR.xlf` — keeping the two i18n systems terminologically consistent even though
they're mechanically separate. None of the 9 strings needed an email-related term, so the Angular file's
"courriel" convention wasn't directly applicable here, but was kept in mind and would apply if a future
string needs it.

**Not fixed, flagged**: two adjacent strings in the same brand panel — `aria-label="{% translate 'About
Docvera' %}"` and `{% translate "by Veltrix AI" %}` (the sidebar byline) — are *also* missing from
`django.po` (checked, zero matches for either). Neither was in the reported list of 9, and neither is
main-content copy a customer reads the same way (one is a screen-reader-only landmark label, the other a
small byline already partially in English by design — "Veltrix AI" itself doesn't translate). Left alone
as out of this task's scope; noted here so they're not mistaken for something already covered.

**Verification**: could not run `manage.py check`, `compilemessages`, or the backend test suite — same
environment limitation as the prior SSO-flag task (no `uv`, no Django, and this time confirmed no GNU
gettext binaries either). What *was* verified: `git diff --stat` shows exactly 36 insertions / 0
deletions (9 complete, well-formed entries, nothing existing touched); `msgid`/`msgstr` counts in the
file both increased from 527 to 536 (balanced, one `msgstr` per `msgid`, no orphaned half-entries); `file
src/locale/fr_FR/LC_MESSAGES/django.po` still reports it as a valid "GNU gettext message catalogue,
Unicode text, UTF-8 text" after editing; every new entry's format (comment/msgid/msgstr/blank line, quote
escaping) matches the file's own existing 500+ entries by direct example, not guessed. This is not a
substitute for `manage.py compilemessages` + a real page load — please run that (or CI) before treating
this as fully verified, same caveat as the SSO-flag change.

---

## Sidebar navigation improvements — regrouping, icon fix, active-state contrast, keyboard tooltips

Last item of Increment 2 before regression testing. Five-part UX pass on the sidebar
(`app-frame.component.html`/`.scss`), read against `DOCVERA_DESIGN_SYSTEM.md` first per instruction, which
now has a new §5.13 ("Sidebar navigation") and a new §7 subsection ("Sidebar active-state contrast
decision") documenting the patterns and the contrast math below in full — this entry summarizes; see those
sections for the complete reasoning.

**1 — Regrouping.** The old flat 9-item "Manage" list (equal visual weight for daily-use items like
Correspondents alongside configure-once items like Storage Paths) is now three groups by frequency of use:
an unheaded top group gains **Trash** (moved up from Manage — it's a document view, not a setting: now
sits after Dashboard/Documents); **Organization** (Correspondents, Tags, Document Types, Storage Paths,
Custom Fields); **Automation** (Workflows, Mail, and the *static* Saved Views management link — not the
separate, always-present dynamic per-user saved-views shortcut list, which is untouched and stays where it
was). Administration (Settings, Configuration, Users & Groups, File Tasks, Logs) is unchanged. Every
item's existing `*pngxIfPermissions` guard (or, for Logs, its separate `permissionsService.isAdmin()`
guard) was preserved exactly, attribute-for-attribute — this was a reorder/regroup only, no route,
permission, or badge behavior changed. New `app-frame.component.spec.ts` coverage
(`sidebar regrouping` describe block) asserts the full expected item set renders per section and that
denying one item's permission doesn't hide its section-mates, specifically to catch a future regroup from
silently dropping or ungating an item.

**2 — "Open documents" no longer pushes lower sections around.** Was an unbounded list between the main
nav and the (now-split) management groups — every additional open document shifted everything below it
further down. Now `.sidebar-open-documents-list` (`max-height: 14rem; overflow-y: auto`), so Organization/
Automation/Administration stay at a stable vertical position regardless of how many documents are open;
the "Open documents" heading itself stays outside the scroll container.

**3 — Document Types icon.** Was rendering the literal character "#" (icon name `hash`) instead of a drawn
icon — visibly lighter weight than every neighboring icon. Registered `bookmark` (already shipped in the
installed `ngx-bootstrap-icons` package, just not registered) in `src-ui/src/main.ts`, in alphabetical
position in both the import list and the `icons` object, matching the file's existing convention; swapped
the Document Types `<i-bs name="...">` to it. **Icon audit, not fixed (flagged for later, low-traffic and
out of this task's specific scope)**: the Documentation footer link's icon is missing the `me-1` spacing
class every other sidebar icon carries; the two GitHub/update-check footer `info-circle` icons use an
explicit `width="1.2em" height="1.2em"` where the rest of the sidebar relies on the icon's implicit
default size. Both are minor sizing inconsistencies, not "wrong icon" defects.

**4 — Active-state contrast.** The active item's highlight was barely distinguishable from its siblings.
Computed (not eyeballed) WCAG contrast for candidate designs before writing any CSS, per the methodology
already established for the dark-mode Navy token: Navy-colored active text on `--pngx-primary-faded`
(≈1.69:1) and on `--pngx-bg-alt` (≈4.09–4.11:1) both fail 4.5:1 in dark mode — dark-mode Navy text is
already at the minimum lightness (58%) that clears 4.5:1 against the plain page background, with almost no
headroom left for any visibly-different background under it. Resolved by decoupling background and text
color: `.active` uses `--pngx-bg-alt2` background with **default body text** (`--bs-body-color`, not
Navy) — ≈7.19:1 dark mode, >10:1 light mode — plus a `border-inline-start: 3px solid var(--bs-primary)`
accent bar to carry the brand-color signal as a non-text UI boundary (only needs 3:1, passes easily). Navy
text is kept for `:hover`/`:focus` only, unchanged. Logical property (`border-inline-start`, not
`border-left`) since RTL locale support lands later this phase. Status isn't carried by color alone — the
background, the border, and (see below) `aria-current="page"` all independently mark the active item, per
the existing accessibility-audit rule.

**5 — Collapsed-mode tooltips, keyboard-accessible.** The sidebar already uses `ngbPopover` (not
`ngbTooltip`, unused elsewhere in this codebase) for collapsed-mode item identification, gated by
`[disablePopover]="!slimSidebarEnabled"` — but its `triggers="mouseenter:mouseleave"` was hover-only,
unreachable by keyboard. Changed to `triggers="mouseenter:mouseleave focus:blur"` on all 22 non-interactive
popovers throughout the sidebar, so tabbing to a collapsed icon-only item opens its identifying popover.
The one interactive popover (the disabled update-check popover, containing Enable/Disable buttons) was
deliberately left `mouseenter`-only — open-on-focus/close-on-blur would close it the instant focus moves
from the trigger to a button inside it, making the buttons unreachable by keyboard, which is worse than
the current hover-only state. Also added `ariaCurrentWhenActive="page"` alongside every
`routerLinkActive="active"` (18 occurrences), so the active item is marked to assistive technology
independently of the visual treatment.

**New i18n**: two new `docvera.*` custom ids for the new section headings —
`docvera.sidebar.section.organization` ("Organization" / "Organisation") and
`docvera.sidebar.section.automation` ("Automation" / "Automatisation"). Extracted via `ng extract-i18n`,
French targets hand-added to `messages.fr_FR.xlf` following the established procedure, verified via a full
`ng build --configuration production` (all 35 locales) checked directly against
`src/documents/static/frontend/fr-FR/main.js` (not `--localize=fr-FR`, which silently produces an
unlocalized build under this project's custom webpack builder, and not `dist/`) — confirmed "Organisation"
and "Automatisation" present, no leaked English "Organization"/"Automation" strings. The pre-existing
"Administration" heading kept its plain auto-hash-id `i18n` (unchanged content, no custom id needed).

- **Files**: `src-ui/src/app/components/app-frame/app-frame.component.html`,
  `src-ui/src/app/components/app-frame/app-frame.component.scss`, `src-ui/src/main.ts`,
  `src-ui/src/app/components/app-frame/app-frame.component.spec.ts`, `src-ui/messages.xlf`,
  `src-ui/src/locale/messages.fr_FR.xlf`, `DOCVERA_DESIGN_SYSTEM.md`.
- **Reason**: architect-requested UX pass on the sidebar — section grouping, icon consistency,
  active-state legibility, keyboard-accessible collapsed-mode tooltips.
- **Approach**: see the five numbered points above.
- **Upgrade impact**: **`app-frame.component.html` is now the file most likely to conflict on a future
  upstream `git merge tags/vX.Y.Z`** — it's shared with upstream, and this change touches nearly the
  entire sidebar `<nav>` block (regrouping the management list, moving Trash, retriggering every item's
  popover/routerLinkActive attributes). A future upstream sidebar change (a new nav item, a reordered
  Manage list, a different popover pattern) will very likely need a hand-merge here rather than a clean
  fast-forward. `app-frame.component.scss`'s `.sidebar .nav-link` block is a smaller, more contained
  upstream-diff surface but is also touched. `main.ts`'s icon registration is a low-risk, purely additive
  diff (one import + one object entry, in convention-following alphabetical position).

**Verification**: `pnpm run test -- app-frame.component.spec.ts` — 26/26 passing, including the 6 new
`sidebar regrouping` tests (full item-set-per-section rendering, Organization/Automation headings replace
Manage, Trash moved to the ungated group, per-item permission gating survives the split for both a
View-gated item (Correspondents) and the Delete-gated Trash item, hash→bookmark icon swap). `ng lint` —
clean. Full `ng build --configuration production` — succeeds, same output hash before and after a
whitespace-only indentation cleanup pass (confirms the formatting fix changed nothing behaviorally); French
bundle verified to contain the new translated headings as above. `pre-commit`/root-level `prettier` could
not be run in this environment (repo root has no `node_modules` — the `.prettierrc.js` plugin
`prettier-plugin-organize-imports` isn't resolvable from there; a pre-existing environment gap, not
introduced by this change) — formatting was done and checked by hand instead; please run `pre-commit`
(or CI) before merging to confirm.

---

## Defect #3 fix — recent-document metadata contrast, traced to a shared token, not just one selector

Regression-matrix item F2 flagged that defect #3 from the architect's original list ("recent-document
contrast") was never actually fixed. Re-measured before touching anything, per the standing verify-first
practice for reported defects.

**Measurement (dark mode, dashboard, `.recent-document-meta`)**: `color: var(--bs-secondary-color)`
resolves to `#6c757d`, computed against the dark page background `--bs-body-bg` (`#161618`) at **3.85:1**
— matches the architect's DevTools reading exactly (WCAG relative-luminance formula, not eyeballed).
Fails the 4.5:1 requirement for normal text.

**Scope check, done before choosing a fix**: `--bs-secondary-color` is not a `.recent-document-meta`-only
color — it's a shared Bootstrap CSS custom property, and this codebase's own dark-mode mixin
(`@mixin dark-mode` in `src-ui/src/theme.scss`) sets it explicitly to `#6c757d`. Grepped every
`var(--bs-secondary-color)` consumer under `src-ui/src/app`: **9 call sites across 4 components** —
`empty-state.component.scss` (1), `error-state.component.scss` (2), `onboarding-checklist.component.scss`
(4), `recent-documents-widget.component.scss` (2) — all using it for secondary/de-emphasized text on the
same dark page background, all sharing the identical 3.85:1 failure. `.recent-document-meta` was simply
the one the regression matrix happened to catch first; the others were equally broken and unreported.
**Fixed the token, not the one selector** — a per-component override would have left the other 8 call
sites failing, silently reintroducing the same defect under a different component's name.

**Root cause**: `#6c757d` is Bootstrap's own `$gray-600`, the *exact same value* the dark-mode mixin's
author plugged in for `--bs-secondary-color` without adjusting it for the dark background — every other
color the mixin touches (`--bs-body-color`, `--pngx-bg-alt`, `--pngx-primary-lightness`, etc.) was
deliberately re-picked for dark-mode contrast; this one wasn't. Confirmed via `git log`/reading the mixin
directly that this token had never been given a deliberate value for dark mode, exactly as reported —
Bootstrap's light-mode default for `--bs-secondary-color` is actually `rgba(33, 37, 41, 0.75)` (a
_blended_ value computed against a white background), not `$gray-600` on its own; the dark-mode override
substituted a flat mid-grey without re-deriving it for the new (much darker) background it would actually
sit on.

**Fix**: `src-ui/src/theme.scss` — new Sass variable `$text-color-dark-bg-secondary: #999999`, deliberately
a plain neutral grey rather than a dimmed variant of `$text-color-dark-bg` (the primary dark-mode body-text
color), so it still reads as visually secondary/de-emphasized relative to primary text while clearing
4.5:1 with real margin. `--bs-secondary-color` and `--bs-secondary-color-rgb` in `@mixin dark-mode` now
derive from it (the `-rgb` channel kept in sync via the same `color.channel(...)` pattern already used for
`--bs-body-color-rgb`, rather than a separately hand-typed literal that could drift from the hex value).
No brand color was reached for, per the existing §7 rule — this is neutral secondary text on a dark
surface, and Docvera Navy at dark-mode lightness has no contrast headroom to spare for a secondary role
anyway (see the Navy token decision below it in §7).

**Computed contrast, before and after**:

| Pairing | Before | After | Requirement | Result |
|---|---|---|---|---|
| `--bs-secondary-color` text on `--bs-body-bg` (dark mode, `#161618`) | `#6c757d` → **3.85:1** | `#999999` → **6.34:1** | 4.5:1 (normal text) | **Fixed**, with ≈1.84:1 margin above the floor |
| `--bs-secondary-color` text on the page background (light mode, unmodified) | `rgba(33,37,41,.75)` on white → **6.73:1** | unchanged — this app never overrides `--bs-secondary-color` in light mode, only the dark-mode mixin was touched | 4.5:1 | **Unaffected, still passes** |

Light mode was verified, not assumed, specifically because the fix only touches `@mixin dark-mode` — light
mode continues to inherit Bootstrap's own light-mode default untouched, and was recomputed above to confirm
nothing regressed there while fixing dark mode.

**Spec coverage**: searched for an existing pattern of asserting computed/cascaded styles (contrast,
resolved CSS custom properties) in this codebase's Jest specs — found none (`getComputedStyle` does not
appear in any `.spec.ts`). This isn't an oversight to fill in ad hoc: Jest/JSDOM specs mount components
without loading the compiled application stylesheet, so `getComputedStyle` in a component spec would not
see `theme.scss`'s cascaded `--bs-secondary-color` value at all — a test written that way would either
pass vacuously (nothing resolves the custom property, so the assertion is meaningless) or need to hand-set
the property before asserting, which tests the assertion helper, not the actual token pipeline. No test
was added; if this class of regression needs automated coverage in the future it would need a real-browser
tool (e.g. a Playwright screenshot/contrast check under `src-ui/e2e/`), not a Jest unit spec — flagged here
rather than inventing a unit-test pattern that wouldn't actually catch this defect.

- **Files**: `src-ui/src/theme.scss`.
- **Reason**: fix defect #3 (recent-document metadata contrast) at its actual root cause.
- **Approach**: see above — new `$text-color-dark-bg-secondary` Sass variable, `--bs-secondary-color`/
  `--bs-secondary-color-rgb` in `@mixin dark-mode` now derive from it instead of a stale hardcoded
  `#6c757d`.
- **Upgrade impact**: `theme.scss` is a shared file also touched by the earlier dark-mode Navy contrast fix
  and the sidebar active-state work — a future upstream `git merge tags/vX.Y.Z` touching Bootstrap variable
  defaults or this app's dark-mode mixin has moderate conflict risk here, though the change itself is a
  small, localized diff (one new variable, two lines in the mixin) rather than a structural rewrite. No
  component `.scss` file needed touching — all 9 call sites inherit the fix automatically through the
  shared token, which is the direct benefit of having fixed the token rather than patching selectors
  individually.

**Verification**: full `ng build --configuration production` succeeds; compiled `styles.css` inspected
directly and confirmed exactly two `--bs-secondary-color: #999999;` declarations (the dark-mode mixin's two
application sites in the generated CSS) with zero remaining `#6c757d` occurrences anywhere in the bundle;
existing specs for the two consumers that have spec files (`onboarding-checklist`, `recent-documents-widget`
— `empty-state`/`error-state` have no spec files) — 14/14 passing, unaffected by the color-only change as
expected.

---

## Architect review item 7, Task 1 — branded 403, 404 and 500 pages

Last open item from the architect's review. Django-side only, no Angular involved: customers must never
receive a raw framework error page.

**New files, not overrides of an upstream template** — upstream paperless-ngx does not ship custom
`403.html`/`404.html`/`500.html` at all, so this is pure addition with no upstream template being
diverged from: `src/documents/templates/403.html`, `404.html`, `500.html` (Django's default
`handler403`/`404`/`500` resolve these by bare template name via the app-directories loader, so they live
at the app's template root, not nested under `paperless-ngx/` the way the auth pages are), plus a shared
`src/documents/templates/paperless-ngx/error_base.html` the three extend.

**Layout**: single centered column — the two-column brand panel from the redesigned auth pages
(`07acdcf24`) was judged too heavy for a page whose job is to get out of the way, per instruction. Reuses
the same tokens, logo snippet, and typography as the auth pages instead of that layout — matches the
*visual language*, not the layout.

**Tone per page**, mirroring the reasoning already established for in-app permission boundaries
(`DOCVERA_DESIGN_SYSTEM.md` §5.12) rather than inventing a second convention:
- **403** — calm, muted lock icon, no alarm styling. States the account lacks access to this page and
  that an administrator can grant it.
- **404** — brief, states nothing is broken, the address doesn't exist, with a way back.
- **500** — states plainly that something went wrong on Docvera's side, that it's been logged, and gives a
  single recovery action. **Never a stack trace or technical detail** — confirmed by reading Django's own
  `django/views/defaults.py::server_error`, which calls `template.render()` with zero arguments for the
  500 case specifically (no context, no request — so no context processor, and no `{{ exception }}`,
  could leak anything even if the template tried to reference one, which none of these three do).

**Icons**: hand-authored inline SVG, matching the exact stroke style already used by the auth pages'
feature-list icons (`stroke="currentColor"`, `stroke-width="1.75"`) — a lock for 403, a compass for 404
(muted, `--pngx-text-muted`, decorative/`aria-hidden`), an alert triangle for 500 (`var(--bs-danger)` —
the only page whose icon is colored, since it's the only genuine failure of the three).

**CSS**: appended to `src/documents/static/base.css` (`.error-page*` rules) — existing tokens only
(`--pngx-primary`, `--pngx-surface`, `--pngx-text-muted`, `--bs-danger`), no hardcoded hex. Logical
properties throughout (`padding-block`/`padding-inline`, `margin-block-end`, `inline-size`/`block-size`)
per instruction, ahead of RTL locale support landing later this phase. The action button uses
`.btn.btn-primary` (solid Navy fill, white text) rather than the auth pages' `.text-primary`/`.btn-link`
classes (Navy text directly on the page background) — see DOCVERA_DESIGN_SYSTEM.md §5.14 for why: the
latter was found, while verifying this task's own dark-mode contrast, to already fail badly (≈1.72:1) on
the shipped auth pages, because `--pngx-primary` (unlike its Angular `theme.scss` counterpart) has no
dark-mode-safe adjustment. Not fixed here — flagged as a pre-existing gap outside this task's scope, see
below.

**i18n**: 11 new strings, all through `{% translate %}`, French targets hand-added to
`src/locale/fr_FR/LC_MESSAGES/django.po` following the procedure established for the earlier login-page
translation commit — grouped by source file, positioned alphabetically (`403.html`/`404.html`/`500.html`
sort before the existing `account/*` block; `error_base.html`'s one string sits after the `base.html`
group, before `socialaccount/*`, matching the file's existing per-source-file alphabetical grouping).
"Professional European French" register, consistent with the earlier login-page translations (e.g. "Nous
avons enregistré l'incident" for the 500 page, matching that same measured, non-apologetic tone in French).

- **Files**: `src/documents/templates/paperless-ngx/error_base.html` (new),
  `src/documents/templates/403.html` (new), `404.html` (new), `500.html` (new),
  `src/documents/static/base.css`, `src/locale/fr_FR/LC_MESSAGES/django.po`, `DOCVERA_BRANDING.md`,
  `DOCVERA_DESIGN_SYSTEM.md`.
- **Reason**: architect review item 7 — customers must never see a raw framework error or stack trace.
- **Approach**: see above.
- **Upgrade impact**: **new files only** — nothing here overrides or diverges from an upstream template,
  so a future `git merge tags/vX.Y.Z` has no conflict surface from the three new templates or
  `error_base.html`. The one shared-file touch is `base.css`, which is also touched by the original
  auth-page redesign (`07acdcf24`) and by the branding rebrand — this change is a pure append (new rules
  at the end of the file, nothing existing edited), so conflict risk there is low but not zero if upstream
  ever restyles that same file (upstream doesn't currently touch it at all, being Docvera-specific from the
  start, which keeps this low-risk in practice).

**Known gap, flagged not fixed (out of this task's scope)**: `base.css`'s `--pngx-primary` has no
dark-mode override, unlike `theme.scss`'s Angular equivalent — Navy text/links on the auth pages
(`.text-primary`/`.btn-link`, already shipped, not introduced here) sit at ≈1.72:1 in dark mode, failing
WCAG AA. Full reasoning and the avoidance strategy used on the new error pages are in
`DOCVERA_DESIGN_SYSTEM.md` §5.14. Fixing `base.css` itself (giving `--pngx-primary` the same dark-mode
lightness adjustment `theme.scss` already has) is a reasonable follow-up but touches the shipped auth
pages, which this task didn't ask for.

**Verification**: could not run the backend test suite, `manage.py check`, `compilemessages`, or an actual
browser render — same environment limitation as every prior Django-side task this session (no `uv`, no
Django installed in this project's own environment, no GNU gettext binaries). What *was* done: a Django
5.2.5 install in a disposable, isolated venv (outside the repo, discarded after use) to read the actual
`django/views/defaults.py` and `django/core/handlers/exception.py` source directly — confirming the exact
context each error view receives (see §5.14) rather than assuming Django's behavior from memory; `git diff
--stat` on `django.po` shows a clean 44-insertion, 0-deletion addition; `msgid`/`msgstr` counts both
increased from 536 to 547 (balanced, 11 new entries, nothing existing touched); `file` still reports the
`.po` as a valid "GNU gettext message catalogue" after editing. Please run `manage.py check` +
`compilemessages` + an actual 403/404/500 render (light and dark, both locales) before treating this as
fully verified — same caveat as every prior Django template change this session.

---

## Architect review item 7, Task 2 — confirm production exposes no debug output

Verification only, no code change: configuration was already correct.

**`DEBUG`**: `src/paperless/settings.py:256` — `DEBUG = __get_boolean("PAPERLESS_DEBUG", "NO")` — defaults
to `False` unless the operator explicitly sets `PAPERLESS_DEBUG` to a truthy value. Searched the whole
repo for every reference to `PAPERLESS_DEBUG`: it appears in exactly one compose file,
`.devcontainer/docker-compose.devcontainer.sqlite-tika.yml` (`PAPERLESS_DEBUG: true`) — the VS Code
dev-container config, not a production stack — and in `docs/setup.md`/`docs/development.md`, both
explicitly describing it as something you set for the *development server*. None of the eight production
compose stacks under `docker/compose/` (`docker-compose.postgres.yml`, `.mariadb.yml`, `.sqlite.yml`, the
`-tika` variants, `.portainer.yml`, `.ci-test.yml`) reference `PAPERLESS_DEBUG` at all, so production
deployments get Django's own safe default: `DEBUG = False`.

**Whether a 500 can render a traceback in that configuration**: no. Confirmed by reading
`django/core/handlers/exception.py::response_for_exception` directly (see Task 1's changelog entry for how
— a disposable, isolated Django install used only to read source) — the generic-exception branch that
produces Django's yellow debug traceback page (`debug.technical_500_response`) is gated on
`if settings.DEBUG:` with **no other path to it**; with `DEBUG=False` every unhandled exception instead
goes through `handle_uncaught_exception`, which renders `500.html` (now branded, see Task 1) if present or
Django's own minimal "Server Error (500)" fallback otherwise — never a traceback to the browser either way.
The same file's `Http404`/`BadRequest`/`SuspiciousOperation` branches are also explicitly `DEBUG`-gated the
same way — none of Django's own exception paths can leak a traceback with `DEBUG=False`, regardless of
which one fires.

**`ALLOWED_HOSTS` and whether the error pages actually render**: `settings.py:614` —
`ALLOWED_HOSTS = __get_list("PAPERLESS_ALLOWED_HOSTS", ["*"])`, defaulting to the wildcard unless an
operator restricts it. This matters for error-page rendering specifically because a `DisallowedHost`
exception (raised when a request's `Host` header doesn't match `ALLOWED_HOSTS`) is a `SuspiciousOperation`
subtype, which — per the same `response_for_exception` — *would* attempt a `DEBUG`-gated technical debug
response if `DEBUG` were ever accidentally `True` in production; with the default wildcard `["*"]`,
`DisallowedHost` never fires at all in a default deployment, so this compound risk doesn't materialize.
Also confirmed there's no reverse proxy or static-error-page layer in front of Django in the production
Docker image that could intercept or replace its responses:
`docker/rootfs/etc/s6-overlay/s6-rc.d/svc-webserver/run` runs `granian` directly against
`paperless.asgi:application` — no bundled nginx, no separate static-file server with its own default error
pages. Whatever Django itself renders for 403/404/500 is exactly what reaches the browser.

**Conclusion**: configuration was already correct — `DEBUG` defaults to `False` and is never set to `true`
anywhere in a production stack; with `DEBUG=False`, Django's own exception handling cannot leak a
traceback under any of its branches; `ALLOWED_HOSTS`'s permissive default means the one path that could
compound with an accidental `DEBUG=True` doesn't get triggered; and nothing sits between Django and the
browser that could bypass whatever error template Django renders. No settings changes made — nothing here
needed fixing.

**Verification**: read `src/paperless/settings.py`, `docker/rootfs/etc/s6-overlay/s6-rc.d/svc-webserver/run`,
every `docker/compose/docker-compose.*.yml`, and Django 5.2.5's own
`django/core/handlers/exception.py`/`django/views/debug.py` source directly (via the same disposable venv
described in Task 1), rather than reasoning from memory of how Django is "supposed to" behave. Could not
start an actual production-mode container in this environment to confirm end-to-end — this is a
configuration-and-source-code audit, not a live test; recommend confirming with a real deployment before
treating this as the final word.

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

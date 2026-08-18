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

## UI consistency — skeleton loading states, Increment 1 (pending commit)

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

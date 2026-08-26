# Docvera Branding Inventory

Single source of truth for every Docvera brand value and every place that value is applied in the
codebase. If you change a brand value, update it here **and** in `src-ui/src/app/data/docvera-brand.ts`
(the runtime source of truth for the frontend) in the same change. See `DOCVERA_CHANGELOG.md` for the
history of how each of these was introduced.

## Brand values

| Value | Content |
|---|---|
| Product name | Docvera |
| Company | Veltrix AI |
| Tagline | Intelligent Document Management |
| Primary color | Navy `#1A3D7C` — `hsl(217, 65%, 29%)` |
| Secondary color | Teal `#0E7490` |
| Accent color | Blue `#3B82F6` |
| Copyright holder | Veltrix AI |

Only the primary (Navy) color is currently wired into the live UI theme (`src-ui/src/theme.scss`). Teal
and the accent blue are declared in `DOCVERA_BRAND` for future use but are not yet consumed anywhere —
don't assume the UI shows teal just because it's in the constant.

## Where branding is applied

| Location | What lives there |
|---|---|
| `src-ui/src/app/data/docvera-brand.ts` | `DOCVERA_BRAND` — the single frontend source of truth (name, company, tagline, URLs, colors, logo paths, copyright, upstream attribution). Import this; never hardcode brand strings in components. |
| `src-ui/src/environments/environment.ts` / `environment.prod.ts` | `appTitle: 'Docvera'` — shown in the browser tab / app chrome. |
| `src-ui/src/theme.scss` | `paperless-green` / `paperless-green-dark-mode` SCSS mixins — the HSL values inside them were changed to Navy; the mixin *names* were deliberately left unchanged (see "Identifiers to never rename" below). |
| `src-ui/src/app/components/common/logo/logo.component.html` | Renders `assets/logo.svg` (or a `customLogo` override) instead of an inline hand-drawn SVG. |
| `src-ui/src/app/components/app-frame/app-frame.component.html` | Sidebar logo — uses the logo asset instead of an inline "leaf" SVG. |
| `src-ui/src/app/components/admin/settings/settings.component.html`, `src-ui/src/app/components/common/welcome-widget/welcome-widget.component.html` | Settings and welcome-widget copy referencing the product name. |
| `src-ui/src/app/data/ui-settings.ts` | UI default settings referencing app title/branding. |
| `src-ui/src/assets/logo*.svg`, `favicon.ico` | Logo asset files (full, dark, notext, white-notext variants) and favicon. |
| `src/documents/templates/index.html` | Django-rendered loading screen: `<title>`, `<meta name="author">`, favicon `<link>`, loading text. |
| `src/documents/templates/paperless-ngx/base.html` | Django-rendered auth pages (login, password reset, etc.): `<meta name="author">`, favicon, the "by Veltrix AI" byline. |
| `src/documents/templates/paperless-ngx/snippets/svg_logo.html`, `svg_leaf.html` | Server-side logo snippets — now `<img>` tags pointing at the static Docvera logo assets instead of inline hand-drawn SVG markup. |
| `src/documents/templates/paperless-ngx/error_base.html`, `src/documents/templates/400.html`/`403.html`/`403_csrf.html`/`404.html`/`500.html` | Branded Django error pages (new, not present upstream) — the complete set of templates Django itself exposes a hook for, reusing the Docvera logo snippet, brand tokens, and typography from the auth pages in a single-column layout. |
| `src/documents/static/base.css` | `--bs-link-color-rgb: 26, 61, 124` (Navy) for the Django admin/auth pages, `.byline` styling, and the `.error-page-*` rules for the branded error pages above. `--pngx-primary`/`--pngx-primary-text` split (fill vs. text/UI-boundary roles — each needs a different dark-mode value) and every link/button hover/active shade are Navy end to end — no upstream green remains in this file (audited and confirmed; see `DOCVERA_CHANGELOG.md`). |
| `src/paperless/urls.py` | `admin.site.site_header`/`site_title`/`index_title` — the Django admin's browser-tab title, top branding-bar text, and index-page heading. "Docvera" (proper noun, left untranslated, matching how the product name isn't translated anywhere else); `index_title` ("Docvera administration") goes through `gettext_lazy`, same as upstream's own convention for that one string. |
| `src/*/apps.py` — an `AppConfig.verbose_name` | **Easy to miss**: this is what labels an app's section heading on the Django admin index (one heading per app that has at least one admin-registered model) — a branded surface with no template or `site_header`-style settings value to grep for, which is exactly why it was missed by the original admin rebrand. Currently only `paperless_mail/apps.py`'s `verbose_name = _("Mail")` is *visible* (the app has admin-registered models); `paperless/apps.py`'s `verbose_name = _("Paperless")` and `ApplicationConfiguration.Meta.verbose_name` in `paperless/models.py` are the same pattern but currently dormant — neither app/model has anything registered in `admin.py`, so nothing renders yet. Left as-is deliberately (a defect with no visible output isn't a defect yet); revisit if either is ever registered. `paperless_mail/admin.py`'s `MailRuleAdmin` fieldset `description` is the same "Paperless" pattern in prose form, not a heading — fixed alongside the heading since it's the same app, same root string, same fix. |
| `src/documents/templates/admin/base_site.html`, `src/documents/static/admin-theme.css` | Django admin color theme (new override, not present upstream) — a minimal `{% extends "admin/base_site.html" %}` that injects one additional stylesheet overriding Django's own `--primary`/`--secondary`/`--link-fg`/`--link-hover-color`/`--breadcrumbs-bg` CSS custom properties with Docvera Navy, replacing Django's default teal/blue admin skin. Applies to every admin page (login, index, change forms, password change) since they all extend this one file; no per-page template needed. |
| `src-ui/src/locale/messages.*.xlf` (47 files) | Human-facing translated strings, rebranded via `scripts/docvera-rebrand-locales.ps1`. |
| `PAPERLESS_APP_TITLE`, `PAPERLESS_APP_LOGO` env vars | Runtime overrides for title/logo without a rebuild. |

### Known, intentional exception

`src/documents/templates/index.html` still links to `https://docs.paperless-ngx.com` ("Here's a link to
the docs") on the loading screen. This is deliberate — Docvera does not yet host its own docs site, and
the rebrand script (`scripts/docvera-rebrand-locales.ps1`) explicitly guards against rewriting
`docs.paperless-ngx.com` URLs. Don't "fix" this with a blind find-and-replace; update it only once a real
Docvera docs URL exists, and update this file when you do.

## Identifiers to never rename

These are technical identifiers, not brand assets. Renaming them breaks upstream compatibility, future
merges, or GPLv3 attribution requirements — leave them as-is even though they contain "paperless":

- **CSS classes**: `paperless-input-*` (e.g. `.paperless-input-select`), and the `pngx-*` custom CSS
  properties (`--pngx-primary`, `--pngx-bg-alt`, etc.) used throughout `theme.scss` and component styles.
- **SCSS mixin names**: `paperless-green`, `paperless-green-dark-mode` — only the color values inside them
  were rebranded, the names stayed put deliberately to minimize diff surface against upstream.
- **Python modules**: `paperless`, `paperless_mail`, `paperless_tesseract`, `paperless_tika`,
  `paperless_text` — Django app names, importable as-is by the whole backend.
- **Django settings keys**: `PAPERLESS_*` (e.g. `PAPERLESS_APP_TITLE`, `PAPERLESS_APP_LOGO`,
  `PAPERLESS_DEBUG`) — the entire environment-variable configuration surface.
- **TypeScript types**: `Paperless*`-prefixed interfaces/classes in `src-ui/src/app/data/`.
- **Angular component selector prefix**: `pngx-` (e.g. `<pngx-root>`, `<pngx-logo>`).
- **URLs**: `docs.paperless-ngx.com` — kept intentionally, see "Known, intentional exception" above.
- **`DOCVERA_BRAND.poweredBy` / `poweredByUrl`** (`paperless-ngx`, the upstream GitHub URL) — required
  upstream attribution under GPLv3; do not remove or rebrand.

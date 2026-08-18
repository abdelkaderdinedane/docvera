# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is **Docvera**, a commercial fork of [paperless-ngx](https://github.com/paperless-ngx/paperless-ngx)
maintained by Veltrix AI. The current branch (`docvera-baseline-v2.20.15`) is a rebrand of upstream
paperless-ngx v2.20.15 — same Django/Angular application, with Docvera product branding (name, logo,
theme colors, locale strings) layered on top. There is no multi-tenant or SaaS-specific code in this
codebase yet; that infrastructure (if/when it exists) lives in separate control-plane/billing services
that talk to this app only through its REST API and are not part of this repo.

`UPSTREAM_VERSION` and `UPSTREAM_COMMIT` (repo root) pin the exact upstream release this branch is based
on; `DOCVERA_VERSION` is the current Docvera product version. `DOCVERA_BRANDING.md` is the single source
of truth for every brand value (product name, colors, URLs) and lists every file where branding is
applied, plus the technical identifiers (`paperless_*` Python modules, `PAPERLESS_*` settings keys,
`paperless-input-*`/`pngx-*` CSS, `Paperless*` TS types, the `docs.paperless-ngx.com` URL) that must never
be renamed. `DOCVERA_CHANGELOG.md` records every branding modification made on top of the pinned upstream
baseline — check it before touching a file that carries Docvera branding, so you know why it was changed
and what upgrade risk it carries.

Because this tracks an upstream project via a read-only `upstream` git remote, prefer minimal, isolated
diffs to files shared with upstream (models, migrations, core views) so future `git merge tags/vX.Y.Z`
upgrades stay tractable. Favor configuration/environment-variable overrides or additive components over
editing core upstream logic in place.

## Architecture

Two independently-versioned halves that communicate over a REST API:

- **`src/`** — Django 5 + Django REST Framework backend, managed with `uv`. Entry app is `paperless/`
  (settings, urls, celery config, ASGI/WSGI). `documents/` is the core domain app: models (`Document`,
  `Correspondent`, `Tag`, `DocumentType`, `StoragePath`, `CustomField`, `SavedView`, `ShareLink`,
  `Workflow`/`WorkflowTrigger`/`WorkflowAction`, ...), REST serializers/views, filters, matching/
  classifier logic, the consumption pipeline (`consumer.py`, `tasks.py`, `barcodes.py`, `index.py`), and
  `management/commands/` for CLI operations (consumer, archiver, exporter/importer, retagger, sanity
  checker, classifier training, etc.). Parser apps plug into the consumption pipeline via a
  `document_consumer_declaration` signal: `paperless_tesseract/` (OCR via Tesseract + ocrmypdf),
  `paperless_tika/` (Office docs via Apache Tika), `paperless_text/` (plain text), and `paperless_mail/`
  (IMAP mail account/rule ingestion, OAuth). Document actions/webhooks triggered by workflow rules live in
  `documents/workflows/`; model signal handlers live in `documents/signals/handlers.py`.
- **`src-ui/`** — Angular 20 frontend (standalone components), built with pnpm + Angular CLI, proxies API
  calls to the Django backend. Structure under `src/app/`: `components/` (feature UI, organized by area —
  `admin/`, `manage/`, `document-list/`, `document-detail/`, common/shared building blocks under
  `components/common/`), `services/` (API clients and app state), `guards/`, `interceptors/`, `pipes/`,
  `directives/`, `data/` (TS models mirroring backend serializers). i18n source strings live in
  `src-ui/messages.xlf`; translated locale files live in `src-ui/src/locale/`.
- **`docker/`** — Compose stacks for local dev (`docker/compose/docker-compose.*.yml`, variants for
  postgres/mariadb/sqlite × with/without Tika) and the container rootfs/build scripts used by the
  production `Dockerfile`.
- **`docs/`** — Zensical-built documentation site (upstream paperless-ngx docs, retained).

Custom document parsers extend `documents.parsers.DocumentParser` (implement `parse` and `get_thumbnail`)
and register via the `document_consumer_declaration` signal — see `paperless_tesseract/apps.py` for the
canonical example.

## Common commands

### Backend (run from `src/` unless noted; package/env management via `uv` from repo root)

```bash
uv sync --group dev                 # install backend deps (repo root)
uv run pre-commit install           # install git hooks (repo root)

uv run manage.py migrate
uv run manage.py createsuperuser
uv run manage.py runserver
uv run manage.py document_consumer  # watches the consume/ folder
celery --app paperless worker -l DEBUG

cd src && pytest                                     # full backend test suite (+ HTML/XML coverage)
cd src && pytest documents/tests/test_api_documents.py             # one test file
cd src && pytest documents/tests/test_api_documents.py::TestCase::test_name  # one test
```

`pytest` config (markers, coverage, `DJANGO_SETTINGS_MODULE=paperless.settings`) lives in `pyproject.toml`
under `[tool.pytest.ini_options]`. Backend lint/format is `ruff` (`ruff check`, `ruff format` — also run
automatically via pre-commit). Type checking: `uv run --group typing mypy src` (uses `django-stubs`).

### Frontend (run from `src-ui/`)

```bash
pnpm install        # npm is blocked by design (preinstall hook enforces pnpm)
pnpm start           # ng serve, http://localhost:4200, proxies API to :8000
pnpm run build        # production build (ng build)
pnpm run test          # ng test --no-watch --coverage (Jest)
pnpm run lint          # ng lint (ESLint)
npx playwright test              # e2e tests (specs under src-ui/e2e/)
npx playwright test --ui         # e2e tests, interactive UI
ng extract-i18n                  # regenerate src-ui/messages.xlf after adding translatable strings
```

A single Jest spec: `pnpm run test -- path/to/file.spec.ts` (or `ng test --no-watch --coverage --test-path-pattern=...`).

### Full stack via Docker

```bash
cd docker/compose
docker compose -f docker-compose.postgres-tika.yml up -d
docker compose -f docker-compose.postgres-tika.yml exec webserver python manage.py createsuperuser
```

`scripts/start_services.sh` can instead spin up just the supporting services (Redis, Tika, Gotenberg, DB)
for bare-metal backend/frontend development.

## Conventions worth knowing

- Python targets 3.10–3.14 (Docker images build on 3.12); formatting/linting is `ruff` per the rules in
  `pyproject.toml` (`[tool.ruff]`) — `ruff format` and `ruff check --fix` are run by pre-commit.
- Frontend `.ts`/`.html`/`.scss`/`.md` are formatted by `prettier` via pre-commit
  (`git ls-files -- '*.ts' | xargs pre-commit run prettier --files` to run manually).
- Don't hardcode brand strings/colors/asset paths in frontend components — import `DOCVERA_BRAND` from
  `src-ui/src/app/data/docvera-brand.ts` instead, which is the runtime source of truth (see
  `DOCVERA_BRANDING.md` for the full inventory of brand values and where each is applied). Product
  title/theme/logo are overridable at runtime via `PAPERLESS_APP_TITLE` / `PAPERLESS_APP_LOGO` env vars.
- Backend and frontend translations are separate pipelines: Django strings extract via
  `manage.py makemessages -l en_US` into `src/locale/`; Angular strings extract via `ng extract-i18n` into
  `src-ui/messages.xlf`, translated files go in `src-ui/src/locale/`. Adding a language touches
  `src-ui/angular.json` (i18n locales), `src/paperless/settings.py` (`LANGUAGES`),
  `src-ui/src/app/services/settings.service.ts` (`LANGUAGE_OPTIONS`), and `src-ui/src/app/app.module.ts`
  (`registerLocaleData`) — keep `en-us` first in every list.
- PRs against upstream paperless-ngx convention (documented in `CONTRIBUTING.md`) require formatted,
  tested code; this repo's own convention (per README) is per-feature commits on a feature branch, never
  direct commits to the default branch.

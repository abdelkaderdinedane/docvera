# Docvera

**Commercial multi-tenant SaaS document management platform**

Docvera is an intelligent document management platform built by [Veltrix AI](https://veltrix.ai) for
commercial deployment. It provides secure document ingestion, bilingual OCR (English and Arabic),
full-text search, metadata management, workflow automation and external sharing, delivered as a
hosted SaaS product with isolated customer environments.

---

## Project status

| | |
|---|---|
| **Current phase** | Phase 2 — Branding & UX Foundation |
| **Upstream baseline** | [paperless-ngx](https://github.com/paperless-ngx/paperless-ngx) v2.20.15 (pinned) |
| **Active branch** | `docvera-baseline-v2.20.15` |
| **Docvera version** | 0.2.0-dev |

Docvera is built on top of the open-source paperless-ngx project. The upstream repository is
configured as a read-only `upstream` remote so that future releases can be reviewed, compared and
selectively integrated without losing Docvera-specific work.

---

## Repository structure

| Path | Contents |
|---|---|
| `src/` | Django backend — document models, REST API, ingestion pipeline, OCR parsers, workflows |
| `src-ui/` | Angular frontend — components, routing, services, theme, locale files |
| `docker/` | Docker Compose stacks and container build definitions |
| `docs/` | Upstream documentation (retained) |
| `DOCVERA_BRANDING.md` | Single source of truth for all Docvera brand values |
| `DOCVERA_CHANGELOG.md` | Record of every modification: reason, approach, upgrade impact |
| `UPSTREAM_VERSION` | Pinned upstream release tag |
| `UPSTREAM_COMMIT` | Exact upstream commit SHA |
| `DOCVERA_VERSION` | Current Docvera product version |

---

## Local development

### Prerequisites

- Docker Desktop
- Node.js v20+ and [pnpm](https://pnpm.io/) (frontend builds — `npm` is blocked by design)
- Git

### Running the stack

```bash
cd docker/compose
docker compose -f docker-compose.postgres-tika.yml up -d
docker compose -f docker-compose.postgres-tika.yml ps
```

Wait for the `webserver` container to report `healthy`, then open <http://localhost:8000>.

Create an administrator account:

```bash
docker compose -f docker-compose.postgres-tika.yml exec webserver python manage.py createsuperuser
```

### Frontend development

For rapid iteration with hot reload:

```bash
cd src-ui
pnpm install
pnpm start
```

The dev server runs on <http://localhost:4200> and proxies API calls to the backend on port 8000.

For a production build:

```bash
pnpm run build
```

---

## Services

| Service | Technology | Role |
|---|---|---|
| Webserver | Django 4 + DRF + Gunicorn | Application, API, orchestration |
| Frontend | Angular (compiled, served statically) | Single-page user interface |
| Database | PostgreSQL 18 | Documents, metadata, users, permissions |
| Broker | Redis | Celery task queue |
| OCR | Tesseract 5 + ocrmypdf | Text extraction (`eng+ara`) |
| Tika | Apache Tika | Office document text extraction |
| Gotenberg | Gotenberg | Office to PDF conversion |

---

## Branding

All brand values are centralized. Do not hardcode brand strings, colours or asset paths in
components.

| Value | Location |
|---|---|
| Product name | `src-ui/src/environments/environment.ts` and `environment.prod.ts` (`appTitle`) |
| Theme colours | `src-ui/src/theme.scss` (primary colour mixins) |
| Brand constants | `src-ui/src/app/data/docvera-brand.ts` (`DOCVERA_BRAND`) |
| Logo assets | `src-ui/src/assets/logo*.svg`, `src-ui/src/favicon.ico` |
| Runtime overrides | `PAPERLESS_APP_TITLE`, `PAPERLESS_APP_LOGO` (environment variables) |

Primary brand colour: **Navy `#1A3D7C`** · Secondary: **Teal `#0E7490`**

See [`DOCVERA_BRANDING.md`](DOCVERA_BRANDING.md) for the complete inventory, including the list of
technical identifiers that must never be renamed.

---

## Contributing to this repository

- Work on a feature branch — never commit directly to the default branch
- Split work into logical, per-feature commits rather than one large change
- Record every modification to upstream code in `DOCVERA_CHANGELOG.md` with its upgrade impact
- Prefer **configuration** over **extension** over **wrapper** over **core modification**
- Never commit credentials, secrets or environment files containing real values

### Upstream synchronization

```bash
git fetch upstream --tags
git checkout -b upgrade/vX.Y.Z
git merge tags/vX.Y.Z --no-ff
```

Resolve conflicts, re-apply Docvera patches from the customization inventory, run the full
regression suite, then update `UPSTREAM_VERSION`, `UPSTREAM_COMMIT` and `DOCVERA_VERSION`.

---

## Licensing

Docvera is derived from paperless-ngx, which is licensed under the **GNU General Public License
v3.0 (GPLv3)**. This repository inherits that licence.

- The original `LICENSE` file, copyright notices and third-party attributions are retained and
  must not be removed.
- Docvera control-plane, AI and billing services are maintained as **separate codebases** that
  communicate with this application only through its REST API, and are therefore not derivative
  works of the GPLv3 codebase.

---

## Documentation

| Document | Purpose |
|---|---|
| `DOCVERA_BRANDING.md` | Brand configuration inventory |
| `DOCVERA_CHANGELOG.md` | Modification history with upgrade impact |
| Architecture Assessment | System architecture, database schema, REST API, UI map, customization inventory, upgrade strategy, licence comparison |

---

*Internal repository — Veltrix AI. Not for public distribution.*

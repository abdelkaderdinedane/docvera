\# Docvera Changelog



All modifications to the upstream paperless-ngx codebase are documented here.

Format: \[Phase] \[Date] \[File] — \[Why] — \[Approach] — \[Upgrade impact]



\---



\## Phase 2 — Branding Foundation



\### 2026-08-09 — Application title

\- \*\*File\*\*: src-ui/src/index.html

\- \*\*Change\*\*: `<title>Paperless-ngx</title>` → `<title>Docvera</title>`

\- \*\*Why\*\*: Customer-facing browser tab must show Docvera brand

\- \*\*Approach\*\*: Direct configuration (minimal change)

\- \*\*Upgrade impact\*\*: Low — single line, easy to reapply after upstream merge



\### 2026-08-09 — PWA manifest

\- \*\*File\*\*: src-ui/src/manifest.webmanifest

\- \*\*Change\*\*: name and short\_name → Docvera

\- \*\*Why\*\*: PWA install prompt must show Docvera brand

\- \*\*Approach\*\*: Configuration

\- \*\*Upgrade impact\*\*: Low



\### 2026-08-09 — Primary theme color

\- \*\*File\*\*: src-ui/src/app/data/ui-settings.ts

\- \*\*Change\*\*: PAPERLESS\_GREEN\_HEX → #1A3D7C (Docvera Navy)

\- \*\*Why\*\*: Default theme color must match Docvera brand identity

\- \*\*Approach\*\*: Single constant replacement

\- \*\*Upgrade impact\*\*: Low — recheck this value on upstream upgrades



\### 2026-08-09 — App frame branding text

\- \*\*File\*\*: src-ui/src/app/components/app-frame/app-frame.component.html

\- \*\*Change\*\*: "by Paperless-ngx" → "by Veltrix AI", visible "Paperless-ngx" text → "Docvera"

\- \*\*Why\*\*: Sidebar byline must reflect product and company name

\- \*\*Approach\*\*: Text replacement (URLs and technical identifiers preserved)

\- \*\*Upgrade impact\*\*: Medium — recheck on upstream upgrades, merge conflicts possible



\### 2026-08-09 — Welcome widget

\- \*\*File\*\*: src-ui/src/app/components/dashboard/widgets/welcome-widget/welcome-widget.component.html

\- \*\*Change\*\*: "Paperless-ngx" → "Docvera" in welcome message

\- \*\*Why\*\*: First-run welcome message must reflect Docvera brand

\- \*\*Approach\*\*: Text replacement

\- \*\*Upgrade impact\*\*: Low



\### 2026-08-09 — Logo and favicon assets

\- \*\*Files\*\*: src-ui/src/assets/logo.svg, logo-dark.svg, logo-notext.svg, logo-dark-notext.svg, logo-white-notext.svg, favicon.ico

\- \*\*Change\*\*: Replaced paperless-ngx SVG assets with Docvera logo variants

\- \*\*Why\*\*: Visual brand identity

\- \*\*Approach\*\*: Asset replacement (filenames preserved for compatibility)

\- \*\*Upgrade impact\*\*: Low — upstream upgrades rarely touch logo assets



\### 2026-08-09 — Runtime branding via environment

\- \*\*File\*\*: docker/compose/docker-compose.env

\- \*\*Change\*\*: Added PAPERLESS\_APP\_TITLE=Docvera, PAPERLESS\_APP\_LOGO

\- \*\*Why\*\*: Runtime title and logo without code modification (preferred approach)

\- \*\*Approach\*\*: Configuration — zero code change

\- \*\*Upgrade impact\*\*: None


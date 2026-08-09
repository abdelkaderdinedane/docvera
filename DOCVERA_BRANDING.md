\# Docvera Branding Configuration



This file is the single source of truth for all Docvera branding values.

Every modification to the upstream paperless-ngx codebase related to branding

must reference this file and be documented in DOCVERA\_CHANGELOG.md.



\## Brand Identity



| Key | Value |

|---|---|

| Product name | Docvera |

| Company name | Veltrix AI |

| Primary color | #1A3D7C (Navy) |

| Secondary color | #0E7490 (Teal) |

| Upstream brand color | #17541f (Paperless Green — do not use) |



\## Runtime Configuration (docker-compose.env)



| Variable | Value | Method |

|---|---|---|

| PAPERLESS\_APP\_TITLE | Docvera | Configuration — no code change |

| PAPERLESS\_APP\_LOGO | /logo/docvera-logo.png | Configuration — uploaded via /config |



\## Source Code Changes



| File | Change | Risk |

|---|---|---|

| src-ui/src/index.html | Title tag → Docvera | Low |

| src-ui/src/manifest.webmanifest | name, short\_name → Docvera | Low |

| src-ui/src/app/data/ui-settings.ts | PAPERLESS\_GREEN\_HEX → #1A3D7C | Low |

| src-ui/src/app/components/app-frame/app-frame.component.html | "by Paperless-ngx" → "by Veltrix AI", "Paperless-ngx" → "Docvera" | Low |

| src-ui/src/app/components/dashboard/widgets/welcome-widget/welcome-widget.component.html | "Paperless-ngx" → "Docvera" | Low |

| src-ui/src/assets/logo.svg | Replaced with Docvera logo | Low |

| src-ui/src/assets/logo-dark.svg | Replaced with Docvera logo (dark) | Low |

| src-ui/src/assets/favicon.ico | Replaced with Docvera favicon | Low |



\## Files NOT Modified (technical identifiers — must not change)



\- Internal CSS class names (paperless-input-select, etc.)

\- Python module names (paperless\_mail, paperless\_tesseract, etc.)

\- Database migration identifiers

\- GitHub/documentation URLs

\- Django internal settings keys (PAPERLESS\_\*)


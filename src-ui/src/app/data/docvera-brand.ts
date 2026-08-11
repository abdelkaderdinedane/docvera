/**
 * Docvera Brand Configuration
 * Single source of truth for all Docvera branding values.
 * Import this file wherever brand values are needed in the frontend.
 * DO NOT hardcode brand values directly in components.
 *
 * @see DOCVERA_BRANDING.md for the complete branding inventory
 * @see DOCVERA_CHANGELOG.md for modification history
 */

export const DOCVERA_BRAND = {
  // Product identity
  productName: 'Docvera',
  companyName: 'Veltrix AI',
  tagline: 'Intelligent Document Management',

  // URLs
  supportUrl: 'https://docvera.io/support',
  docsUrl: 'https://docvera.io/docs',
  privacyUrl: 'https://docvera.io/privacy',
  termsUrl: 'https://docvera.io/terms',

  // Theme colors
  primaryColor: '#1A3D7C',   // Navy
  secondaryColor: '#0E7490', // Teal
  accentColor: '#3B82F6',    // Blue

  // Logo paths (relative to assets/)
  logoFull: 'assets/logo.svg',
  logoDark: 'assets/logo-dark.svg',
  logoIcon: 'assets/logo-notext.svg',
  logoIconDark: 'assets/logo-dark-notext.svg',
  logoIconWhite: 'assets/logo-white-notext.svg',
  favicon: 'favicon.ico',

  // Copyright
  copyrightYear: '2026',
  copyrightHolder: 'Veltrix AI',

  // Powered by (upstream attribution — do not remove, required by GPLv3)
  poweredBy: 'paperless-ngx',
  poweredByUrl: 'https://github.com/paperless-ngx/paperless-ngx',
} as const

export type DocveraBrand = typeof DOCVERA_BRAND
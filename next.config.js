/** @type {import('next').NextConfig} */

// Media (ville photos…) is served by the API, so its host must be allow-listed
// for next/image. Derived from the same env the app uses to build media URLs,
// so dev (localhost:3001) and production (the real API domain) both work.
const MEDIA_ORIGIN =
  process.env.NEXT_PUBLIC_MEDIA_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3001'

/**
 * Security headers on every response. The CSP holds the directives that cost
 * nothing: no framing (booking/account pages can't be clickjacked), no
 * plugins, no <base> hijack, forms post only here. A script-src allow-list is
 * deliberately left out: it needs per-request nonces, which would force every
 * page to render on demand and lose static generation (SEO + speed).
 */
const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

// Only production (rezervy.io) may be indexed — the team preview
// (rzv.wisecode.tn) and local builds must not compete with it in Google.
// Same rule as INDEXABLE in lib/site.js (CommonJS here, so restated).
const SITE_HOST = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rezervy.io').hostname
const INDEXABLE = /^(www\.)?rezervy\.io$/.test(SITE_HOST)
if (!INDEXABLE) SECURITY_HEADERS.push({ key: 'X-Robots-Tag', value: 'noindex, nofollow' })

module.exports = {
  output: 'standalone',
  poweredByHeader: false,

  headers() {
    // public/ files keep fixed names (a logo is replaced in place), so not
    // "immutable" — a day of browser caching instead of Next's max-age=0.
    const publicAsset = (dir) => ({
      source: `/${dir}/:file+`,
      headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
    })
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      publicAsset('brand'),
      publicAsset('assistant'),
      publicAsset('main'),
    ]
  },

  // Serve API media under our OWN origin. next/image then treats these as local
  // images: no remotePatterns, no cross-origin fetch, and it side-steps Next 16
  // refusing to optimize hosts that resolve to a private IP (localhost in dev).
  rewrites() {
    return [{ source: '/media/:file', destination: `${MEDIA_ORIGIN}/media/:file` }]
  },

  images: {
    // Ville/salon photos are card-sized, never full-bleed heroes.
    imageSizes: [96, 128, 240, 320, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // uploads are immutable (uuid filenames)
  },
}

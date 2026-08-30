/** @type {import('next').NextConfig} */

// Media (ville photos…) is served by the API, so its host must be allow-listed
// for next/image. Derived from the same env the app uses to build media URLs,
// so dev (localhost:3001) and production (the real API domain) both work.
const MEDIA_ORIGIN =
  process.env.NEXT_PUBLIC_MEDIA_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3001'

module.exports = {
  output: 'standalone',

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

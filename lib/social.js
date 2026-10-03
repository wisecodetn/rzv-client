/**
 * Turn what a salon typed into a link that actually leaves the site.
 *
 * Salons enter these however they like — "wisecodetn", "@wisecodetn", a full
 * profile URL, or "wisecode.tn" with no scheme. A bare domain in `href` is a
 * RELATIVE link: clicking "Site web" used to navigate to /salon/x/wisecode.tn
 * instead of opening the site.
 */

/** A handle, a URL, or junk → an absolute https URL, or null. */
function absolute(raw, base) {
  const v = String(raw ?? '').trim()
  if (!v) return null
  // Already a URL — keep the salon's own link, just force a scheme.
  if (/^https?:\/\//i.test(v)) return v
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(v)) return `https://${v.replace(/^\/+/, '')}`
  if (!base) return null
  // A handle: strip @, any leading slash, and a pasted bare domain prefix.
  const handle = v.replace(/^@/, '').replace(/^\/+/, '').split(/[?#]/)[0]
  return handle ? `${base}${handle}` : null
}

/** The salon's social presence as rendered links — absent ones are dropped. */
export function socialLinks(s) {
  return [
    { key: 'instagram', label: 'Instagram', handle: s?.instagram, href: absolute(s?.instagram, 'https://instagram.com/') },
    { key: 'facebook', label: 'Facebook', handle: s?.facebook, href: absolute(s?.facebook, 'https://facebook.com/') },
    { key: 'website', label: 'Site web', handle: s?.website, href: absolute(s?.website, null) },
  ].filter((l) => l.href)
}

/** "@wisecodetn" / "wisecode.tn" — what to show next to the icon. */
export function socialHandle(link) {
  const v = String(link.handle ?? '').trim()
  if (link.key === 'website') return v.replace(/^https?:\/\//i, '').replace(/\/$/, '')
  return v.startsWith('@') ? v : `@${v.replace(/^https?:\/\/[^/]+\//i, '').replace(/\/$/, '')}`
}

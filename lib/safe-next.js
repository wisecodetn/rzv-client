/**
 * Where to send someone after login / signup / verification, from a `?next=`
 * the URL carries. Anyone can craft that URL, so only a path on this site is
 * accepted: `/connexion?next=https://evil.tn/connexion` would otherwise hand a
 * freshly logged-in visitor to a look-alike page.
 *
 * Accepted: "/salon/x/reserver?confirm=1". Refused (→ fallback): absolute URLs,
 * protocol-relative "//host" and "/\host" (browsers treat "\" as "/"), and
 * anything with control characters. Works on the server too (no `window`).
 */
export function safeNext(value, fallback = "/compte") {
  if (typeof value !== "string") return fallback
  const v = value.trim()
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return fallback
  if (/[\u0000-\u001f\u007f]/.test(v)) return fallback
  try {
    const base = "https://rezervy.invalid"
    const u = new URL(v, base)
    if (u.origin !== base) return fallback
    return u.pathname + u.search + u.hash
  } catch {
    return fallback
  }
}

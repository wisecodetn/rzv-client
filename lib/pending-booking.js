/* Pending booking, persisted across the login/signup redirect so a guest's
   selections are never lost. One pending booking at a time; 1h TTL. */
export const PENDING_KEY = "rzv_pending_booking"
export const savePending = (data) => { try { localStorage.setItem(PENDING_KEY, JSON.stringify({ ...data, savedAt: Date.now() })) } catch {} }
export const clearPending = () => { try { localStorage.removeItem(PENDING_KEY) } catch {} }
export const loadPending = (salonSlug) => {
  try {
    const p = JSON.parse(localStorage.getItem(PENDING_KEY) || "null")
    if (!p || p.salonSlug !== salonSlug) return null
    if (Date.now() - (p.savedAt || 0) > 60 * 60 * 1000) { clearPending(); return null }
    return p
  } catch { return null }
}

/** Drop a pending booking older than the hour, whatever page is open — the
 *  privacy page says it is kept one hour, not "until the booking page is
 *  visited again". Called once per page load (AuthProvider). */
export const purgeExpiredPending = () => {
  try {
    const p = JSON.parse(localStorage.getItem(PENDING_KEY) || "null")
    if (p && Date.now() - (p.savedAt || 0) > 60 * 60 * 1000) clearPending()
  } catch {}
}

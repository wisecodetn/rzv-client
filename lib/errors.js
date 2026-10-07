/**
 * What to show a customer when something failed. The API's own messages are
 * already French and meant for people, so they pass through; a request that
 * never reached it (offline, DNS, timeout) surfaces as the browser's English
 * "Failed to fetch" / "NetworkError…" / "Load failed" — replaced here.
 */
const NETWORK = /failed to fetch|networkerror|load failed|network request failed|fetch failed|aborted|timeout/i

export function errorText(e, fallback = "Une erreur est survenue. Réessayez.") {
  const msg = typeof e === "string" ? e : e?.message
  if (e?.name === "AbortError" || e?.name === "TimeoutError" || (e instanceof TypeError && !msg) || (msg && NETWORK.test(msg))) {
    return "Connexion impossible. Vérifiez votre réseau et réessayez."
  }
  // An HTML error page read as JSON ("Unexpected token '<'…") is not a message for people.
  if (e instanceof SyntaxError) return fallback
  return msg || fallback
}

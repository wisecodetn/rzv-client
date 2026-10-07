/**
 * Rezervy Pro plans as sold — read from the API (`/public/plans`), the same
 * rows billing charges from. The site used to hard-code "dès 49 TND/mois" on
 * the partner pages and "39" on the home page while the real Starter cost 39.
 *
 * Returns null when the API can't be reached: pages then leave the price out
 * rather than print a figure that may be wrong.
 */
import { apiGet } from "./api"

export async function getPlans() {
  try {
    const r = await apiGet("/public/plans")
    const plans = Array.isArray(r?.plans) ? r.plans.filter((p) => Number.isFinite(p.price)) : []
    if (!plans.length) return null
    const cheapest = plans.reduce((a, b) => (b.price < a.price ? b : a))
    return { plans, trialDays: Number(r.trialDays) || 0, from: cheapest }
  } catch {
    return null
  }
}

/** "39" / "39,5" — prices are whole dinars today, but never print "39.5". */
export const formatPrice = (n) => String(n).replace(".", ",")

/** "39 TND/mois" for one plan. */
export const priceLabel = (p) => `${formatPrice(p.price)} ${p.currency || "TND"}/${p.period || "mois"}`

/** "dès 39 TND/mois", or "" when prices are unavailable. */
export const fromLabel = (pl) => (pl ? `dès ${priceLabel(pl.from)}` : "")

/**
 * A price of 0 means "sur devis": the salon gives the price at the visit (set
 * by leaving the price empty in Rezervy Pro). Never shown as "0 TND".
 */
export const isOnQuote = (p) => !(Number(p) > 0)

/** "45 TND" or "Sur devis". */
export const priceText = (p) => (isOnQuote(p) ? "Sur devis" : `${p} TND`)

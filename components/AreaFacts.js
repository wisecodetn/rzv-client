import { PAY_RULE, CANCEL_RULE } from "@/lib/site"
import { de } from "@/lib/fr"

const fmt = (n) => String(n).replace(".", ",")
const plural = (n, one, many) => (n > 1 ? many : one)

/**
 * "Ce qu'il faut savoir" for a city listing — written from the listing's own
 * figures (`stats` from the API), so each page says something true and
 * specific: how many salons, the real price range of what is browsed, the most
 * offered services, the areas, the reviews. It replaced one paragraph repeated
 * on every city page, with claims ("l'une des meilleures offres de la région")
 * nothing backed. A sentence without data is simply left out.
 */
export default function AreaFacts({ title, stats, what, cityName }) {
  if (!stats?.count) return null
  const { count, priceMin, priceMax, rating, reviews, areas = [], services = [] } = stats

  const intro = `${count} ${plural(count, "salon", "salons")}${what ? ` ${de(what)}` : ""} à ${cityName} ${plural(count, "propose", "proposent")} la réservation en ligne sur Rezervy.`
  const price =
    priceMin == null
      ? null
      : priceMin === priceMax
        ? `Les prestations affichées coûtent ${fmt(priceMin)} TND.`
        : `Les prix affichés vont de ${fmt(priceMin)} à ${fmt(priceMax)} TND selon la prestation.`
  const note = rating != null && reviews > 0 ? `Note moyenne : ${fmt(rating)}/5, sur ${reviews} avis de clientes.` : null

  return (
    <section style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 22, minWidth: 0 }}>
      <h2 className="serif" style={{ fontSize: 18, fontWeight: 400 }}>{title}</h2>
      <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.75, marginTop: 10 }}>
        <p style={{ margin: 0 }}>
          {intro} {price} {note}
        </p>

        {services.length > 0 && (
          <>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: "var(--ink)", margin: "14px 0 4px" }}>
              {plural(services.length, "La prestation proposée", "Les prestations les plus proposées")}
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {services.map((s) => (
                <li key={s.name}>
                  {s.name} — dès {fmt(s.from)} TND
                  {count > 1 ? ` · ${s.salons} ${plural(s.salons, "salon", "salons")}` : ""}
                </li>
              ))}
            </ul>
          </>
        )}

        {areas.length > 0 && (
          <p style={{ margin: "12px 0 0" }}>
            <strong style={{ color: "var(--ink)" }}>{plural(areas.length, "Quartier", "Quartiers")} :</strong>{" "}
            {areas.map((a) => (count > 1 ? `${a.name} (${a.count})` : a.name)).join(", ")}.
          </p>
        )}

        <p style={{ margin: "12px 0 0" }}>
          {PAY_RULE} {CANCEL_RULE} Confirmation et rappel par e-mail.
        </p>
      </div>
    </section>
  )
}

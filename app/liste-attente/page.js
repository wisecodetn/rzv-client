import Link from "next/link"
import PageShell from "@/components/PageShell"
import JsonLd from "@/components/JsonLd"
import NewsletterForm from "@/components/newsletter/NewsletterForm"
import { breadcrumbLd, faqLd } from "@/lib/jsonld"
import { getCategories, getCities, getCoverage } from "@/lib/data"
import { pageMeta } from "@/lib/meta"
import { PAY_RULE, CANCEL_RULE } from "@/lib/site"

/**
 * The waiting list: what Rezervy is, then the newsletter sign-up (source
 * "waitlist_page", double opt-in like every sign-up). Indexed — it is the
 * page to share while Rezervy opens city by city. Every figure on it comes
 * from the live catalogue (coverage), never a constant.
 */
export const metadata = pageMeta({
  absoluteTitle: "Liste d'attente Rezervy — nouveaux salons près de chez vous",
  description:
    "Rejoignez la liste d'attente Rezervy : réservez coiffure, barbier, onglerie et spa en ligne en Tunisie, et soyez prévenu(e) dès que de nouveaux salons ouvrent près de chez vous.",
  path: "/liste-attente",
  keywords: ["liste d'attente Rezervy", "réservation beauté Tunisie", "newsletter Rezervy", "salon de beauté en ligne"],
})

const FAQ = [
  ["C'est gratuit ?", "Oui. L'inscription à la liste d'attente est gratuite, et réserver sur Rezervy ne coûte rien : vous payez votre prestation directement au salon."],
  ["Que vais-je recevoir ?", "Un e-mail de temps en temps : l'arrivée de nouveaux salons et de nouvelles villes, les nouveautés du site et quelques conseils beauté. Jamais de spam, et nous ne transmettons pas votre adresse."],
  ["Pourquoi un e-mail de confirmation ?", "Pour être sûrs que l'adresse est bien la vôtre : vous n'êtes inscrit(e) qu'après avoir cliqué sur le lien reçu."],
  ["Comment me désinscrire ?", "Chaque e-mail contient un lien de désinscription : un clic suffit, sans compte ni mot de passe."],
]

const card = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 20 }

export default async function ListeAttente() {
  const [categories, cities, coverage] = await Promise.all([getCategories(), getCities(), getCoverage()])
  // Cities that have salons today, busiest first — the honest state of the map.
  const open = cities.filter((c) => coverage.cities[c.slug] > 0).sort((a, b) => coverage.cities[b.slug] - coverage.cities[a.slug])
  const salons = Object.values(coverage.cities).reduce((t, n) => t + n, 0)
  const offered = new Set(coverage.pairs.map((p) => p.category))
  const catNames = categories.filter((c) => offered.has(c.slug)).map((c) => c.name.toLowerCase())
  const what = catNames.length ? catNames.join(", ") : "coiffure, barbier, onglerie et spa"

  const FEATURES = [
    { t: "Trouver", d: `Comparez les salons près de chez vous — ${what} — avec leurs prix, leurs avis et leurs photos.` },
    { t: "Réserver 24h/24", d: "Choisissez la prestation, le jour, l'heure et même la personne : la demande part au salon, sans appel." },
    { t: "Payer au salon", d: PAY_RULE },
    { t: "Rester libre", d: `${CANCEL_RULE} Confirmation et rappel arrivent par e-mail.` },
  ]

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", url: "/" },
            { name: "Liste d'attente", url: "/liste-attente" },
          ]),
          faqLd(FAQ),
        ]}
      />
      <PageShell
        title="Rejoignez la liste d'attente Rezervy"
        crumb="Liste d'attente"
        maxWidth={960}
        subtitle="Rezervy est la plateforme de réservation beauté en Tunisie : trouvez un salon, comparez et réservez en ligne. Nous ouvrons ville par ville — inscrivez-vous pour être prévenu(e) dès que de nouveaux salons arrivent près de chez vous."
      >
        {/* The sign-up first: it is what the page is for. */}
        <section aria-labelledby="la-form" style={{ background: "var(--inverse-bg)", border: "1px solid var(--inverse-line)", borderRadius: 20, padding: "26px 26px 22px", color: "#FFFFFF" }}>
          <h2 id="la-form" className="serif" style={{ fontSize: 22, fontWeight: 400, margin: 0 }}>Être prévenu(e) en premier</h2>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.9)", lineHeight: 1.65, margin: "8px 0 16px", maxWidth: 560 }}>
            Nouveaux salons, nouvelles villes et nouveautés du site — un e-mail de temps en temps, jamais de spam.
          </p>
          <div style={{ maxWidth: 520 }}>
            <NewsletterForm source="waitlist_page" tone="dark" />
          </div>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, margin: "12px 0 0" }}>
            Un lien de confirmation vous est envoyé par e-mail. Désinscription en un clic à tout moment.{" "}
            <Link href="/confidentialite" style={{ color: "#FFFFFF", fontWeight: 700, textDecoration: "underline" }}>Vos données</Link>
          </p>
        </section>

        <h2 className="serif" style={{ fontSize: 21, fontWeight: 400, margin: "36px 0 12px" }}>Rezervy, comment ça marche ?</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {FEATURES.map((f) => (
            <div key={f.t} style={card}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: "var(--gold-dark)", margin: 0 }}>{f.t}</h3>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, margin: "6px 0 0" }}>{f.d}</p>
            </div>
          ))}
        </div>

        <h2 className="serif" style={{ fontSize: 21, fontWeight: 400, margin: "36px 0 12px" }}>Où en est Rezervy ?</h2>
        <div style={card}>
          {open.length ? (
            <>
              <p style={{ fontSize: 14, color: "var(--muted-2)", lineHeight: 1.75, margin: 0 }}>
                Aujourd&apos;hui, <b style={{ color: "var(--ink)" }}>{salons} salon{salons > 1 ? "s" : ""}</b> accepte{salons > 1 ? "nt" : ""} les
                réservations en ligne dans {open.length > 1 ? `${open.length} villes` : "1 ville"}. D&apos;autres villes suivront :
                la liste d&apos;attente est le moyen de le savoir dès que c&apos;est le cas.
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                {open.map((c) => (
                  <Link key={c.slug} href={`/recherche/${c.slug}`} className="link-soft" style={{ fontSize: 12.5, fontWeight: 700, background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 999, padding: "6px 13px", color: "var(--ink)" }}>
                    Salons à {c.name} ({coverage.cities[c.slug]})
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p style={{ fontSize: 14, color: "var(--muted-2)", lineHeight: 1.75, margin: 0 }}>
              Les premiers salons arrivent bientôt. Inscrivez-vous pour être prévenu(e) de l&apos;ouverture dans votre ville.
            </p>
          )}
        </div>

        <h2 className="serif" style={{ fontSize: 21, fontWeight: 400, margin: "36px 0 12px" }}>Questions fréquentes</h2>
        <div style={{ display: "grid", gap: 10 }}>
          {FAQ.map(([q, a]) => (
            <div key={q} style={{ ...card, padding: "16px 20px" }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 800, margin: 0 }}>{q}</h3>
              <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7, margin: "6px 0 0" }}>{a}</p>
            </div>
          ))}
        </div>

        <div style={{ ...card, marginTop: 30, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Vous gérez un salon, un barbershop ou un spa ?</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, lineHeight: 1.6 }}>Recevez vos réservations en ligne et gérez votre agenda avec Rezervy Pro.</div>
          </div>
          <Link href="/devenir-partenaire" className="btn-gold" style={{ background: "var(--gold)", color: "var(--on-gold)", borderRadius: 12, padding: "12px 20px", fontWeight: 800, fontSize: 13, whiteSpace: "nowrap" }}>
            Devenir partenaire
          </Link>
        </div>
      </PageShell>
    </>
  )
}

import Link from "next/link"
import { notFound } from "next/navigation"
import Photo from "@/components/Photo"
import FavButton from "@/components/FavButton"
import JsonLd from "@/components/JsonLd"
import { salonLd, breadcrumbLd } from "@/lib/jsonld"
import { salonSlugs, getSalon, getCategory, flatServices } from "@/lib/data"
import { SITE } from "@/lib/site"

export async function generateStaticParams() {
  return (await salonSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const s = await getSalon(slug)
  if (!s) return {}
  const title = `${s.name} à ${s.city} — réserver en ligne`
  const description = `${s.desc} ★ ${s.rate} (${s.rev} avis). Réservez ${s.kind.toLowerCase()} en ligne, dès ${s.from} TND. ${s.address}, ${s.city}.`
  return {
    title,
    description,
    alternates: { canonical: `/salon/${s.slug}` },
    openGraph: { type: "website", title: `${title} · ${SITE.name}`, description, url: `${SITE.url}/salon/${s.slug}` },
  }
}

const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n)

const SideCard = ({ children }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18 }}>{children}</div>
)

export default async function SalonPage({ params }) {
  const { slug } = await params
  const s = await getSalon(slug)
  if (!s) notFound()
  const cat = await getCategory(s.primary)
  const flat = flatServices(s)

  return (
    <>
      <JsonLd
        data={[
          salonLd(s, cat),
          breadcrumbLd([
            { name: "Accueil", url: "/" },
            { name: cat.name, url: `/${cat.slug}` },
            { name: s.city, url: `/${cat.slug}/${s.citySlug}` },
            { name: s.name, url: `/salon/${s.slug}` },
          ]),
        ]}
      />

      <div style={{ height: 230, background: "linear-gradient(115deg,#3A2B1A,#6B4E2E 55%,#2A1F12)" }} />
      <div className="wrap" style={{ margin: "-54px auto 0", padding: "0 24px 60px" }}>
        {/* Header card */}
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: "22px 24px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", boxShadow: "0 18px 44px var(--line-2)" }}>
          <div className="serif" style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#D4A874,var(--gold))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#2A1A08", flex: "none" }}>{s.ini}</div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="serif" style={{ fontSize: 26, margin: 0, fontWeight: 400 }}>{s.name}</h1>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "var(--muted)", marginTop: 5 }}>
              <span style={{ fontWeight: 800, color: "var(--gold-dark)" }}>★ {s.rate} <span style={{ fontWeight: 600, color: "var(--muted)" }}>({s.rev} avis)</span></span>
              <span>{s.address}, {s.city}</span>
              <span style={{ color: "var(--green)", fontWeight: 700 }}>Réservation en ligne 24h/24</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flex: "none", flexWrap: "wrap" }}>
            <FavButton slug={s.slug} variant="button" />
            <Link href={`/salon/${s.slug}/reserver`} className="btn-gold" style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 12, padding: "13px 26px", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", flex: "none" }}>Réserver</Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22, marginTop: 22, alignItems: "start" }}>
          {/* Left */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
              {["Salle principale", "Espace spa", "Réalisations"].map((l, i) => (
                <div key={i} style={{ height: 180, borderRadius: 14, overflow: "hidden", position: "relative" }}>
                  <Photo label={`${s.name} — ${l}`} />
                  {i === 2 && <span style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.45)", color: "#FDF8EF", fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 10px" }}>+9 photos</span>}
                </div>
              ))}
            </div>

            <div>
              <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>Services</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {s.serviceGroups.map((g) => (
                  <div key={g.cat} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "12px 18px", fontWeight: 800, borderBottom: "1px solid var(--line-soft)", color: "var(--gold-dark)", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: 11.5 }}>{g.cat}</div>
                    {g.rows.map((sv) => {
                      const gi = flat.findIndex((f) => f.n === sv.n && f.cat === g.cat)
                      return (
                        <div key={sv.n} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{sv.n}</div>
                            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>{sv.d}</div>
                          </div>
                          <div style={{ fontWeight: 800, fontSize: 13.5 }}>{sv.p} <span style={{ fontSize: 10.5, color: "var(--gold)" }}>TND</span></div>
                          <Link href={`/salon/${s.slug}/reserver?svc=${gi}`} className="btn-outline" style={{ background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "8px 16px", fontWeight: 800, fontSize: 12, whiteSpace: "nowrap", flex: "none" }}>Réserver</Link>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>L'équipe</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {s.team.map((tm) => (
                  <div key={tm.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: tm.c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#2A1A08" }}>{tm.ini}</div>
                    <div><div style={{ fontWeight: 700, fontSize: 13 }}>{tm.n}</div><div style={{ fontSize: 11.5, color: "var(--muted)" }}>{tm.r}</div></div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>Avis clients</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {s.reviews.map((rv, i) => (
                  <div key={i} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{rv.n}</div>
                      <div style={{ fontSize: 12, color: "var(--amber)", letterSpacing: 2 }}>{stars(rv.starsNum)}</div>
                      <div style={{ flex: 1 }} />
                      <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{rv.date}</div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.65, marginTop: 7 }}>{rv.txt}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SideCard>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 10 }}>Horaires</div>
              {s.hours.map((ho) => (
                <div key={ho.d} style={{ display: "flex", fontSize: 12.5, padding: "5px 0" }}>
                  <div style={{ color: "var(--muted)", width: 90 }}>{ho.d}</div>
                  <div style={{ fontWeight: 600, color: ho.c }}>{ho.h}</div>
                </div>
              ))}
            </SideCard>
            <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>Bon à savoir</div>
              {["Confirmation instantanée par SMS", "Acompte en ligne — Flouci, e-Dinar, carte", "Annulation gratuite jusqu'à 24h avant", "Liste d'attente si le salon est complet"].map((t) => (
                <div key={t} style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 12.5, color: "var(--muted-2)" }}>
                  <span style={{ color: "var(--green)", fontWeight: 800 }}>✓</span>{t}
                </div>
              ))}
            </div>
            <SideCard>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 8 }}>Contact</div>
              <div style={{ fontSize: 12.5, color: "var(--muted-2)", lineHeight: 1.8 }}>
                {s.address}, {s.city}<br />
                {s.phone}<br />
                <a href={`https://instagram.com/${s.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">{s.instagram}</a>
              </div>
            </SideCard>
          </div>
        </div>
      </div>
    </>
  )
}

import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import FavButton from "@/components/FavButton"
import JsonLd from "@/components/JsonLd"
import SalonMedia from "@/components/salon/SalonMedia"
import ServiceGroups from "@/components/salon/ServiceGroups"
import SalonMap from "@/components/salon/SalonMap"
import SalonReviews from "@/components/salon/SalonReviews"
import { salonLd, breadcrumbLd } from "@/lib/jsonld"
import { salonSlugs, getSalon, getCategory } from "@/lib/data"
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

const SideCard = ({ children }) => (
  <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: 18 }}>{children}</div>
)

export default async function SalonPage({ params }) {
  const { slug } = await params
  const s = await getSalon(slug)
  if (!s) notFound()
  const cat = await getCategory(s.primary)

  const packages = s.packages ?? []
  const reviews = s.reviews ?? []
  const gallery = s.gallery ?? []

  return (
    <>
      <JsonLd
        data={[
          salonLd(s, cat),
          // A salon can be published before it is filed under a category —
          // the trail just skips those crumbs rather than breaking the page.
          breadcrumbLd([
            { name: "Accueil", url: "/" },
            ...(cat ? [{ name: cat.name, url: `/${cat.slug}` }] : []),
            ...(cat && s.citySlug ? [{ name: s.city, url: `/${cat.slug}/${s.citySlug}` }] : []),
            { name: s.name, url: `/salon/${s.slug}` },
          ]),
        ]}
      />

      <div className="wrap" style={{ margin: "0 auto", padding: "22px 24px 60px" }}>
        {/* Photos, full width. No cover? the gallery carries the block alone. */}
        <SalonMedia name={s.name} cover={s.cover} gallery={gallery} />

        {/* Header */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 20,
            padding: "22px 24px",
            display: "flex",
            gap: 18,
            alignItems: "center",
            flexWrap: "wrap",
            boxShadow: "0 18px 44px var(--line-2)",
            marginTop: 18,
          }}
        >
          {s.logo ? (
            <div style={{ position: "relative", width: 72, height: 72, borderRadius: 20, overflow: "hidden", flex: "none", background: "var(--line-2)" }}>
              <Image src={s.logo} alt={`${s.name} — logo`} fill sizes="72px" style={{ objectFit: "cover" }} />
            </div>
          ) : (
            <div
              className="serif"
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: "linear-gradient(135deg,#D4A874,var(--gold))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                color: "#2A1A08",
                flex: "none",
              }}
            >
              {s.ini}
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="serif" style={{ fontSize: 26, margin: 0, fontWeight: 400 }}>{s.name}</h1>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "var(--muted)", marginTop: 5 }}>
              <span>{s.address}, {s.city}</span>
              <span style={{ color: "var(--green)", fontWeight: 700 }}>Réservation en ligne 24h/24</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flex: "none", flexWrap: "wrap", alignItems: "center" }}>
            <FavButton slug={s.slug} variant="button" />
            <Link
              href={`/salon/${s.slug}/reserver`}
              className="btn-gold"
              style={{ background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 12, padding: "13px 26px", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", flex: "none" }}
            >
              Réserver
            </Link>
          </div>
        </div>

        {/* Forfaits — what the salon wants to push, so they lead. */}
        {packages.length > 0 && (
          <div style={{ marginTop: 22 }}>
            <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>Forfaits</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
              {packages.map((pk) => (
                <div
                  key={pk.id}
                  style={{
                    background: pk.featured ? "linear-gradient(160deg,rgba(169,124,72,0.13),var(--card) 60%)" : "var(--card)",
                    border: `1px solid ${pk.featured ? "rgba(169,124,72,0.5)" : "var(--line)"}`,
                    borderRadius: 16,
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{pk.n}</div>
                    {pk.featured && (
                      <span style={{ background: "var(--gold)", color: "#FDF8EF", fontSize: 10, fontWeight: 800, borderRadius: 999, padding: "3px 9px", letterSpacing: "0.04em" }}>
                        RECOMMANDÉ
                      </span>
                    )}
                  </div>
                  {pk.desc && <div style={{ fontSize: 12.5, color: "var(--muted-2)", lineHeight: 1.6 }}>{pk.desc}</div>}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto", paddingTop: 6 }}>
                    <span style={{ fontWeight: 800, fontSize: 20 }}>{pk.p}</span>
                    <span style={{ fontSize: 11, color: "var(--gold)" }}>TND</span>
                    {pk.was != null && pk.was > pk.p && (
                      <span style={{ fontSize: 12.5, color: "var(--faint)", textDecoration: "line-through" }}>{pk.was} TND</span>
                    )}
                  </div>
                  <Link
                    href={`/salon/${s.slug}/reserver?pack=${pk.id}`}
                    className="btn-outline"
                    style={{ border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "9px 16px", fontWeight: 800, fontSize: 12.5, textAlign: "center" }}
                  >
                    Réserver ce forfait
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22, marginTop: 22, alignItems: "start" }}>
          {/* Left */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>Services</div>
              <ServiceGroups slug={s.slug} groups={s.serviceGroups} />
            </div>

            {s.team?.length > 0 && (
              <div>
                <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>L&apos;équipe</div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {s.team.map((tm) => (
                    <div key={tm.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 11 }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: tm.c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#2A1A08" }}>{tm.ini}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{tm.n}</div>
                        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{tm.r}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SalonReviews ratings={s.ratings} reviews={reviews} />

            <SideCard>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 10 }}>Horaires</div>
              {s.hours.map((ho) => (
                <div key={ho.d} style={{ display: "flex", fontSize: 12.5, padding: "5px 0" }}>
                  <div style={{ color: "var(--muted)", width: 90 }}>{ho.d}</div>
                  <div style={{ fontWeight: 600, color: ho.c }}>{ho.h}</div>
                </div>
              ))}
            </SideCard>

            <SideCard>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 12 }}>Contact</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {s.phone && (
                  <a
                    href={`tel:${s.phone.replace(/\s/g, "")}`}
                    style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--gold)", color: "#FDF8EF", borderRadius: 12, padding: "11px 16px", fontWeight: 800, fontSize: 13 }}
                  >
                    <span aria-hidden="true">✆</span>
                    <span>Appeler</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontWeight: 600, fontSize: 12.5, opacity: 0.9 }}>{s.phone}</span>
                  </a>
                )}
                {s.email && (
                  <a
                    href={`mailto:${s.email}`}
                    style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 12, padding: "11px 16px", fontWeight: 800, fontSize: 13 }}
                  >
                    <span aria-hidden="true">✉</span>
                    <span>Envoyer un e-mail</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontWeight: 600, fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{s.email}</span>
                  </a>
                )}
                {s.instagram && (
                  <a
                    href={`https://instagram.com/${s.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12.5, color: "var(--gold-dark)", fontWeight: 700, padding: "2px 2px 0" }}
                  >
                    {s.instagram}
                  </a>
                )}
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12.5, color: "var(--gold-dark)", fontWeight: 700, padding: "0 2px" }}
                  >
                    Site web
                  </a>
                )}
              </div>
            </SideCard>

            {s.geo && (
              <SideCard>
                <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 10 }}>Où nous trouver</div>
                <SalonMap lat={s.geo.lat} lng={s.geo.lng} name={s.name} address={[s.address, s.city].filter(Boolean).join(", ")} />
              </SideCard>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

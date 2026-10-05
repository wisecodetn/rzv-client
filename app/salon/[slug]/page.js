import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import FavButton from "@/components/FavButton"
import JsonLd from "@/components/JsonLd"
import SalonMedia from "@/components/salon/SalonMedia"
import ServiceGroups from "@/components/salon/ServiceGroups"
import SalonMap from "@/components/salon/SalonMap"
import { socialLinks, socialHandle } from "@/lib/social"
import SalonContent from "@/components/salon/SalonContent"
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
  const description = `${s.name} ★ ${s.rate} (${s.rev} avis). Réservez ${s.kind.toLowerCase()} en ligne, dès ${s.from} TND. ${s.city}.`
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

/** Three glyphs, inline — a brand icon pack for this is not worth a dependency. */
function SocialIcon({ name }) {
  const common = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", style: { flex: "none", color: "var(--gold-dark)" } }
  if (name === "instagram") {
    return (
      <svg {...common} aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </svg>
    )
  }
  if (name === "facebook") {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v4H8v7h4v-7h3l.5-4H12V7.5A.5.5 0 0 1 12.5 7H15z" />
      </svg>
    )
  }
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.8 9h18.4 M2.8 15h18.4 M12 2.6c2.4 2.6 3.6 5.8 3.6 9.4S14.4 18.8 12 21.4c-2.4-2.6-3.6-5.8-3.6-9.4S9.6 5.2 12 2.6z" />
    </svg>
  )
}

export default async function SalonPage({ params }) {
  const { slug } = await params
  const s = await getSalon(slug)
  if (!s) notFound()
  const cat = await getCategory(s.primary)
  const packages = s.packages ?? []
  const reviews = s.reviews ?? []
  const gallery = s.gallery ?? []
  /** "Sousse Jaouhara, Sousse" — omitting whichever part the salon left blank. */
  const where = [s.address, s.city].filter(Boolean).join(", ")
  const social = socialLinks(s)

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
          className="salon-head"
        >
          {/* Only a real logo earns a place; an initials tile fills the gap
              without telling the visitor anything. */}
          {s.logo && (
            <div style={{ position: "relative", width: 72, height: 72, borderRadius: 20, overflow: "hidden", flex: "none", background: "var(--line-2)" }}>
              <Image src={s.logo} alt={`${s.name} — logo`} fill sizes="72px" style={{ objectFit: "cover" }} />
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 className="serif" style={{ fontSize: 26, margin: 0, fontWeight: 400 }}>{s.name}</h1>
            {/* Address and phone, each only when the salon has given it — a
                slogan here told the visitor nothing they could act on. */}
            {(where || s.phone) && (
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12.5, color: "var(--muted)", marginTop: 5 }}>
                {where && <span>{where}</span>}
                {s.phone && (
                  <a href={`tel:${s.phone.replace(/\s/g, "")}`} style={{ color: "var(--gold-dark)", fontWeight: 700 }}>
                    {s.phone}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="salon-head-actions" style={{ display: "flex", gap: 10, flex: "none", flexWrap: "wrap", alignItems: "center" }}>
            <FavButton slug={s.slug} variant="button" />
            <Link
              href={`/salon/${s.slug}/reserver`}
              className="btn-gold"
              style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 12, padding: "13px 26px", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", flex: "none" }}
            >
              Réserver
            </Link>
          </div>
        </div>

        {s.desc && (
          <div
            style={{
              marginTop: 18,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: "20px 22px",
            }}
          >
            <div className="serif" style={{ fontSize: 18, marginBottom: 10 }}>
              À propos
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {s.desc
                .split(/\n\s*\n/) // split on blank lines → paragraphs
                .map((p) => p.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p key={i} style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: "var(--muted-2)" }}>
                    {para.split("\n").map((line, j, arr) => (
                      <span key={j}>
                        {line}
                        {j < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                ))}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 22, marginTop: 22, alignItems: "start" }}>
          {/* Left */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>Choix de prestations</div>
              <ServiceGroups slug={s.slug} groups={s.serviceGroups} />
            </div>

            {/* The salon's packages, presented exactly like its services and
                straight after them — a package is just another prestation. */}
            {packages.length > 0 && (
              <div>
                <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>Forfaits</div>
                <ServiceGroups
                  slug={s.slug}
                  groups={[
                    {
                      cat: null,
                      rows: packages.map((pk) => ({
                        id: pk.id,
                        n: pk.n,
                        // Same subline as a service — its duration — plus what it
                        // actually contains, which is the point of a forfait.
                        d: [pk.d, (pk.services ?? []).map((x) => x.n).join(" + ")].filter(Boolean).join(" · "),
                        desc: pk.desc,
                        p: pk.p,
                        was: pk.was,
                        featured: pk.featured,
                        href: `/salon/${s.slug}/reserver?pack=${encodeURIComponent(pk.id)}`,
                      })),
                    },
                  ]}
                />
              </div>
            )}

            {s.team?.length > 0 && (
              <div>
                <div className="serif" style={{ fontSize: 20, marginBottom: 12 }}>L&apos;équipe</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
                  {s.team.map((tm) => (
                    <div key={tm.id} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "12px 14px", display: "flex", alignItems: "center", gap: 11, minWidth: 0 }}>
                      <div style={{ width: 38, height: 38, flex: "none", borderRadius: "50%", background: tm.c, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#111111" }}>{tm.ini}</div>
                      <div style={{ minWidth: 0 }}>
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
                    style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--gold)", color: "var(--on-gold)", borderRadius: 12, padding: "11px 16px", fontWeight: 800, fontSize: 13 }}
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
                    style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--accent-line)", color: "var(--gold-dark)", borderRadius: 12, padding: "11px 16px", fontWeight: 800, fontSize: 13 }}
                  >
                    <span aria-hidden="true">✉</span>
                    <span>Envoyer un e-mail</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontWeight: 600, fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{s.email}</span>
                  </a>
                )}
                {/* Instagram, Facebook and the website — each a real external
                    link, labelled, with the handle shown so it is obvious where
                    it goes. Facebook used not to be rendered at all. */}
                {social.length > 0 && (
                  <div style={{ display: "grid", gap: 7, marginTop: 2 }}>
                    {social.map((link) => (
                      <a
                        key={link.key}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${link.label} — ouvre un nouvel onglet`}
                        style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--line-2)", borderRadius: 12, padding: "10px 14px", color: "var(--ink)", fontWeight: 700, fontSize: 12.5 }}
                      >
                        <SocialIcon name={link.key} />
                        <span>{link.label}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontWeight: 600, fontSize: 12, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
                          {socialHandle(link)}
                        </span>
                        <span aria-hidden="true" style={{ color: "var(--muted)", fontSize: 12 }}>↗</span>
                      </a>
                    ))}
                  </div>
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

        {/* Long-form copy, last: it serves search more than the visitor, so it
            sits below everything that leads to a booking. */}
        <SalonContent html={s.content} name={s.name} />

        {/* Phones & tablets: the booking action stays in reach while scrolling. */}
        <div className="salon-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 14, maxWidth: 640, margin: "0 auto" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
              {s.from != null && <div style={{ fontSize: 12.5, color: "var(--muted)" }}>dès <b style={{ color: "var(--ink)" }}>{s.from} TND</b></div>}
            </div>
            <Link
              href={`/salon/${s.slug}/reserver`}
              className="btn-gold"
              style={{ background: "var(--gold)", color: "var(--on-gold)", borderRadius: 12, padding: "13px 28px", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap", flex: "none" }}
            >
              Réserver
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

import Link from "next/link"
import Photo from "@/components/Photo"
import { SITE } from "@/lib/site"
import { getPosts, catLabel, formatDate } from "@/lib/blog"
import PostCover from "@/components/blog/PostCover"

export const metadata = {
  title: "Le blog beauté",
  description: "Conseils coiffure, barbier, onglerie et spa : guides pratiques, tendances et astuces de nos expert·e·s partenaires en Tunisie.",
  alternates: { canonical: "/blog" },
  openGraph: { title: `Le blog beauté · ${SITE.name}`, description: "Conseils coiffure, barbier, onglerie et spa en Tunisie.", url: `${SITE.url}/blog` },
}

const chip = { fontSize: 11, fontWeight: 800, color: "var(--gold-dark)", background: "rgba(124,77,255,0.12)", borderRadius: 999, padding: "4px 10px", letterSpacing: "0.03em", textTransform: "uppercase" }

export default async function BlogPage() {
  const posts = await getPosts()
  const [lead, ...rest] = posts

  return (
    <div className="wrap" style={{ padding: "30px 24px 60px" }}>
      <nav style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Accueil</Link>
        <span>/</span>
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>Blog</span>
      </nav>
      <h1 className="serif" style={{ fontSize: 32, marginTop: 12, marginBottom: 0, fontWeight: 400 }}>Le blog beauté</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8, maxWidth: 620, lineHeight: 1.65 }}>
        Conseils, tendances et guides pratiques autour de la coiffure, du barbier, de l'onglerie et du spa — par nos expert·e·s partenaires.
      </p>

      {!posts.length && (
        <div style={{ marginTop: 26, padding: "40px 24px", textAlign: "center", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, color: "var(--muted)", fontSize: 14 }}>
          Aucun article pour le moment — revenez bientôt.
        </div>
      )}

      {/* Featured post */}
      {lead && (
      <Link href={`/blog/${lead.slug}`} className="card-hover" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: 0, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, overflow: "hidden", marginTop: 22, color: "var(--ink)" }}>
        <div style={{ position: "relative", minHeight: 240 }}><PostCover post={lead} sizes="(max-width: 780px) 100vw, 55vw" /></div>
        <div style={{ padding: "26px 28px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <span style={chip}>{catLabel(lead)}</span>
          <div className="serif" style={{ fontSize: 24, marginTop: 12, lineHeight: 1.25 }}>{lead.title}</div>
          <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7, marginTop: 10 }}>{lead.excerpt}</p>
          <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 14 }}>{formatDate(lead.date)} · {lead.readMins} min de lecture</div>
        </div>
      </Link>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20, marginTop: 22 }}>
        {rest.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card-hover" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", display: "block", color: "var(--ink)" }}>
            <div style={{ height: 160, position: "relative" }}><PostCover post={p} sizes="(max-width: 780px) 100vw, 300px" /></div>
            <div style={{ padding: "16px 18px" }}>
              <span style={chip}>{catLabel(p)}</span>
              <div className="serif" style={{ fontSize: 17.5, marginTop: 10, lineHeight: 1.3 }}>{p.title}</div>
              <p style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.65, marginTop: 8 }}>{p.excerpt}</p>
              <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 12 }}>{formatDate(p.date)} · {p.readMins} min</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

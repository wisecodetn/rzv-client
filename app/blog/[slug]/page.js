import Link from "next/link"
import { notFound } from "next/navigation"
import Photo from "@/components/Photo"
import JsonLd from "@/components/JsonLd"
import { breadcrumbLd } from "@/lib/jsonld"
import { SITE, abs } from "@/lib/site"
import { getPosts, getPost, getPostSlugs, catLabel, catHref, formatDate } from "@/lib/blog"
import PostCover from "@/components/blog/PostCover"

export async function generateStaticParams() {
  return (await getPostSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const p = await getPost(slug)
  if (!p) return {}
  return {
    title: p.metaTitle || p.title,
    description: p.metaDescription || p.excerpt,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: `${p.title} · ${SITE.name}`, description: p.excerpt, url: `${SITE.url}/blog/${p.slug}`, publishedTime: p.date },
  }
}

const chip = { fontSize: 11, fontWeight: 800, color: "var(--gold-dark)", background: "rgba(169,124,72,0.12)", borderRadius: 999, padding: "4px 10px", letterSpacing: "0.03em", textTransform: "uppercase" }

export default async function BlogPost({ params }) {
  const { slug } = await params
  const p = await getPost(slug)
  if (!p) notFound()
  const all = await getPosts()
  // Prefer articles sharing a category; fall back to anything else recent.
  const mine = new Set((p.categories ?? []).map((c) => c.slug))
  const related = all.filter((x) => x.slug !== p.slug && (x.categories ?? []).some((c) => mine.has(c.slug)))
  const more = (related.length ? related : all.filter((x) => x.slug !== p.slug)).slice(0, 3)

  return (
    <article className="wrap" style={{ padding: "30px 24px 60px", maxWidth: 820 }}>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Accueil", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: p.title, url: `/blog/${p.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": abs(`/blog/${p.slug}#post`),
            headline: p.title,
            description: p.excerpt,
            datePublished: p.date,
            dateModified: p.date,
            author: { "@type": "Person", name: p.author.name },
            publisher: { "@id": abs("/#organization") },
            mainEntityOfPage: abs(`/blog/${p.slug}`),
            articleSection: catLabel(p),
          },
        ]}
      />

      <nav style={{ fontSize: 12, color: "var(--muted)", display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Accueil</Link>
        <span>/</span>
        <Link href="/blog" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>Blog</Link>
        <span>/</span>
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{catLabel(p)}</span>
      </nav>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        {(p.categories ?? []).map((c) => (
          <Link key={c.slug} href={`/${c.slug}`} style={{ ...chip, display: "inline-block" }}>{c.name}</Link>
        ))}
      </div>
      <h1 className="serif" style={{ fontSize: 34, marginTop: 12, marginBottom: 0, fontWeight: 400, lineHeight: 1.2 }}>{p.title}</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}>
        <span style={{ fontWeight: 700, color: "var(--ink)" }}>{p.author.name}</span>
        {p.author?.role && <span>· {p.author.role}</span>}
        <span style={{ flex: 1 }} />
        <span>{formatDate(p.date)} · {p.readMins} min</span>
      </div>

      <div style={{ height: 300, borderRadius: 18, overflow: "hidden", marginTop: 20, position: "relative" }}>
        <PostCover post={p} sizes="(max-width: 860px) 100vw, 820px" eager />
      </div>

      <div
        className="post-body"
        style={{ marginTop: 26, fontSize: 15.5, lineHeight: 1.8, color: "var(--ink-2, var(--ink))" }}
        // Sanitised on write by the API — never rendered from untrusted input.
        dangerouslySetInnerHTML={{ __html: p.content }}
      />

      {/* Book CTA */}
      <div style={{ background: "linear-gradient(140deg,#3A2B1A,#6B4E2E)", borderRadius: 18, padding: "24px 26px", marginTop: 32, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ minWidth: 220, flex: 1 }}>
          <div className="serif" style={{ fontSize: 20, color: "#F8F0E2" }}>Envie de passer à l'action ?</div>
          <div style={{ fontSize: 13, color: "#D9BE97", marginTop: 6 }}>Réservez un salon de {catLabel(p).toLowerCase()} près de chez vous, en ligne et en 30 secondes.</div>
        </div>
        <Link href={catHref(p)} className="btn-gold" style={{ background: "var(--gold-light)", color: "#2A1A08", borderRadius: 12, padding: "13px 22px", fontWeight: 800, fontSize: 13.5, whiteSpace: "nowrap" }}>Voir les salons</Link>
      </div>

      {/* More posts */}
      {more.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <div className="serif" style={{ fontSize: 20 }}>À lire aussi</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16, marginTop: 14 }}>
            {more.map((m) => (
              <Link key={m.slug} href={`/blog/${m.slug}`} className="card-hover" style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden", display: "block", color: "var(--ink)" }}>
                <div style={{ height: 120, position: "relative" }}><PostCover post={m} sizes="220px" /></div>
                <div style={{ padding: "12px 14px" }}>
                  <div className="serif" style={{ fontSize: 15, lineHeight: 1.3 }}>{m.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 8 }}>{formatDate(m.date)} · {m.readMins} min</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

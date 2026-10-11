import Link from "@/components/Link"
import PageShell from "@/components/PageShell"
import JsonLd from "@/components/JsonLd"
import FaqAccordion from "@/components/FaqAccordion"
import { breadcrumbLd, faqLd } from "@/lib/jsonld"

/**
 * A long-form information page (zones, glossary, legal notice, partner
 * guides…): title, an optional "bientôt" badge, sections of paragraphs and
 * lists, an optional FAQ and closing links. Its structured data says what the
 * page shows: a breadcrumb, and an FAQPage when there are questions.
 *
 * Sections: { h, p?: string[], list?: string[], ordered?: boolean, dl?: [term, def, href?][], node?: ReactNode }.
 * Plain strings only — the copy is ours, written in code.
 */
export default function InfoPage({ title, subtitle, path, crumb, soon, sections = [], faq = [], faqTitle, ctas = [], children }) {
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Accueil", url: "/" }, { name: crumb || title, url: path }]), ...(faq.length ? [faqLd(faq)] : [])]} />
      <PageShell title={title} subtitle={subtitle} crumb={crumb} maxWidth={920}>
        {soon && (
          <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 16, padding: "16px 20px", marginBottom: 8, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ flex: "none", fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 11px", background: "var(--accent-soft)", color: "var(--gold-dark)", letterSpacing: "0.03em", textTransform: "uppercase" }}>
              Bientôt disponible
            </span>
            <div style={{ fontSize: 13.5, color: "var(--muted-2)", lineHeight: 1.65 }}>{soon}</div>
          </div>
        )}

        {sections.map((s, i) => (
          <section key={i} style={{ marginTop: i === 0 && !soon ? 0 : 28 }}>
            {s.h && <h2 className="serif" style={{ fontSize: 20, margin: "0 0 10px", fontWeight: 400 }}>{s.h}</h2>}
            {(s.p || []).map((t, k) => (
              <p key={k} style={{ fontSize: 14, color: "var(--muted-2)", lineHeight: 1.8, margin: "0 0 10px" }}>{t}</p>
            ))}
            {s.list?.length > 0 &&
              (s.ordered ? (
                <ol style={{ margin: "4px 0 10px", paddingLeft: 22, fontSize: 14, color: "var(--muted-2)", lineHeight: 1.8 }}>
                  {s.list.map((t, k) => <li key={k}>{t}</li>)}
                </ol>
              ) : (
                <ul style={{ margin: "4px 0 10px", paddingLeft: 22, fontSize: 14, color: "var(--muted-2)", lineHeight: 1.8 }}>
                  {s.list.map((t, k) => <li key={k}>{t}</li>)}
                </ul>
              ))}
            {s.dl?.length > 0 && (
              <dl style={{ margin: "4px 0 10px", display: "grid", gap: 12 }}>
                {s.dl.map(([term, def, href]) => (
                  <div key={term} style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px" }}>
                    <dt style={{ fontWeight: 800, fontSize: 14, color: "var(--ink)" }}>
                      {href ? <Link href={href} style={{ color: "var(--ink)" }}>{term}</Link> : term}
                    </dt>
                    <dd style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--muted-2)", lineHeight: 1.7 }}>{def}</dd>
                  </div>
                ))}
              </dl>
            )}
            {s.node}
          </section>
        ))}

        {children}

        {faq.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 className="serif" style={{ fontSize: 20, margin: "0 0 12px", fontWeight: 400 }}>{faqTitle || "Questions fréquentes"}</h2>
            <FaqAccordion faqs={faq} />
          </section>
        )}

        {ctas.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 30, flexWrap: "wrap" }}>
            {ctas.map((c, i) => (
              <Link
                key={c.href}
                href={c.href}
                className={i === 0 ? "btn-gold" : "btn-outline"}
                style={
                  i === 0
                    ? { background: "var(--gold)", color: "var(--on-gold)", borderRadius: 12, padding: "12px 22px", fontWeight: 800, fontSize: 13.5 }
                    : { background: "transparent", border: "1px solid var(--accent-line)", color: "var(--gold-dark)", borderRadius: 12, padding: "12px 22px", fontWeight: 800, fontSize: 13.5 }
                }
              >
                {c.label}
              </Link>
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}

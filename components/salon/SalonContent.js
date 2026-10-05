import { demoteHeadings, sanitizeRichHtml } from "@/lib/rich-html"
import Expandable from "./Expandable"

/**
 * The salon's "contenu détaillé", last on the page.
 *
 * It exists for search engines as much as for readers, which is exactly why it
 * sits at the bottom: it is the long-form copy, not the thing a visitor came
 * for. The booking path stays above it.
 *
 * The page already has one `h1` (the salon's name), so anything the salon wrote
 * as `h1` is demoted — two `h1`s on a page muddles the very ranking this block
 * is here to earn. The HTML is also sanitised: it is salon-authored and lands in
 * `dangerouslySetInnerHTML`.
 */
export default function SalonContent({ html, name }) {
  const safe = sanitizeRichHtml(demoteHeadings(html))
  if (!safe) return null

  return (
    <section
      aria-label={`À propos de ${name}`}
      style={{ marginTop: 28, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: "22px 24px" }}
    >
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px" }}>À propos de {name}</h2>
      <Expandable>
        <div className="rich" dangerouslySetInnerHTML={{ __html: safe }} />
      </Expandable>
    </section>
  )
}

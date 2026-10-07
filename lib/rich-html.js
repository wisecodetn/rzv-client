/**
 * Salon-authored HTML, made safe to render and correct to rank.
 *
 * This copy is written in the pro app's rich editor and rendered with
 * `dangerouslySetInnerHTML`, so it is untrusted input on a public page: a script
 * tag or an `onerror` attribute reaching the browser would be stored XSS.
 *
 * The API cleans this HTML with a real parser (sanitize-html) on save and on
 * read — that is the primary defence. This small allow-list is the second
 * layer: the editor produces a handful of tags, and anything it does not
 * produce has no business on the page.
 */

/** Tags the editor can produce, and nothing else. */
const ALLOWED = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "ul", "ol", "li",
  "h2", "h3", "h4", "h5", "h6", "blockquote", "a",
])

/**
 * A page carries exactly one `h1` — the salon's name. Copy written with its own
 * `h1` is pushed down a level so the document outline stays sane; everything
 * below shifts with it rather than colliding.
 */
export function demoteHeadings(html) {
  if (!html) return ""
  return String(html)
    // Deepest first, so h2→h3 does not then become h4.
    .replace(/<(\/?)h5\b/gi, "<$1h6")
    .replace(/<(\/?)h4\b/gi, "<$1h5")
    .replace(/<(\/?)h3\b/gi, "<$1h4")
    .replace(/<(\/?)h2\b/gi, "<$1h3")
    .replace(/<(\/?)h1\b/gi, "<$1h2")
}

/**
 * Article headings start at h2, under the page's h1. A post whose first level
 * is h3 (the editor's "subtitle") jumped h1 → h3; everything is lifted so the
 * highest level used becomes h2, keeping the steps between levels.
 */
export function liftHeadings(html) {
  if (!html) return ""
  const levels = [...String(html).matchAll(/<h([1-6])\b/gi)].map((m) => Number(m[1]))
  if (!levels.length) return String(html)
  const shift = Math.min(...levels) - 2
  if (shift <= 0) return String(html)
  return String(html).replace(/<(\/?)h([1-6])\b/gi, (_, slash, n) => `<${slash}h${Math.max(2, Number(n) - shift)}`)
}

export function sanitizeRichHtml(html) {
  if (!html) return ""
  let out = String(html)

  // Whole elements whose content is executable or fetches something.
  out = out.replace(/<(script|style|iframe|object|embed|link|meta|svg)\b[\s\S]*?<\/\1\s*>/gi, "")
  out = out.replace(/<(script|style|iframe|object|embed|link|meta|svg)\b[^>]*\/?>/gi, "")

  // Every remaining tag: drop it unless allow-listed, and strip its attributes.
  // A `<` that does not open a complete tag is escaped: an unterminated
  // `<img onerror=… x=` would otherwise swallow the wrapper's next `</div` as an
  // attribute and close itself on its `>`, running the handler.
  out = out.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*)>|</g, (m, slash, tag, attrs) => {
    if (m === "<") return "&lt;"
    const name = tag.toLowerCase()
    if (!ALLOWED.has(name)) return ""
    if (slash) return `</${name}>`
    if (name !== "a") return `<${name}>`
    // A link keeps only a safe href, and always leaves the site in a new tab.
    const href = /\shref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs)
    const raw = (href?.[2] ?? href?.[3] ?? href?.[4] ?? "").trim()
    // A site path is fine; `//host` and `/\host` are other sites in disguise.
    if (!/^(https?:\/\/|mailto:|tel:|\/(?![\/\\]))/i.test(raw)) return "<a>"
    const safe = raw.replace(/"/g, "&quot;")
    return `<a href="${safe}" target="_blank" rel="nofollow noopener noreferrer">`
  })

  // Nothing left but whitespace and empty paragraphs = nothing to show. The pro
  // editor stores "<p></p>" for an empty document, which must not render a card.
  return out.replace(/<p>\s*(<br>\s*)*<\/p>/gi, "").trim() ? out.trim() : ""
}

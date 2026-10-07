// The XSS and redirect guards added by the audit (Phase 1). Each case is an
// attack that worked before the fix.
import { test } from "node:test"
import assert from "node:assert/strict"
import { serializeJsonLd } from "../lib/jsonld.js"
import { sanitizeRichHtml, demoteHeadings } from "../lib/rich-html.js"
import { safeNext } from "../lib/safe-next.js"

const BS = String.fromCharCode(92) // a backslash, without escaping games

test("JSON-LD: </script> in a review cannot close the tag", () => {
  const data = { reviewBody: "</script><script>alert(1)</script> & é   fin" }
  const out = serializeJsonLd(data)
  assert.ok(!out.includes("<"), "no raw <")
  assert.ok(!out.includes(">"), "no raw >")
  assert.ok(!out.includes(" "), "no raw line separator")
  assert.deepEqual(JSON.parse(out), data, "same data once parsed")
})

test("rich text: unterminated tag cannot smuggle an event handler", () => {
  const out = sanitizeRichHtml("<p>hi</p><img src=x onerror=alert(1) x=")
  assert.ok(!/<img/i.test(out))
  assert.ok(out.startsWith("<p>hi</p>"))
})

test("rich text: scripts, handlers and dangerous links are removed", () => {
  assert.equal(sanitizeRichHtml("<p>a</p><script>alert(1)</script>"), "<p>a</p>")
  assert.equal(sanitizeRichHtml('<p onclick="x()">y</p>'), "<p>y</p>")
  assert.equal(sanitizeRichHtml('<a href="javascript:alert(1)">x</a>'), "<a>x</a>")
  assert.equal(sanitizeRichHtml('<a href="//evil.com">x</a>'), "<a>x</a>")
  assert.equal(sanitizeRichHtml(`<a href="/${BS}evil.com">x</a>`), "<a>x</a>")
  assert.ok(sanitizeRichHtml("<!-- c --><p>x</p>").startsWith("&lt;!--"))
})

test("rich text: what the editor produces survives", () => {
  assert.equal(sanitizeRichHtml("<h2>Titre</h2><p>Texte <strong>gras</strong> 3 < 5</p>"), "<h2>Titre</h2><p>Texte <strong>gras</strong> 3 &lt; 5</p>")
  assert.match(sanitizeRichHtml('<a href="https://ok.tn">ok</a>'), /^<a href="https:\/\/ok\.tn" target="_blank" rel="nofollow noopener noreferrer">ok<\/a>$/)
  assert.equal(sanitizeRichHtml("<p></p>"), "", "an empty editor document renders nothing")
})

test("rich text: the salon name stays the only h1", () => {
  assert.equal(demoteHeadings("<h1>A</h1><h2>B</h2>"), "<h2>A</h2><h3>B</h3>")
})

test("safeNext: only paths on this site", () => {
  for (const bad of ["https://evil.com", "//evil.com", `/${BS}evil.com`, "javascript:alert(1)", " //evil.com", "/\t/evil.com", null, "", 42]) {
    assert.equal(safeNext(bad), "/compte", `refused: ${JSON.stringify(bad)}`)
  }
  assert.equal(safeNext("/salon/x/reserver?confirm=1"), "/salon/x/reserver?confirm=1")
  assert.equal(safeNext("/compte#rdv"), "/compte#rdv")
  assert.equal(safeNext("nope", "/"), "/", "custom fallback")
})

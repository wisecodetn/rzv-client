// Metadata and article markup rules from the re-audit: descriptions that fit a
// search result, and article headings that sit under the page's h1.
import { test } from "node:test"
import assert from "node:assert/strict"
import { clampDescription, pageMeta } from "../lib/meta.js"
import { liftHeadings } from "../lib/rich-html.js"

test("descriptions are cut at 160 characters, on a word, with an ellipsis", () => {
  const long = "Réservez un salon de coiffure à Mahdia : comparez 3 salons, prestations dès 15 TND, note moyenne 4,6/5. Confirmation par e-mail, annulation gratuite jusqu’au début du rendez-vous."
  const out = clampDescription(long)
  assert.ok(out.length <= 160, `${out.length} chars`)
  assert.ok(out.endsWith("…"))
  assert.ok(long.startsWith(out.slice(0, -1)), "a prefix of the original")
  assert.ok(!/\s…$/.test(out), "no dangling space")
  assert.equal(clampDescription("Court."), "Court.")
  assert.equal(clampDescription("  a \n b  "), "a b", "whitespace collapsed")
  assert.equal(clampDescription(""), undefined)
})

test("pageMeta uses the clamped description everywhere", () => {
  const m = pageMeta({ title: "T", description: "x ".repeat(200), path: "/t" })
  assert.ok(m.description.length <= 160)
  assert.equal(m.openGraph.description, m.description)
  assert.equal(m.twitter.description, m.description)
})

test("article headings are lifted so the first level is h2", () => {
  assert.equal(liftHeadings("<h3>A</h3><p>x</p><h4>B</h4>"), "<h2>A</h2><p>x</p><h3>B</h3>")
  assert.equal(liftHeadings("<h2>A</h2><h3>B</h3>"), "<h2>A</h2><h3>B</h3>", "already right")
  assert.equal(liftHeadings("<p>no heading</p>"), "<p>no heading</p>")
  assert.equal(liftHeadings('<h4 class="x">A</h4>'), '<h2 class="x">A</h2>', "attributes kept")
})

test("links in authored HTML get a title from their own words", async () => {
  const { titleLinks } = await import("../lib/rich-html.js")
  assert.equal(titleLinks('<p><a href="/coiffure">Les <b>salons</b></a></p>'), '<p><a href="/coiffure" title="Les salons">Les <b>salons</b></a></p>')
  assert.equal(titleLinks('<a href="/x" title="Mine">y</a>'), '<a href="/x" title="Mine">y</a>', "an author's title is kept")
  assert.equal(titleLinks('<a href="/x">say "hi"</a>'), '<a href="/x" title="say &quot;hi&quot;">say "hi"</a>', "quotes escaped")
})

test("site links take their title from their visible words", async () => {
  const { createElement: h } = await import("react")
  const { titleOf } = await import("../lib/link-title.js")
  assert.equal(titleOf(["Voir tout le blog →"]), "Voir tout le blog")
  assert.equal(titleOf(h("div", null, h("span", { "aria-hidden": true }, "C"), h("span", null, "Coiffure"))), "Coiffure", "hidden glyphs left out")
  assert.equal(titleOf(h("div", null, h("img", { alt: "Salon Nour" }))), "Salon Nour", "an image speaks through its alt")
})

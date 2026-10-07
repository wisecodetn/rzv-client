// proxy.js refuses unknown catalogue URLs before they render (and before an
// ISR 404 is written to disk). A wrong rule here either 404s real pages or
// lets the disk-filling URLs back in, so both directions are pinned.
import { test } from "node:test"
import assert from "node:assert/strict"
import { readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { isUnknown, STATIC_ROOTS } from "../proxy.js"

const T = {
  categories: new Set(["coiffure", "coiffure-femme", "brushing", "barbier"]),
  cities: new Set(["tunis", "sousse", "mahdia"]),
  salons: new Set(["wise-code", "maison-yasmine"]),
  posts: new Set(["guide-prix"]),
  pairPages: new Map([["coiffure|tunis", 3], ["coiffure|sousse", 1]]),
  cityPages: new Map([["tunis", 2], ["sousse", 1]]),
}
const unknown = (p) => isUnknown(T, p.split("/").filter(Boolean))

test("real pages pass", () => {
  for (const p of [
    "/salon/wise-code", "/salon/wise-code/reserver", "/salon/wise-code/opengraph-image",
    "/coiffure", "/coiffure/opengraph-image", "/coiffure/tunis", "/coiffure/tunis/page-2", "/coiffure/tunis/page-3",
    "/coiffure/tunis/opengraph-image", "/brushing/mahdia", // a valid pair without salons: a real (noindex) page
    "/blog", "/blog/guide-prix", "/recherche", "/recherche/tunis", "/recherche/tunis/page-2",
    "/contact", "/compte/profil", "/connexion",
  ]) assert.equal(unknown(p), false, p)
})

test("made-up URLs are refused", () => {
  for (const p of [
    "/salon/zz-nope", "/salon/zz-nope/reserver", "/salon/zz-nope/opengraph-image",
    "/nimportequoi", "/coiffure/nowhere", "/coiffure/tunis/page-4", "/coiffure/tunis/page-1",
    "/coiffure/tunis/page-0", "/coiffure/tunis/autre", "/coiffure/sousse/page-2", "/brushing/mahdia/page-2",
    "/blog/zz-nope", "/recherche/nowhere", "/recherche/tunis/page-3", "/recherche/sousse/page-2",
  ]) assert.equal(unknown(p), true, p)
})

test("STATIC_ROOTS lists every static top-level route", () => {
  // A static route missing from the list would be checked as a category and
  // refused: the whole page would 404. Read the app directory itself.
  const app = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "app")
  const dirs = readdirSync(app).filter((d) => statSync(path.join(app, d)).isDirectory() && !d.startsWith("[") && !d.startsWith("("))
  for (const d of dirs) assert.ok(STATIC_ROOTS.has(d), `app/${d} is missing from STATIC_ROOTS`)
  for (const d of STATIC_ROOTS) assert.ok(dirs.includes(d), `STATIC_ROOTS names app/${d}, which does not exist`)
})

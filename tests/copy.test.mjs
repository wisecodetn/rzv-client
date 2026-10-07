// Small text helpers whose mistakes show up in front of customers.
import { test } from "node:test"
import assert from "node:assert/strict"
import { errorText } from "../lib/errors.js"
import { de } from "../lib/fr.js"
import { pageMeta } from "../lib/meta.js"
import { CANCEL_RULE, PAY_RULE } from "../lib/site.js"

test("errorText: browser network errors become French", () => {
  const fr = "Connexion impossible. Vérifiez votre réseau et réessayez."
  assert.equal(errorText(new TypeError("Failed to fetch")), fr)
  assert.equal(errorText(new TypeError("NetworkError when attempting to fetch resource.")), fr)
  assert.equal(errorText(new TypeError("Load failed")), fr)
  assert.equal(errorText(Object.assign(new Error("x"), { name: "TimeoutError" })), fr)
})

test("errorText: the API's own French messages pass through", () => {
  assert.equal(errorText(new Error("Ce créneau vient d'être pris.")), "Ce créneau vient d'être pris.")
  assert.equal(errorText(null, "Repli"), "Repli")
})

test("de(): elides before a vowel, not before an aspirated h", () => {
  assert.equal(de("coiffure"), "de coiffure")
  assert.equal(de("onglerie"), "d'onglerie")
  assert.equal(de("esthétique"), "d'esthétique")
  assert.equal(de("hammam & gommage"), "de hammam & gommage")
})

test("pageMeta: a page's own title/URL in OG and X cards, never the home's", () => {
  const m = pageMeta({ title: "Carte cadeau", description: "D", path: "/carte-cadeau", robots: { index: false, follow: true } })
  assert.equal(m.title, "Carte cadeau")
  assert.equal(m.alternates.canonical, "/carte-cadeau")
  assert.match(m.openGraph.title, /^Carte cadeau · /)
  assert.match(m.openGraph.url, /\/carte-cadeau$/)
  assert.equal(m.twitter.title, m.openGraph.title)
  assert.ok(m.openGraph.images?.length, "site card by default")
  assert.equal(pageMeta({ title: "S", description: "D", path: "/salon/x", ownImage: true }).openGraph.images, undefined, "a route's own opengraph-image is not overridden")
})

test("the booking rules say what the API enforces", () => {
  assert.match(PAY_RULE, /au salon/)
  assert.match(CANCEL_RULE, /jusqu’au début du rendez-vous/)
})

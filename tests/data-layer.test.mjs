// The data layer's production rules (audit Phase 1, C3): in production a
// failing API never turns into mock salons, and a 404 is always "does not
// exist" — even for a slug that a mock salon happens to have.
import { test } from "node:test"
import assert from "node:assert/strict"

const MOCK_SLUG = "l-atelier-du-cheveu" // exists only in lib/mock.js

/** Load lib/data.js fresh with a given NODE_ENV and a stubbed fetch. */
async function loadData(env, fetchImpl) {
  process.env.NODE_ENV = env
  delete process.env.USE_MOCK
  globalThis.fetch = fetchImpl
  // A query string makes Node load a fresh module instance (MOCK_ALLOWED is
  // read at import time).
  const bust = `?t=${env}-${Math.random()}`
  const api = await import(`../lib/api.js${bust}`)
  const data = await import(`../lib/data.js${bust}`)
  return { api, data }
}
const answer = (status, body = {}) => async () => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } })
const down = async () => { throw new TypeError("fetch failed") }

test("production: an API 404 for a mock slug is null, not a fake salon", async () => {
  const { data } = await loadData("production", answer(404, { message: "Salon introuvable." }))
  assert.equal(await data.getSalon(MOCK_SLUG), null)
})

test("production: API down → getSalon throws (ISR keeps the last good page)", async () => {
  const { data } = await loadData("production", down)
  await assert.rejects(() => data.getSalon(MOCK_SLUG))
})

test("production: API down → listings throw instead of serving mock salons", async () => {
  const { data } = await loadData("production", down)
  await assert.rejects(() => data.querySalons({ category: "coiffure" }))
  await assert.rejects(() => data.salonSlugs())
})

test("development: API down → the mock keeps the site usable", async () => {
  const { data } = await loadData("development", down)
  const s = await data.getSalon(MOCK_SLUG)
  assert.equal(s?.slug, MOCK_SLUG)
})

test("development: a real 404 is still null", async () => {
  const { data } = await loadData("development", answer(404))
  assert.equal(await data.getSalon(MOCK_SLUG), null)
})

test("apiGet: errors carry the HTTP status", async () => {
  const { api } = await loadData("production", answer(503))
  await assert.rejects(() => api.apiGet("/x"), (e) => e instanceof api.ApiError && e.status === 503)
})

test("coverage: pairs with no salon are dropped", async () => {
  const body = { pageSize: 20, pairs: [{ category: "coiffure", city: "tunis", count: 2 }, { category: "onglerie", city: "tunis", count: 0 }], cities: [{ city: "tunis", count: 2 }] }
  const { data } = await loadData("production", answer(200, body))
  const cov = await data.getCoverage()
  assert.deepEqual(cov.pairs.map((p) => p.category), ["coiffure"])
  assert.equal(cov.cities.tunis, 2)
  assert.equal((await data.pairOf("onglerie", "tunis")), null)
})

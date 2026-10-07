// A guest's booking choice survives the login/signup redirect (lib/pending-booking).
import { test, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { savePending, loadPending, clearPending, PENDING_KEY } from "../lib/pending-booking.js"

// Minimal localStorage for Node.
const store = new Map()
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
}
beforeEach(() => store.clear())

test("round trip for the same salon", () => {
  savePending({ salonSlug: "wise-code", svcName: "testy", staffId: "any", time: 600 })
  assert.equal(loadPending("wise-code")?.svcName, "testy")
})

test("another salon's pending booking is ignored", () => {
  savePending({ salonSlug: "wise-code", svcName: "testy" })
  assert.equal(loadPending("maison-yasmine"), null)
})

test("expires after one hour and is cleared", () => {
  store.set(PENDING_KEY, JSON.stringify({ salonSlug: "wise-code", savedAt: Date.now() - 61 * 60 * 1000 }))
  assert.equal(loadPending("wise-code"), null)
  assert.equal(store.has(PENDING_KEY), false)
})

test("corrupt storage never throws", () => {
  store.set(PENDING_KEY, "{not json")
  assert.equal(loadPending("wise-code"), null)
})

test("clearPending removes it", () => {
  savePending({ salonSlug: "wise-code" })
  clearPending()
  assert.equal(loadPending("wise-code"), null)
})

test("storage unavailable (private mode) never throws", () => {
  const saved = globalThis.localStorage
  globalThis.localStorage = { getItem() { throw new Error("denied") }, setItem() { throw new Error("denied") }, removeItem() { throw new Error("denied") } }
  try {
    assert.doesNotThrow(() => savePending({ salonSlug: "x" }))
    assert.equal(loadPending("x"), null)
    assert.doesNotThrow(() => clearPending())
  } finally {
    globalThis.localStorage = saved
  }
})

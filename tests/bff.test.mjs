// The same-origin API relays (app/api) forward the visitor's session cookies,
// so their guards are tested like the API's own: cross-site writes, path
// tricks, oversized bodies.
import { test } from "node:test"
import assert from "node:assert/strict"
import { forwardedFor, readBody, readJson, rejectCrossSite, safeSegments, MAX_BODY_BYTES } from "../lib/bff.js"

const req = (method, headers = {}, body) => new Request("https://rezervy.io/api/x", { method, headers, body })

test("cross-site writes are refused, same-site ones pass", () => {
  assert.equal(rejectCrossSite(req("GET", { "sec-fetch-site": "cross-site" })), null, "reads are not guarded")
  assert.equal(rejectCrossSite(req("POST", { "sec-fetch-site": "same-origin" })), null)
  assert.equal(rejectCrossSite(req("POST", { "sec-fetch-site": "cross-site" }))?.status, 403)
  assert.equal(rejectCrossSite(req("POST", { "sec-fetch-site": "same-site" }))?.status, 403, "a sibling subdomain is not us")
  assert.equal(rejectCrossSite(req("POST", { origin: "https://evil.tn", host: "rezervy.io" }))?.status, 403)
  assert.equal(rejectCrossSite(req("POST", { origin: "null", host: "rezervy.io" }))?.status, 403)
  assert.equal(rejectCrossSite(req("POST", { origin: "https://rezervy.io", host: "rezervy.io" })), null)
})

test("path segments cannot climb out of the allow-listed prefix", () => {
  assert.deepEqual(safeSegments(["bookings", "abc"]), ["bookings", "abc"])
  for (const bad of [["bookings", ".."], ["bookings", "."], ["bookings", ""], ["a/b"], ["a\\b"], [], null]) {
    assert.equal(safeSegments(bad), null, JSON.stringify(bad))
  }
})

test("bodies are capped while streaming, not after buffering", async () => {
  const small = await readBody(req("POST", {}, "x".repeat(100)))
  assert.equal(small.text.length, 100)
  const big = await readBody(req("POST", {}, "x".repeat(MAX_BODY_BYTES + 1)))
  assert.equal(big.error?.status, 413)
  // A lying (absent) Content-Length is caught by counting the stream.
  const stream = new ReadableStream({
    start(c) {
      for (let i = 0; i < 70; i++) c.enqueue(new Uint8Array(1024))
      c.close()
    },
  })
  const streamed = await readBody(new Request("https://rezervy.io/api/x", { method: "POST", body: stream, duplex: "half" }))
  assert.equal(streamed.error?.status, 413)
})

test("JSON bodies: invalid JSON is a 400, not a crash", async () => {
  assert.deepEqual((await readJson(req("POST", {}, '{"a":1}'))).json, { a: 1 })
  assert.equal((await readJson(req("POST", {}, "{oops"))).error?.status, 400)
})

test("the visitor's address is forwarded for the API's rate limits", () => {
  assert.deepEqual(forwardedFor(req("GET", { "x-forwarded-for": "1.2.3.4" })), { "x-forwarded-for": "1.2.3.4" })
  assert.deepEqual(forwardedFor(req("GET")), {})
})

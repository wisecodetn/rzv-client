// Only production may be indexed (lib/site.js INDEXABLE). Getting this wrong
// either de-indexes rezervy.io or lets the team preview compete with it.
import { test } from "node:test"
import assert from "node:assert/strict"

async function siteFor(url) {
  if (url === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
  else process.env.NEXT_PUBLIC_SITE_URL = url
  return import(`../lib/site.js?u=${encodeURIComponent(String(url))}-${Math.random()}`)
}

test("production domains are indexable", async () => {
  assert.equal((await siteFor("https://rezervy.io")).INDEXABLE, true)
  assert.equal((await siteFor("https://www.rezervy.io/")).INDEXABLE, true)
  assert.equal((await siteFor(undefined)).INDEXABLE, true, "the default is the launch domain")
})

test("team preview and local builds are not", async () => {
  assert.equal((await siteFor("https://rzv.wisecode.tn")).INDEXABLE, false)
  assert.equal((await siteFor("http://localhost:3000")).INDEXABLE, false)
  assert.equal((await siteFor("https://rezervy.io.evil.com")).INDEXABLE, false)
})

test("operator details are complete", async () => {
  const { OPERATOR, OPERATOR_ADDRESS, telHref } = await siteFor("https://rezervy.io")
  assert.equal(OPERATOR.name, "Wise Code")
  assert.match(OPERATOR_ADDRESS, /Sousse/)
  assert.equal(telHref(OPERATOR.phone), "tel:+21628065313")
})

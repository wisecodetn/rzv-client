/**
 * Keyboard check of the customer site, in a real headless Chrome driven over the
 * DevTools Protocol (no dependency — Node 22's built-in WebSocket).
 * Covers: skip link, city filter dialog (open, focus in, toggle, Escape, focus
 * back) and the home search combobox (arrows, Enter, close).
 *   BASE=http://localhost:3100 CHROME="C:/Program Files/Google/Chrome/Application/chrome.exe" node scripts/keyboard-check.mjs
 * Needs a running site (e.g. `next start -p 3100`) with at least one salon in
 * coiffure/mahdia — change CITY_PAGE below for another dataset.
 */
import { spawn } from 'node:child_process'

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = (process.env.BASE || 'http://localhost:3100').replace(/\/$/, '')
const CITY_PAGE = process.env.CITY_PAGE || '/coiffure/mahdia'
const PORT = 9333
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', `--remote-debugging-port=${PORT}`, '--window-size=1366,900', `--user-data-dir=${process.env.TEMP}\\rzv-kbd-profile`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

let ws, id = 0
const pending = new Map()
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })
const evalJs = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value
const key = async (k, code = k, keyCode = 0) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code, windowsVirtualKeyCode: keyCode, ...(k === 'Enter' ? { text: String.fromCharCode(13) } : {}) })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code, windowsVirtualKeyCode: keyCode })
  await sleep(150)
}
const KEYS = { Tab: 9, Enter: 13, Escape: 27, ArrowDown: 40, ArrowUp: 38 }
const press = (k) => key(k, k, KEYS[k])
const typeText = async (t) => { for (const ch of t) { await send('Input.insertText', { text: ch }); await sleep(60) } }
const active = () => evalJs(`(()=>{const a=document.activeElement;return a?(a.tagName+'|'+(a.getAttribute('aria-label')||a.id||a.textContent||'').trim().slice(0,40)):null})()`)
const results = []
const check = (name, ok, detail = '') => results.push({ test: name, result: ok ? 'PASS' : 'FAIL', detail: String(detail).slice(0, 70) })

async function goto(url) {
  await send('Page.navigate', { url })
  for (let i = 0; i < 40; i++) { await sleep(250); if ((await evalJs('document.readyState')) === 'complete') break }
  await sleep(2500) // hydration
}

try {
  let targets
  for (let i = 0; i < 40; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); break } catch { await sleep(250) } }
  const page = targets.find((t) => t.type === 'page')
  ws = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((r) => ws.addEventListener('open', r))
  ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id) } })
  await send('Page.enable'); await send('Runtime.enable')
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })

  // ── City page: filters dialog by keyboard ──
  await goto(BASE + CITY_PAGE)
  await press('Tab')
  check('first Tab lands on the skip link', (await active())?.includes('Aller au contenu'), await active())
  await evalJs(`document.querySelector('[aria-haspopup="dialog"][aria-expanded]').focus()`)
  check('"Filtres & tri" is a focusable button', (await active())?.startsWith('BUTTON'), await active())
  await press('Enter')
  await sleep(300)
  const dlg = await evalJs(`!!document.querySelector('[role="dialog"][aria-modal="true"]')`)
  check('Enter opens a modal dialog', dlg)
  check('focus moved into the dialog (close button)', (await active())?.includes('Fermer'), await active())
  await press('Tab')
  const opt = await active()
  check('Tab reaches the filter options', opt?.startsWith('BUTTON'), opt)
  await press('Enter')
  check('Enter toggles an option (aria-pressed)', await evalJs(`document.activeElement.getAttribute('aria-pressed')==='true'`))
  await press('Escape')
  await sleep(300)
  check('Escape closes the dialog', !(await evalJs(`!!document.querySelector('[role="dialog"][aria-modal="true"]')`)))
  check('focus returns to "Filtres & tri"', (await active())?.includes('Filtres'), await active())

  // ── Home: search combobox by keyboard ──
  await goto(BASE + '/')
  await evalJs(`document.getElementById('sb-q-input').focus()`)
  await sleep(300)
  check('search field has a label', await evalJs(`!!document.querySelector('label[for="sb-q-input"]')`))
  check('focus opens the suggestion list', await evalJs(`document.getElementById('sb-q-input').getAttribute('aria-expanded')==='true'`))
  await typeText('coiff')
  await sleep(900)
  await press('ArrowDown')
  const act = await evalJs(`document.getElementById('sb-q-input').getAttribute('aria-activedescendant')`)
  check('ArrowDown highlights a suggestion (aria-activedescendant)', !!act, act)
  const optText = await evalJs(`(()=>{const id=document.getElementById('sb-q-input').getAttribute('aria-activedescendant');const el=id&&document.getElementById(id);return el?el.textContent.trim():null})()`)
  await press('Enter')
  await sleep(300)
  const val = await evalJs(`document.getElementById('sb-q-input').value`)
  check('Enter picks the highlighted suggestion', !!optText && optText.startsWith(val), `${optText} → ${val}`)
  check('list closes after picking', await evalJs(`document.getElementById('sb-q-input').getAttribute('aria-expanded')==='false'`))

  // ── Re-audit fixes ──
  // Tab out of the open list closes it (it used to stay over the next field).
  await evalJs(`document.getElementById('sb-q-input').focus()`)
  await sleep(300)
  await press('Tab')
  check('Tab out of the search field closes its list', await evalJs(`document.getElementById('sb-q-input').getAttribute('aria-expanded')==='false'`))
  check('the suggestion list is not a Tab stop', await evalJs(`!document.querySelector('#sb-q-list:not([tabindex="-1"])')`))
  // .sr-only lives in the global sheet: the newsletter's hidden label stays hidden.
  check('newsletter field label is visually hidden', await evalJs(`(()=>{const l=document.querySelector('.nl-field .sr-only');if(!l)return false;const r=l.getBoundingClientRect();return r.width<=1&&r.height<=1})()`))
  // Keyboard focus shows on a dark surface too (double ring).
  await evalJs(`document.querySelector('.hero-pill')?.focus()`)
  await sleep(150)
  check('focus ring has a light inner ring (visible on dark)', await evalJs(`(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&/rgb/.test(s.boxShadow)})()`))

  // Phone width: the icon-only header links keep their names.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await goto(BASE + '/')
  const names = await evalJs(`[...document.querySelectorAll('header a[href="/devenir-partenaire"], header a[href="/connexion"]')].map((a)=>a.innerText.trim()||a.getAttribute('aria-label')||(a.textContent||'').trim())`)
  check('phone: "pro" and "connexion" links have a name', Array.isArray(names) && names.length === 2 && names.every(Boolean), JSON.stringify(names))

  // Phone: a city drawer keeps Tab inside it.
  await goto(BASE + CITY_PAGE)
  await evalJs(`[...document.querySelectorAll('button')].find((b)=>/Prestations|Filtres/.test(b.textContent)&&b.offsetParent)?.click()`)
  await sleep(500)
  const inside = []
  for (let i = 0; i < 25; i++) {
    await press('Tab')
    inside.push(await evalJs(`!!document.activeElement.closest('[role="dialog"][aria-modal="true"]')`))
  }
  check('phone drawer: 25 Tabs never leave it', inside.length > 0 && inside.every(Boolean), inside.filter((x) => !x).length + ' escapes')
} catch (e) {
  check('script', false, e.message)
} finally {
  console.table(results)
  process.exitCode = results.every((r) => r.result === 'PASS') ? 0 : 1
  try { ws?.close() } catch {}
  proc.kill()
  process.exit(process.exitCode ?? 0)
}

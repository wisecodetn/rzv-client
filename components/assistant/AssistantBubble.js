"use client"
import { Fragment, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { safeNext } from "@/lib/safe-next"
import { usePathname } from "next/navigation"
import "./assistant-bubble.css"
import AssistantAvatar from "./AssistantAvatar"

/* L'assistant Rezervy — the chat bubble.

   The answers come from the API (/api/assistant → server AssistantModule),
   which reads the real salons, prices, hours and free slots. It cannot book:
   it hands out the link to the page that does.

   Honest by construction: the panel asks the API whether the assistant is
   on. If not (switched off by an admin, no key, API down), it shows the help
   links and a visibly disabled input — nothing pretends to chat. Switched off
   mid-conversation, the next message brings the panel back to those links.

   SEO / speed: browser-only and mounted late (after the page is idle), so it
   is absent from the server HTML and never competes with the first paint.
   Styles: globals.css → .rzv-assist. */

const TEASER_KEY = "rzv:assist-teaser"
const CHAT_KEY = "rzv:assist-chat"
/** Random id of this conversation: what the server keeps it under (anonymous). */
const CID_KEY = "rzv:assist-cid"
const MOUNT_AFTER_MS = 1800
const TEASER_AFTER_MS = 6000
const MAX_CHARS = 800

const LINKS = [
  { href: "/recherche", label: "Trouver un salon", d: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-4.3-4.3" },
  { href: "/gerer-rendez-vous", label: "Gérer un rendez-vous", d: "M4 5h16v16H4z M4 9.5h16 M8.5 3v4 M15.5 3v4" },
  { href: "/centre-aide", label: "Centre d’aide", d: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6 M12 17h.01" },
  { href: "/contact", label: "Contacter l’équipe", d: "M4 6h16v12H4z M4 7l8 6 8-6" },
]

const SUGGESTIONS = ["Trouver un salon près de chez moi", "La réservation est-elle payante ?", "Comment annuler un rendez-vous ?"]

/** What the assistant is doing while the visitor waits. */
const TOOL_LABELS = {
  search_salons: "Je cherche des salons…",
  get_salon: "Je consulte la fiche du salon…",
  check_availability: "Je regarde les disponibilités…",
}

const store = {
  get(k) {
    try {
      return window.sessionStorage.getItem(k)
    } catch {
      return null
    }
  },
  set(k, v) {
    try {
      window.sessionStorage.setItem(k, v)
    } catch {}
  },
  del(k) {
    try {
      window.sessionStorage.removeItem(k)
    } catch {}
  },
}

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("")
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

const THUMB = "M7 10v12 M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"

/** 👍 / 👎 under an answer — read by the team to fix what the assistant gets wrong. */
function Feedback({ value, onChange }) {
  return (
    <div className="rzv-assist-rate">
      {[
        [1, "Réponse utile"],
        [-1, "Réponse pas utile"],
      ].map(([v, label]) => (
        <button
          key={v}
          type="button"
          className={`rzv-assist-rate-btn${value === v ? " is-on" : ""}`}
          onClick={() => onChange(value === v ? 0 : v)}
          aria-pressed={value === v}
          aria-label={label}
          title={label}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={v < 0 ? { transform: "scale(-1, -1)" } : undefined} aria-hidden="true">
            <path d={THUMB} />
          </svg>
        </button>
      ))}
      {value ? <span className="rzv-assist-rate-thanks">Merci pour votre avis</span> : null}
    </div>
  )
}

function loadChat() {
  try {
    const list = JSON.parse(store.get(CHAT_KEY) || "[]")
    return Array.isArray(list) ? list.filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") : []
  } catch {
    return []
  }
}

// ── A small, safe Markdown subset: **bold**, [text](/internal-link), lists ──
// Built as React elements (never HTML), and only same-site links become links.

function inline(text, key = "i") {
  const out = []
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g
  let last = 0
  let m
  let n = 0
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1] != null) {
      out.push(<strong key={`${key}-${n++}`}>{inline(m[1], `${key}-${n}`)}</strong>)
    } else {
      const href = m[3]
      // The same rule as the post-login redirect: "/\evil.tn" and "//evil.tn"
      // look like paths but leave the site. Anything else is shown as text.
      const internal = safeNext(href, null)
      out.push(
        internal ? (
          <Link key={`${key}-${n++}`} href={internal}>
            {m[2]}
          </Link>
        ) : (
          <Fragment key={`${key}-${n++}`}>{m[2]}</Fragment>
        ),
      )
    }
    last = re.lastIndex
  }
  if (last < text.length) out.push(text.slice(last))
  // Leftover asterisks (italics, or emphasis still being streamed) are noise.
  return out.map((p) => (typeof p === "string" ? p.replace(/\*/g, "") : p))
}

function Markdown({ text }) {
  const blocks = []
  let list = null
  text.split("\n").forEach((raw, i) => {
    const line = raw.trimEnd()
    const item = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/)
    if (item) {
      if (!list) blocks.push((list = { list: [] }))
      list.list.push(item[1])
      return
    }
    list = null
    if (!line.trim()) return
    blocks.push({ p: line.replace(/^#{1,6}\s+/, ""), heading: /^#{1,6}\s/.test(line), i })
  })
  return blocks.map((b, i) =>
    b.list ? (
      <ul key={i}>
        {b.list.map((t, j) => (
          <li key={j}>{inline(t, `${i}-${j}`)}</li>
        ))}
      </ul>
    ) : (
      <p key={i}>{b.heading ? <strong>{inline(b.p, `${i}`)}</strong> : inline(b.p, `${i}`)}</p>
    ),
  )
}

function SalonCards({ items }) {
  return (
    <div className="rzv-assist-cards">
      {items.slice(0, 3).map((s) => (
        <Link key={s.slug} href={`/salon/${s.slug}`} className="rzv-assist-card">
          <span className="rzv-assist-card-ini" aria-hidden="true">
            {s.ini}
          </span>
          <span style={{ minWidth: 0, flex: 1 }}>
            <span className="rzv-assist-card-name">{s.name}</span>
            <span className="rzv-assist-card-meta">
              {[s.kind, s.area || s.city].filter(Boolean).join(" · ")}
              {s.rev ? ` · ★ ${s.rate} (${s.rev})` : ""}
            </span>
            <span className="rzv-assist-card-meta">
              {s.from ? `dès ${s.from} TND` : ""}
              {s.from && s.status ? " · " : ""}
              {s.status}
            </span>
          </span>
          <span aria-hidden="true" className="rzv-assist-arrow">
            →
          </span>
        </Link>
      ))}
    </div>
  )
}

/** The robot: a face layer + a glowing-eyes layer that blinks on its own. */
/** Three little strokes that pop beside the head — the "ding!" of the image. */
function Sparks() {
  return (
    <svg className="rzv-assist-sparks" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M8 9 12 3" />
      <path d="M12 13 20 9" />
      <path d="M13 18.5 21 19" />
    </svg>
  )
}

function Typing({ label }) {
  return (
    <div className="rzv-assist-msg rzv-assist-typing" aria-label={label || "L’assistant écrit…"}>
      <i />
      <i />
      <i />
      {label && <span className="rzv-assist-typing-label">{label}</span>}
    </div>
  )
}

export default function AssistantBubble() {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [open, setOpen] = useState(false)
  const [teaser, setTeaser] = useState(false)
  const [typing, setTyping] = useState(true)
  /** null = not asked yet, then true / false. */
  const [enabled, setEnabled] = useState(null)
  /** How long conversations are kept — announced in the panel, from the server setting. */
  const [retention, setRetention] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState("")
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState("")
  const panelRef = useRef(null)
  const btnRef = useRef(null)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)
  const abortRef = useRef(null)
  /** A question asked from elsewhere on the site, sent once the panel is ready. */
  const pendingRef = useRef(null)

  // Mount once the page has settled — never during the first paint.
  useEffect(() => {
    let idle
    const t = setTimeout(() => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 2500 })
      else setReady(true)
    }, MOUNT_AFTER_MS)
    return () => {
      clearTimeout(t)
      if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle)
    }
  }, [])

  // The conversation survives navigation and reloads within the visit.
  useEffect(() => {
    setMessages(loadChat())
    return () => abortRef.current?.abort()
  }, [])
  useEffect(() => {
    if (busy) return // saved once the answer is complete
    const keep = messages.filter((m) => m.role === "user" || (m.role === "assistant" && m.content))
    if (keep.length) store.set(CHAT_KEY, JSON.stringify(keep.slice(-30)))
    else store.del(CHAT_KEY)
  }, [messages, busy])

  // A one-line hello, once per visit.
  useEffect(() => {
    if (!ready || store.get(TEASER_KEY)) return
    const t = setTimeout(() => {
      // Never on top of another invitation (e.g. the newsletter modal).
      if (!document.documentElement.classList.contains("rzv-modal-open")) setTeaser(true)
    }, TEASER_AFTER_MS)
    return () => clearTimeout(t)
  }, [ready])

  // Leaving a page closes the panel (its links navigate).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Opening: ask (once) whether the assistant is live; a short "typing…"
  // before the greeting; focus moves into the panel.
  useEffect(() => {
    if (!open) return
    if (enabled == null) {
      fetch("/api/assistant", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setEnabled(!!d.enabled)
          setRetention(Number(d.retentionDays) || null)
        })
        .catch(() => setEnabled(false))
    }
    setTyping(true)
    const t = setTimeout(() => setTyping(false), messages.length ? 0 : 1100)
    panelRef.current?.focus()
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false)
        btnRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Follow the conversation as it grows.
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, step, typing, open])

  useEffect(() => {
    if (open && enabled && !typing && !busy) inputRef.current?.focus()
  }, [open, enabled, typing, busy])

  const dismissTeaser = () => {
    setTeaser(false)
    store.set(TEASER_KEY, "1")
  }
  const toggle = () => {
    dismissTeaser()
    setOpen((o) => !o)
  }

  /** Patch the answer being written (always the last message). */
  const patchLast = (fn) =>
    setMessages((list) => {
      const copy = list.slice()
      copy[copy.length - 1] = fn(copy[copy.length - 1])
      return copy
    })

  const send = async (text) => {
    const content = (text ?? draft).trim().slice(0, MAX_CHARS)
    if (!content || busy) return
    const history = [...messages.filter((m) => m.role === "user" || (m.role === "assistant" && m.content)), { role: "user", content }]
    setMessages([...messages, { role: "user", content }, { role: "assistant", content: "" }])
    setDraft("")
    setBusy(true)
    setStep("")
    const ctrl = new AbortController()
    abortRef.current = ctrl
    let cid = store.get(CID_KEY)
    if (!cid) {
      cid = newId()
      store.set(CID_KEY, cid)
    }

    // The error replaces an answer that never started, or follows a partial one.
    const fail = (message) =>
      setMessages((list) => {
        const prev = list[list.length - 1]
        const err = { role: "error", content: message }
        return prev?.role === "assistant" && !prev.content ? [...list.slice(0, -1), err] : [...list, err]
      })

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })), conversationId: cid, page: pathname }),
        signal: ctrl.signal,
      })
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}))
        if (err.code === "assistant/disabled") {
          // Turned off since the panel opened: back to the help links.
          setMessages((list) => list.slice(0, -2))
          setEnabled(false)
          return
        }
        fail(err.message || "L’assistant ne répond pas pour le moment. Réessayez dans un instant.")
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ""
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let cut
        while ((cut = buf.indexOf("\n\n")) >= 0) {
          const line = buf.slice(0, cut).replace(/^data:\s?/, "")
          buf = buf.slice(cut + 2)
          let ev
          try {
            ev = JSON.parse(line)
          } catch {
            continue
          }
          if (ev.t === "text") {
            setStep("")
            patchLast((m) => ({ ...m, content: m.content + ev.v }))
          } else if (ev.t === "tool") {
            setStep(TOOL_LABELS[ev.v] || "Je vérifie…")
            // Text said before looking something up stays its own paragraph.
            patchLast((m) => (m.content && !m.content.endsWith("\n") ? { ...m, content: m.content + "\n\n" } : m))
          } else if (ev.t === "salons") {
            patchLast((m) => ({ ...m, salons: ev.items }))
          } else if (ev.t === "saved") {
            patchLast((m) => ({ ...m, id: ev.id }))
          } else if (ev.t === "error") {
            fail(ev.message)
          }
        }
      }
    } catch {
      if (!ctrl.signal.aborted) fail("Connexion perdue. Réessayez dans un instant.")
    } finally {
      // An answer that never started is not kept as an empty bubble.
      setMessages((list) => list.filter((m, i) => !(i === list.length - 1 && m.role === "assistant" && !m.content.trim())))
      setBusy(false)
      setStep("")
      abortRef.current = null
    }
  }

  /** Optimistic; put back as it was if the server refuses. */
  const rate = (index, value) => {
    const before = messages[index]?.feedback ?? 0
    const set = (v) => setMessages((list) => list.map((m, i) => (i === index ? { ...m, feedback: v || undefined } : m)))
    set(value)
    fetch("/api/assistant/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ turnId: messages[index].id, value }),
    })
      .then((r) => (r.ok ? r.json() : { ok: false }))
      .then((d) => !d.ok && set(before))
      .catch(() => set(before))
  }

  // Any page can open the assistant — and ask it something:
  //   window.dispatchEvent(new CustomEvent("rzv:assistant", { detail: { question } }))
  useEffect(() => {
    const onAsk = (e) => {
      pendingRef.current = e.detail?.question || null
      setReady(true)
      setTeaser(false)
      store.set(TEASER_KEY, "1")
      setOpen(true)
    }
    window.addEventListener("rzv:assistant", onAsk)
    return () => window.removeEventListener("rzv:assistant", onAsk)
  }, [])
  useEffect(() => {
    if (enabled === false) pendingRef.current = null
    if (!open || enabled !== true || typing || busy || !pendingRef.current) return
    const question = pendingRef.current
    pendingRef.current = null
    send(question)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, enabled, typing, busy])

  const reset = () => {
    abortRef.current?.abort()
    setMessages([])
    setDraft("")
    store.del(CHAT_KEY)
    store.del(CID_KEY)
    inputRef.current?.focus()
  }

  if (!ready) return null

  const live = enabled === true
  const last = messages[messages.length - 1]
  const waiting = busy && (!!step || last?.role !== "assistant" || !last.content)

  return (
    <div className={`rzv-assist ${open ? "is-open" : ""}`}>
      {open && (
        <div
          ref={panelRef}
          id="rzv-assist-panel"
          className="rzv-assist-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="rzv-assist-title"
          tabIndex={-1}
        >
          <div className="rzv-assist-head">
            {/* The mascot reacts: scanning while it looks things up, pulsing while it writes. */}
            <span className={`rzv-assist-head-avatar${busy ? (waiting ? " is-thinking" : " is-talking") : ""}`}>
              <AssistantAvatar size={44} />
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div id="rzv-assist-title" className="rzv-assist-title">
                Assistant Rezervy
              </div>
              <div className="rzv-assist-sub">
                {live ? (
                  <span className="rzv-assist-soon rzv-assist-online">En ligne</span>
                ) : enabled === false ? (
                  <span className="rzv-assist-soon">Indisponible</span>
                ) : null}
              </div>
            </div>
            {live && messages.length > 0 && (
              <button type="button" className="rzv-assist-x" onClick={reset} aria-label="Nouvelle conversation" title="Nouvelle conversation">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 3-6.7L3 8 M3 3v5h5" />
                </svg>
              </button>
            )}
            <button type="button" className="rzv-assist-x" onClick={() => setOpen(false)} aria-label="Fermer l’assistant">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M18 6 6 18 M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={bodyRef} className="rzv-assist-body" aria-live="polite" aria-busy={busy}>
            {typing || enabled == null ? (
              <Typing />
            ) : live ? (
              <>
                <div className="rzv-assist-msg">
                  Bonjour 👋 Je suis l’assistant Rezervy. Je peux vous aider à trouver un salon, connaître ses prix, ses horaires et
                  ses disponibilités.
                </div>
                {!messages.length && (
                  <div className="rzv-assist-chips" style={{ animationDelay: "120ms" }}>
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" className="rzv-assist-chip" onClick={() => send(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="rzv-assist-msg is-user">
                      {m.content}
                    </div>
                  ) : m.role === "error" ? (
                    <div key={i} className="rzv-assist-msg is-error" role="alert">
                      {m.content}
                    </div>
                  ) : m.content ? (
                    <Fragment key={i}>
                      <div className="rzv-assist-msg rzv-assist-md">
                        <Markdown text={m.content} />
                      </div>
                      {m.salons?.length > 0 && <SalonCards items={m.salons} />}
                      {m.id && !(busy && i === messages.length - 1) && <Feedback value={m.feedback} onChange={(v) => rate(i, v)} />}
                    </Fragment>
                  ) : null,
                )}
                {waiting && <Typing label={step} />}
              </>
            ) : (
              <>
                <div className="rzv-assist-msg">Bonjour 👋 Je suis l’assistant Rezervy.</div>
                <div className="rzv-assist-msg" style={{ animationDelay: "120ms" }}>
                  Je ne suis pas disponible pour le moment. En attendant, voici où trouver ce qu’il vous faut :
                </div>
                <div className="rzv-assist-links" style={{ animationDelay: "240ms" }}>
                  {LINKS.map((l) => (
                    <Link key={l.href} href={l.href} className="rzv-assist-link">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={l.d} />
                      </svg>
                      {l.label}
                      <span aria-hidden="true" className="rzv-assist-arrow">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {live ? (
            <>
              <form
                className="rzv-assist-foot"
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
              >
                <input
                  ref={inputRef}
                  className="rzv-assist-input"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  maxLength={MAX_CHARS}
                  disabled={busy}
                  placeholder={busy ? "L’assistant répond…" : "Posez votre question…"}
                  aria-label="Votre message"
                  autoComplete="off"
                />
                <button type="submit" className="rzv-assist-send" disabled={busy || !draft.trim()} aria-label="Envoyer">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13 M22 2l-7 20-4-9-9-4z" />
                  </svg>
                </button>
              </form>
              <div className="rzv-assist-note">
                Réponses générées par IA · ne partagez pas d’informations personnelles.
                {retention ? ` Conversations conservées ${retention} jours, de façon anonyme, pour améliorer l’assistant. ` : " "}
                <Link href="/confidentialite#assistant">En savoir plus</Link>
              </div>
            </>
          ) : (
            /* Visibly not a working chat. */
            <div className="rzv-assist-foot">
              <input className="rzv-assist-input" disabled placeholder="Assistant indisponible" aria-label="Message (assistant indisponible)" />
              <button type="button" className="rzv-assist-send" disabled aria-label="Envoyer (assistant indisponible)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13 M22 2l-7 20-4-9-9-4z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}

      {teaser && !open && (
        <div className="rzv-assist-teaser" role="status">
          <button type="button" className="rzv-assist-teaser-body" onClick={toggle}>
            Bonjour ! Besoin d’un coup de main&nbsp;?
          </button>
          <button type="button" className="rzv-assist-teaser-x" onClick={dismissTeaser} aria-label="Masquer">
            ×
          </button>
        </div>
      )}

      <button
        ref={btnRef}
        type="button"
        className="rzv-assist-btn"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="rzv-assist-panel"
        aria-label={open ? "Fermer l’assistant Rezervy" : "Ouvrir l’assistant Rezervy"}
      >
        <span className="rzv-assist-ring" aria-hidden="true" />
        <span className="rzv-assist-bob">
          <AssistantAvatar size={58} />
        </span>
        {!open && <Sparks />}
        <span className="rzv-assist-close" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M18 6 6 18 M6 6l12 12" />
          </svg>
        </span>
      </button>
    </div>
  )
}

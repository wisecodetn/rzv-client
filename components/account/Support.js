"use client"

import { useCallback, useEffect, useState } from "react"

/* Aide & support — the customer's side of the ticket queue the admin already
   had. The model and the service always carried a `client` requester; only the
   door was missing, so a customer had no way to reach anyone but e-mail. */

const CATEGORIES = [
  { v: "reservation", l: "Un rendez-vous" },
  { v: "compte", l: "Mon compte" },
  { v: "facturation", l: "Un paiement" },
  { v: "technique", l: "Un problème technique" },
  { v: "autre", l: "Autre" },
]

const STATUS = {
  open: { l: "En attente de réponse", c: "var(--gold-dark)", bg: "rgba(0,0,0,0.11)" },
  pending: { l: "En attente de vous", c: "var(--green)", bg: "var(--green-soft)" },
  resolved: { l: "Résolu", c: "var(--green)", bg: "var(--green-soft)" },
  closed: { l: "Clos", c: "var(--muted)", bg: "var(--surface-2)" },
}

const when = (iso) =>
  iso
    ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(
        new Date(iso),
      )
    : ""

const card = {
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: 16,
  padding: 18,
}
const input = {
  width: "100%",
  background: "var(--bg)",
  border: "1px solid var(--line-2)",
  borderRadius: 11,
  padding: "11px 13px",
  fontSize: 13.5,
  color: "var(--ink)",
  outline: "none",
  fontFamily: "inherit",
}

export function Support() {
  const [tickets, setTickets] = useState(null)
  const [open, setOpen] = useState(null)
  const [composing, setComposing] = useState(false)
  const [form, setForm] = useState({ subject: "", category: "reservation", message: "" })
  const [reply, setReply] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")

  const load = useCallback(() => {
    fetch("/api/account/support/tickets")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setTickets(Array.isArray(d) ? d : []))
      .catch(() => setTickets([]))
  }, [])

  useEffect(load, [load])

  const openThread = async (id) => {
    setErr("")
    try {
      const r = await fetch(`/api/account/support/tickets/${id}`)
      if (!r.ok) throw new Error()
      setOpen(await r.json())
    } catch {
      setErr("Impossible d’ouvrir cette conversation.")
    }
  }

  const send = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr("")
    try {
      const r = await fetch("/api/account/support/tickets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.message || "Envoi impossible.")
      setForm({ subject: "", category: "reservation", message: "" })
      setComposing(false)
      setOpen(d)
      load()
    } catch (e2) {
      setErr(e2.message || "Envoi impossible.")
    } finally {
      setBusy(false)
    }
  }

  const answer = async (e) => {
    e.preventDefault()
    if (!reply.trim()) return
    setBusy(true)
    setErr("")
    try {
      const r = await fetch(`/api/account/support/tickets/${open.id}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: reply }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d?.message || "Envoi impossible.")
      setReply("")
      setOpen(d)
      load()
    } catch (e2) {
      setErr(e2.message || "Envoi impossible.")
    } finally {
      setBusy(false)
    }
  }

  /* ---- one conversation ---- */
  if (open) {
    const st = STATUS[open.status] || STATUS.open
    return (
      <div>
        <button
          onClick={() => setOpen(null)}
          style={{ background: "none", border: "none", color: "var(--gold-dark)", fontWeight: 700, fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 14 }}
        >
          ‹ Toutes mes demandes
        </button>

        <div style={{ ...card, marginBottom: 14 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{open.subject}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {open.ref} · ouvert le {when(open.createdAt)}
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "5px 11px", background: st.bg, color: st.c }}>
              {st.l}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {open.messages.map((m) => {
            const mine = m.author === "requester"
            return (
              <div
                key={m.id}
                style={{
                  ...card,
                  padding: "13px 15px",
                  marginLeft: mine ? 28 : 0,
                  marginRight: mine ? 0 : 28,
                  background: mine ? "var(--surface-2)" : "var(--card)",
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 800, color: mine ? "var(--muted-2)" : "var(--gold-dark)", marginBottom: 5 }}>
                  {mine ? "Vous" : m.authorName || "Équipe Rezervy"} · {when(m.at)}
                </div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--ink)", whiteSpace: "pre-wrap" }}>{m.body}</div>
                {m.attachments?.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {m.attachments.map((a) => (
                      <a key={a} href={a} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "var(--gold-dark)", fontWeight: 700 }}>
                        Pièce jointe
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {open.status === "closed" ? (
          <div style={{ ...card, marginTop: 14, textAlign: "center", fontSize: 13, color: "var(--muted)" }}>
            Cette demande est close. Ouvrez-en une nouvelle si vous avez encore besoin d’aide.
          </div>
        ) : (
          <form onSubmit={answer} style={{ ...card, marginTop: 14 }}>
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Votre réponse…"
              style={{ ...input, resize: "vertical" }}
            />
            {err && <div style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 700, marginTop: 8 }}>{err}</div>}
            <button
              type="submit"
              disabled={busy || !reply.trim()}
              style={{ marginTop: 10, background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 11, padding: "11px 20px", fontWeight: 800, fontSize: 13, cursor: "pointer", opacity: busy || !reply.trim() ? 0.5 : 1 }}
            >
              {busy ? "Envoi…" : "Envoyer"}
            </button>
          </form>
        )}
      </div>
    )
  }

  /* ---- the list ---- */
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 23, margin: 0 }}>Aide & support</h1>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>
            Une question sur un rendez-vous, votre compte ou un paiement ? Écrivez-nous.
          </div>
        </div>
        {!composing && (
          <button
            onClick={() => setComposing(true)}
            style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 11, padding: "11px 18px", fontWeight: 800, fontSize: 13, cursor: "pointer", flex: "none" }}
          >
            Nouvelle demande
          </button>
        )}
      </div>

      {composing && (
        <form onSubmit={send} style={{ ...card, marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em" }}>
              Votre demande concerne
            </div>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={input}>
              {CATEGORIES.map((c) => (
                <option key={c.v} value={c.v}>{c.l}</option>
              ))}
            </select>
          </label>

          <label style={{ display: "block", marginBottom: 12 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em" }}>
              Objet
            </div>
            <input
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="Ex. Je n’arrive pas à annuler mon rendez-vous"
              required
              style={input}
            />
          </label>

          <label style={{ display: "block" }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".04em" }}>
              Message
            </div>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Décrivez votre situation — salon, date du rendez-vous, ce que vous avez déjà essayé."
              required
              style={{ ...input, resize: "vertical" }}
            />
          </label>

          {err && <div style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 700, marginTop: 10 }}>{err}</div>}

          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button
              type="button"
              onClick={() => { setComposing(false); setErr("") }}
              style={{ background: "transparent", border: "1px solid var(--line-2)", color: "var(--muted-2)", borderRadius: 11, padding: "11px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
            >
              Annuler
            </button>
            <div style={{ flex: 1 }} />
            <button
              type="submit"
              disabled={busy}
              style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 11, padding: "11px 22px", fontWeight: 800, fontSize: 13, cursor: "pointer", opacity: busy ? 0.6 : 1 }}
            >
              {busy ? "Envoi…" : "Envoyer la demande"}
            </button>
          </div>
        </form>
      )}

      {tickets === null && <div style={{ ...card, textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Chargement…</div>}

      {tickets?.length === 0 && !composing && (
        <div style={{ ...card, textAlign: "center", padding: "38px 20px" }}>
          <div style={{ fontSize: 14.5, fontWeight: 800, marginBottom: 6 }}>Aucune demande pour le moment</div>
          <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
            Notre équipe répond généralement sous 24 h ouvrées.
            <br />
            Beaucoup de réponses se trouvent déjà au{" "}
            <a href="/centre-aide" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>centre d’aide</a>.
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {(tickets || []).map((t) => {
          const st = STATUS[t.status] || STATUS.open
          return (
            <button
              key={t.id}
              onClick={() => openThread(t.id)}
              style={{ ...card, display: "flex", alignItems: "center", gap: 12, textAlign: "left", cursor: "pointer", width: "100%" }}
            >
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>
                  {t.ref} · {t.messageCount} message{t.messageCount > 1 ? "s" : ""} · {when(t.lastReplyAt || t.createdAt)}
                </div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "5px 11px", background: st.bg, color: st.c, flex: "none" }}>
                {st.l}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

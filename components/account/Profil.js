"use client"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "../AuthProvider"
import { errorText } from "@/lib/errors"
import { Card, H } from "./shared"

/* ── Mon profil ──────────────────────────────────────────────────── */
export function Profil() {
  const { user, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [saved, setSaved] = useState(false)
  const [saveErr, setSaveErr] = useState("")
  if (!user) return null
  const inp = { width: "100%", background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 11, padding: "11px 13px", fontSize: 14, color: "var(--ink)", outline: "none" }
  const label = { fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)", display: "block", marginBottom: 6 }
  const save = async (e) => {
    e.preventDefault()
    setSaveErr("")
    try {
      await updateUser({ name: name.trim(), phone: phone.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      // The form keeps what was typed; the reason is said, not swallowed.
      setSaveErr(errorText(err))
    }
  }

  return (
    <>
      <H>Mon profil</H>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>Vos informations personnelles et vos préférences.</div>

      <Card>
        <form onSubmit={save}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
            <label><span style={label}>Nom complet</span><input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} style={inp} /></label>
            <label><span style={label}>Téléphone</span><input type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 …" style={inp} /></label>
          </div>
          {/* Read-only: changing it needs a verification flow that doesn't exist
              yet, and an editable field that silently ignored the edit lied. */}
          <label style={{ display: "block", marginTop: 14 }}>
            <span style={label}>E-mail</span>
            <input type="email" value={user.email || ""} readOnly aria-describedby="email-help" style={{ ...inp, color: "var(--muted-2)", cursor: "default" }} />
            <span id="email-help" style={{ display: "block", fontSize: 11.5, color: "var(--muted)", marginTop: 5 }}>
              Pour changer d’adresse e-mail, <Link href="/contact" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>contactez-nous</Link>.
            </span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <button type="submit" className="btn-gold" style={{ background: "var(--gold)", color: "var(--on-gold)", border: "none", borderRadius: 11, padding: "11px 22px", fontWeight: 800, fontSize: 13 }}>Enregistrer</button>
            <span role="status" style={{ fontSize: 12.5, color: "var(--green)", fontWeight: 700 }}>{saved ? "✓ Profil mis à jour" : ""}</span>
          </div>
          {saveErr && <div role="alert" style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 700, marginTop: 10 }}>{saveErr}</div>}
        </form>
      </Card>

      {/* No toggles: there were two, they saved nothing, and one promised SMS
          that are never sent. This says what actually happens. */}
      <Card style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 6 }}>Notifications</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", lineHeight: 1.6 }}>
          Les confirmations et rappels de vos rendez-vous sont envoyés par e-mail à <b style={{ color: "var(--ink)" }}>{user.email}</b>.
          Les e-mails d’information contiennent un lien de désinscription.
        </div>
      </Card>

      <Card style={{ marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Sécurité</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Modifiez votre mot de passe pour sécuriser votre compte.</div>
          </div>
          <Link href="/reinitialiser-mot-de-passe" className="btn-outline" style={{ background: "transparent", border: "1px solid var(--accent-line)", color: "var(--gold-dark)", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap" }}>Changer le mot de passe</Link>
        </div>
      </Card>

      <DeleteAccount />
    </>
  )
}

/**
 * "Supprimer mon compte" — what the privacy policy promises. Typed
 * confirmation, and plain words about what is removed and what is kept.
 */
function DeleteAccount() {
  const { user } = useAuth()
  // A Google-only account has no password to type; the typed word is the check.
  const needsPassword = user?.provider !== "google"
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState("")
  const ready = confirm.trim().toUpperCase() === "SUPPRIMER" && (!needsPassword || password.length > 0)

  const remove = async () => {
    setBusy(true)
    setErr("")
    try {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirm, password }),
      })
      const d = await res.json().catch(() => null)
      if (!res.ok) throw new Error(d?.message || "Suppression impossible. Réessayez.")
      // Full reload: the session is gone, every provider starts over.
      window.location.assign("/compte-supprime")
    } catch (e) {
      setErr(errorText(e))
      setBusy(false)
    }
  }

  return (
    <Card style={{ marginTop: 14 }}>
      <h2 style={{ fontWeight: 800, fontSize: 14, margin: 0 }}>Supprimer mon compte</h2>
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4, lineHeight: 1.6 }}>
        Votre compte, vos favoris, vos demandes de liste d’attente et votre inscription à la newsletter sont supprimés
        définitivement. Les salons gardent l’historique de vos rendez-vous passés (leur fichier clients), nous gardons vos
        échanges avec le support, et vos avis publiés restent visibles sous le nom « Anonyme ». Vos rendez-vous à venir
        doivent d’abord être annulés. <Link href="/confidentialite#conservation" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>En savoir plus</Link>
      </div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} style={{ marginTop: 12, background: "transparent", border: "1px solid var(--red-line)", color: "var(--red)", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
          Supprimer mon compte…
        </button>
      ) : (
        <div style={{ marginTop: 12 }}>
          {needsPassword && (
            <>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)", marginBottom: 6 }} htmlFor="del-password">
                Votre mot de passe
              </label>
              <input
                id="del-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", maxWidth: 360, display: "block", marginBottom: 12, background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "var(--ink)" }}
              />
            </>
          )}
          <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)", marginBottom: 6 }} htmlFor="del-confirm">
            Pour confirmer, tapez SUPPRIMER
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input id="del-confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" style={{ flex: 1, minWidth: 160, background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 10, padding: "10px 12px", fontSize: 14, color: "var(--ink)" }} />
            <button type="button" onClick={remove} disabled={!ready || busy} style={{ background: "var(--red)", color: "var(--on-red)", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 800, fontSize: 12.5, cursor: ready && !busy ? "pointer" : "default", opacity: ready && !busy ? 1 : 0.5 }}>
              {busy ? "Suppression…" : "Supprimer définitivement"}
            </button>
            <button type="button" onClick={() => { setOpen(false); setConfirm(""); setPassword(""); setErr("") }} disabled={busy} style={{ background: "transparent", border: "1px solid var(--line-strong)", color: "var(--muted-2)", borderRadius: 10, padding: "10px 14px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              Annuler
            </button>
          </div>
          {err && <div role="alert" style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 700, marginTop: 8 }}>{err}</div>}
        </div>
      )}
    </Card>
  )
}

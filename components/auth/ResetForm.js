"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../AuthProvider"
import { AuthLayout, Field, PasswordField, SubmitBtn, ErrorMsg, SuccessMsg, linkStyle } from "./AuthUI"

/* One form for both flows: guest "code reçu par e-mail" reset, and logged-in
   password change (email prefilled, code requestable from here). On success we
   log the user in with the new password and land on /compte. */
export default function ResetForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const { user, forgotPassword, resetPassword, login } = useAuth()
  const [email, setEmail] = useState(sp.get("email") || user?.email || "")
  const [code, setCode] = useState("")
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")
  const [err, setErr] = useState("")
  const [info, setInfo] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const back = user ? "/compte" : "/connexion"

  const sendCode = async () => {
    setErr(""); setInfo("")
    const em = (email || "").trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(em)) { setErr("Adresse e-mail invalide."); return }
    setSending(true)
    try {
      await forgotPassword(em)
      setInfo(`Code envoyé à ${em} — valable 10 minutes.`)
    } catch (ex) {
      setErr(ex.message || "Une erreur est survenue.")
    } finally {
      setSending(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setErr(""); setInfo("")
    const em = (email || "").trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(em)) { setErr("Adresse e-mail invalide."); return }
    if (!/^\d{6}$/.test(code.trim())) { setErr("Entrez le code à 6 chiffres reçu par e-mail."); return }
    if (pw.length < 6) { setErr("Le mot de passe doit contenir au moins 6 caractères."); return }
    if (pw !== pw2) { setErr("Les mots de passe ne correspondent pas."); return }
    setLoading(true)
    try {
      await resetPassword({ email: em, code: code.trim(), password: pw })
      try { await login({ email: em, password: pw }) } catch { /* fall back to login page */ }
      setDone(true)
      setTimeout(() => router.push("/compte"), 1400)
    } catch (ex) {
      setErr(ex.message || "Code invalide ou expiré.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title={user ? "Changer le mot de passe" : "Nouveau mot de passe"}
      subtitle={done ? "" : "Saisissez le code reçu par e-mail, puis choisissez un nouveau mot de passe."}
      footer={done ? null : <Link href={back} style={linkStyle}>{user ? "‹ Retour à mon compte" : "‹ Retour à la connexion"}</Link>}
    >
      {done ? (
        <SuccessMsg>Mot de passe mis à jour. Redirection…</SuccessMsg>
      ) : (
        <form onSubmit={submit}>
          <ErrorMsg>{err}</ErrorMsg>
          {info && <SuccessMsg>{info}</SuccessMsg>}
          <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.tn" autoComplete="email" required disabled={!!user} />
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Field label="Code de vérification" value={code} onChange={setCode} placeholder="6 chiffres" autoComplete="one-time-code" required />
            </div>
            <button type="button" onClick={sendCode} disabled={sending} style={{ flex: "none", marginBottom: 14, background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 10, padding: "11px 14px", fontWeight: 800, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>
              {sending ? "Envoi…" : "Recevoir un code"}
            </button>
          </div>
          <PasswordField label="Nouveau mot de passe" value={pw} onChange={setPw} placeholder="Au moins 6 caractères" autoComplete="new-password" required />
          <PasswordField label="Confirmer le mot de passe" value={pw2} onChange={setPw2} placeholder="••••••••" autoComplete="new-password" required />
          <SubmitBtn loading={loading}>Réinitialiser</SubmitBtn>
        </form>
      )}
    </AuthLayout>
  )
}

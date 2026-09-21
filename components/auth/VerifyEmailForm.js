"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../AuthProvider"
import { AuthLayout, Field, SubmitBtn, ErrorMsg, SuccessMsg, linkStyle } from "./AuthUI"

/** Registration confirmation: enter the 6-digit code emailed at signup. On
 *  success the session starts and we land on /compte. */
export default function VerifyEmailForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const { verifyEmail, resendVerification } = useAuth()
  const [email, setEmail] = useState(sp.get("email") || "")
  const [code, setCode] = useState("")
  const [err, setErr] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const resend = async () => {
    setErr(""); setInfo("")
    const em = (email || "").trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(em)) { setErr("Adresse e-mail invalide."); return }
    setSending(true)
    try {
      await resendVerification(em)
      setInfo(`Nouveau code envoyé à ${em} — valable 10 minutes.`)
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
    setLoading(true)
    try {
      const u = await verifyEmail({ email: em, code: code.trim() })
      const dest = sp.get("next") || "/compte"
      // Registration now always collects a number, but an account created
      // before that rule can still be verifying today.
      router.push(u?.needsPhone ? `/telephone?next=${encodeURIComponent(dest)}` : dest)
    } catch (ex) {
      setErr(ex.message || "Code invalide ou expiré.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Vérifiez votre e-mail"
      subtitle="Un code de vérification à 6 chiffres vous a été envoyé. Saisissez-le pour activer votre compte."
      footer={<Link href="/connexion" style={linkStyle}>‹ Retour à la connexion</Link>}
    >
      <form onSubmit={submit}>
        <ErrorMsg>{err}</ErrorMsg>
        {info && <SuccessMsg>{info}</SuccessMsg>}
        <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.tn" autoComplete="email" required />
        <Field label="Code de vérification" value={code} onChange={setCode} placeholder="6 chiffres" autoComplete="one-time-code" required />
        <SubmitBtn loading={loading}>Activer mon compte</SubmitBtn>
        <button type="button" onClick={resend} disabled={sending} style={{ width: "100%", marginTop: 10, background: "transparent", border: "1px solid rgba(169,124,72,0.45)", color: "var(--gold-dark)", borderRadius: 12, padding: "12px 16px", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>
          {sending ? "Envoi…" : "Renvoyer le code"}
        </button>
      </form>
    </AuthLayout>
  )
}

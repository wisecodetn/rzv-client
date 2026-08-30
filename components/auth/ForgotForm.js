"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../AuthProvider"
import { AuthLayout, Field, SubmitBtn, ErrorMsg, SuccessMsg, linkStyle, useGuestOnly } from "./AuthUI"

export default function ForgotForm() {
  const redirecting = useGuestOnly()
  const router = useRouter()
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [err, setErr] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr("")
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr("Adresse e-mail invalide."); return }
    setLoading(true)
    try {
      await forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (ex) {
      setErr(ex.message || "Une erreur est survenue. Réessayez.")
    } finally {
      setLoading(false)
    }
  }
  if (redirecting) return null

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle={sent ? "" : "Entrez votre e-mail et nous vous enverrons un code de vérification."}
      footer={<><Link href="/connexion" style={linkStyle}>‹ Retour à la connexion</Link></>}
    >
      {sent ? (
        <>
          <SuccessMsg>
            Si un compte est associé à <b>{email}</b>, un code de vérification à 6 chiffres vient d'être envoyé. Pensez à vérifier vos spams.
          </SuccessMsg>
          <button
            onClick={() => router.push(`/reinitialiser-mot-de-passe?email=${encodeURIComponent(email.trim().toLowerCase())}`)}
            className="btn-gold"
            style={{ width: "100%", marginTop: 14, background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 12, padding: "13px 16px", fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}
          >
            Saisir le code
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <ErrorMsg>{err}</ErrorMsg>
          <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.tn" autoComplete="email" required />
          <SubmitBtn loading={loading}>Envoyer le code</SubmitBtn>
        </form>
      )}
    </AuthLayout>
  )
}

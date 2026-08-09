"use client"
import { useState } from "react"
import Link from "next/link"
import { AuthLayout, Field, SubmitBtn, ErrorMsg, SuccessMsg, linkStyle, useGuestOnly } from "./AuthUI"

export default function ForgotForm() {
  const redirecting = useGuestOnly()
  const [email, setEmail] = useState("")
  const [err, setErr] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr("")
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr("Adresse e-mail invalide."); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setSent(true)
  }
  if (redirecting) return null

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle={sent ? "" : "Entrez votre e-mail et nous vous enverrons un lien de réinitialisation."}
      footer={<><Link href="/connexion" style={linkStyle}>‹ Retour à la connexion</Link></>}
    >
      {sent ? (
        <SuccessMsg>
          Si un compte est associé à <b>{email}</b>, un lien de réinitialisation vient d'être envoyé. Pensez à vérifier vos spams.
        </SuccessMsg>
      ) : (
        <form onSubmit={submit}>
          <ErrorMsg>{err}</ErrorMsg>
          <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.tn" autoComplete="email" required />
          <SubmitBtn loading={loading}>Envoyer le lien</SubmitBtn>
        </form>
      )}
    </AuthLayout>
  )
}

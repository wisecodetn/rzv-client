"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../AuthProvider"
import { AuthLayout, Field, PasswordField, SubmitBtn, Divider, GoogleButton, ErrorMsg, linkStyle, useGuestOnly } from "./AuthUI"

export default function LoginForm() {
  const { login, googleAuth } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/compte"
  const redirecting = useGuestOnly(next)
  const [email, setEmail] = useState("")
  const [pw, setPw] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const run = async (fn) => {
    setErr(""); setLoading(true)
    try {
      const u = await fn()
      // Accounts created before the phone was required — and every Google
      // sign-in — are asked for it here rather than left unreachable.
      router.push(u?.needsPhone ? `/telephone?next=${encodeURIComponent(next)}` : next)
    } catch (e) {
      // Correct credentials, e-mail not yet confirmed → the API re-sent a code.
      if (e.code === "auth/unverified") { router.push(`/verifier-email?email=${encodeURIComponent(email.trim().toLowerCase())}&next=${encodeURIComponent(next)}`); return }
      setErr(e.message); setLoading(false)
    }
  }
  const submit = (e) => { e.preventDefault(); run(() => login({ email, password: pw })) }
  if (redirecting) return null

  return (
    <AuthLayout
      title="Bon retour"
      subtitle="Connectez-vous pour gérer vos rendez-vous et votre fidélité."
      footer={<>Pas encore de compte ? <Link href={next !== "/compte" ? `/inscription?next=${encodeURIComponent(next)}` : "/inscription"} style={linkStyle}>Créer un compte</Link></>}
    >
      <GoogleButton onClick={() => run(googleAuth)} loading={loading} />
      <Divider>ou</Divider>
      <form onSubmit={submit}>
        <ErrorMsg>{err}</ErrorMsg>
        <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.tn" autoComplete="email" required />
        <PasswordField
          label="Mot de passe"
          value={pw}
          onChange={setPw}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          rightLabel={<Link href="/mot-de-passe-oublie" style={{ ...linkStyle, fontSize: 12 }}>Mot de passe oublié ?</Link>}
        />
        <SubmitBtn loading={loading}>Se connecter</SubmitBtn>
      </form>
    </AuthLayout>
  )
}

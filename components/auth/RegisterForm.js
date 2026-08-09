"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../AuthProvider"
import { AuthLayout, Field, PasswordField, SubmitBtn, Divider, GoogleButton, ErrorMsg, linkStyle, useGuestOnly } from "./AuthUI"

export default function RegisterForm() {
  const { register, googleAuth } = useAuth()
  const router = useRouter()
  const redirecting = useGuestOnly()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [pw, setPw] = useState("")
  const [accept, setAccept] = useState(false)
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const run = async (fn) => { setErr(""); setLoading(true); try { await fn(); router.push("/compte") } catch (e) { setErr(e.message); setLoading(false) } }
  const submit = (e) => {
    e.preventDefault()
    if (!accept) { setErr("Veuillez accepter les conditions d'utilisation."); return }
    run(() => register({ name, email, phone, password: pw }))
  }
  if (redirecting) return null

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Réservez en quelques secondes et suivez tous vos rendez-vous."
      footer={<>Déjà inscrit·e ? <Link href="/connexion" style={linkStyle}>Se connecter</Link></>}
    >
      <GoogleButton onClick={() => run(googleAuth)} loading={loading} label="S'inscrire avec Google" />
      <Divider>ou</Divider>
      <form onSubmit={submit}>
        <ErrorMsg>{err}</ErrorMsg>
        <Field label="Nom complet" value={name} onChange={setName} placeholder="Ines Bouazizi" autoComplete="name" required />
        <Field label="E-mail" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.tn" autoComplete="email" required />
        <Field label="Téléphone (optionnel)" type="tel" value={phone} onChange={setPhone} placeholder="+216 52 118 400" autoComplete="tel" />
        <PasswordField label="Mot de passe" value={pw} onChange={setPw} placeholder="Au moins 6 caractères" autoComplete="new-password" required />
        <label style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12.5, color: "var(--muted-2)", lineHeight: 1.5, margin: "2px 0 16px", cursor: "pointer" }}>
          <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} style={{ marginTop: 2, accentColor: "var(--gold)", width: 16, height: 16, flex: "none" }} />
          <span>J'accepte les <a href="#" style={linkStyle}>conditions d'utilisation</a> et la <a href="#" style={linkStyle}>politique de confidentialité</a>.</span>
        </label>
        <SubmitBtn loading={loading}>Créer mon compte</SubmitBtn>
      </form>
    </AuthLayout>
  )
}

"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../AuthProvider"
import { AuthLayout, PasswordField, SubmitBtn, ErrorMsg, SuccessMsg, linkStyle } from "./AuthUI"

export default function ResetForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")
  const [err, setErr] = useState("")
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const back = user ? "/compte" : "/connexion"

  const submit = async (e) => {
    e.preventDefault()
    setErr("")
    if (pw.length < 6) { setErr("Le mot de passe doit contenir au moins 6 caractères."); return }
    if (pw !== pw2) { setErr("Les mots de passe ne correspondent pas."); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 700))
    setLoading(false)
    setDone(true)
    setTimeout(() => router.push(back), 1600)
  }

  return (
    <AuthLayout
      title={user ? "Changer le mot de passe" : "Nouveau mot de passe"}
      subtitle={done ? "" : "Choisissez un nouveau mot de passe pour votre compte."}
      footer={done ? null : <Link href={back} style={linkStyle}>{user ? "‹ Retour à mon compte" : "‹ Retour à la connexion"}</Link>}
    >
      {done ? (
        <SuccessMsg>Mot de passe mis à jour. Redirection…</SuccessMsg>
      ) : (
        <form onSubmit={submit}>
          <ErrorMsg>{err}</ErrorMsg>
          <PasswordField label="Nouveau mot de passe" value={pw} onChange={setPw} placeholder="Au moins 6 caractères" autoComplete="new-password" required />
          <PasswordField label="Confirmer le mot de passe" value={pw2} onChange={setPw2} placeholder="••••••••" autoComplete="new-password" required />
          <SubmitBtn loading={loading}>Réinitialiser</SubmitBtn>
        </form>
      )}
    </AuthLayout>
  )
}

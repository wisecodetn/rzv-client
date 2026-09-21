"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../AuthProvider"
import { AuthLayout, Field, SubmitBtn, ErrorMsg } from "./AuthUI"

/**
 * The one thing a Google sign-in never provides.
 *
 * A salon reaches its client by phone, and the number is the identity that
 * links one person across salons — so an account without one is a customer
 * nobody can call and nobody can recognise. Signing up by e-mail asks for it in
 * the form; Google cannot, so it is asked here, once, before the account is
 * usable.
 *
 * Not skippable, and not a nag on a later screen: a booking made by someone
 * unreachable is the salon's problem, not ours to defer.
 */
export default function PhoneForm() {
  const router = useRouter()
  const { user, ready, updateUser } = useAuth()
  const [phone, setPhone] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const next = () => {
    try { return new URLSearchParams(window.location.search).get("next") || "/compte" } catch { return "/compte" }
  }

  // Nothing to do here for an account that already has a number.
  useEffect(() => {
    if (!ready) return
    if (!user) router.replace("/connexion")
    else if (!user.needsPhone) router.replace(next())
  }, [ready, user, router])

  const submit = async (e) => {
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      await updateUser({ phone })
      router.push(next())
    } catch (ex) {
      setErr(ex.message)
      setLoading(false)
    }
  }

  if (!ready || !user) return null

  return (
    <AuthLayout
      title="Votre numéro de téléphone"
      subtitle="Le salon en a besoin pour vous joindre en cas d’imprévu. Dernière étape."
    >
      <form onSubmit={submit}>
        <ErrorMsg>{err}</ErrorMsg>
        <Field
          label="Téléphone"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="+216 52 118 400"
          autoComplete="tel"
          required
          autoFocus
        />
        <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: -10, marginBottom: 16 }}>
          Un seul compte par numéro. Il n’est jamais affiché publiquement.
        </div>
        <SubmitBtn loading={loading}>Continuer</SubmitBtn>
      </form>
    </AuthLayout>
  )
}

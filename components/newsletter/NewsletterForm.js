"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"

/** Shared with the home modal: once someone has signed up, never ask again. */
export const NL_KEY = "rzv:newsletter"

export const nlStore = {
  get() {
    try {
      return JSON.parse(window.localStorage.getItem(NL_KEY) || "null")
    } catch {
      return null
    }
  },
  set(v) {
    try {
      window.localStorage.setItem(NL_KEY, JSON.stringify(v))
    } catch {}
  },
}

/**
 * The newsletter sign-up: one field, one button.
 *
 * `source` records where the consent was given (footer | home_modal).
 * `tone="dark"` is for a dark surface whatever the theme.
 */
export default function NewsletterForm({ source = "footer", tone, autoFocus = false, onDone }) {
  const pathname = usePathname()
  const [email, setEmail] = useState("")
  const [state, setState] = useState("idle") // idle | busy | done | error
  const [msg, setMsg] = useState("")
  const dark = tone === "dark"

  const submit = async (e) => {
    e.preventDefault()
    if (state === "busy") return
    const form = e.currentTarget
    setState("busy")
    setMsg("")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source, page: pathname, website: form.website?.value || "" }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.message || "L’inscription a échoué — réessayez.")
      nlStore.set({ status: "subscribed", at: Date.now() })
      setState("done")
      onDone?.()
    } catch (err) {
      setState("error")
      setMsg(err.message || "L’inscription a échoué — réessayez.")
    }
  }

  if (state === "done") {
    return (
      <div className="nl-done" role="status" style={{ color: dark ? "#FFFFFF" : "var(--ink)" }}>
        <span className="nl-done-tick" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <span>
          <b>Merci, c’est noté !</b> Vous recevrez nos prochaines nouvelles à <b>{email.trim()}</b>.
        </span>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate={false} className={`nl-form ${dark ? "is-dark" : ""}`}>
      {/* Honeypot: invisible to people, irresistible to bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="nl-hp" />
      <label className="nl-field">
        <span className="sr-only">Votre adresse e-mail</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6h16v12H4z M4 7l8 6 8-6" />
        </svg>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="Votre adresse e-mail"
          value={email}
          autoFocus={autoFocus}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === "error") setState("idle")
          }}
          aria-invalid={state === "error" || undefined}
          aria-describedby={state === "error" ? `nl-err-${source}` : undefined}
        />
      </label>
      <button type="submit" className="nl-btn" disabled={state === "busy" || !email.trim()}>
        {state === "busy" ? "Inscription…" : "Je m’inscris"}
      </button>
      {state === "error" && (
        <div id={`nl-err-${source}`} className="nl-err" role="alert">
          {msg}
        </div>
      )}
    </form>
  )
}

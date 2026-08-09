"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../AuthProvider"

export const linkStyle = { color: "var(--gold-dark)", fontWeight: 700 }

/* Guest-only pages (login/register/forgot): send authenticated users away. */
export function useGuestOnly(to = "/compte") {
  const { user, ready } = useAuth()
  const router = useRouter()
  useEffect(() => { if (ready && user) router.replace(to) }, [ready, user, router, to])
  return ready && !!user
}

export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div style={{ minHeight: "calc(100vh - 210px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "44px 20px" }}>
      <div style={{ width: "100%", maxWidth: 432 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div className="serif" style={{ fontSize: 22, color: "var(--gold-dark)" }}>Rezervy</div>
          <div className="serif" style={{ fontSize: 27, marginTop: 12 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 7, lineHeight: 1.5 }}>{subtitle}</div>}
        </div>
        <div style={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 20, padding: "26px 24px", boxShadow: "0 18px 44px var(--shadow)" }}>
          {children}
        </div>
        {footer && <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 20 }}>{footer}</div>}
      </div>
    </div>
  )
}

export function ErrorMsg({ children }) {
  if (!children) return null
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(192,91,91,0.1)", border: "1px solid rgba(192,91,91,0.35)", borderRadius: 12, padding: "10px 12px", fontSize: 12.5, color: "var(--red)", fontWeight: 600, marginBottom: 14 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flex: "none", marginTop: 1 }}><circle cx="12" cy="12" r="10" /><path d="M12 8v5 M12 16h.01" /></svg>
      <span>{children}</span>
    </div>
  )
}

export function SuccessMsg({ children }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: "rgba(62,142,117,0.1)", border: "1px solid rgba(62,142,117,0.35)", borderRadius: 12, padding: "12px 13px", fontSize: 12.5, color: "var(--green)", fontWeight: 600 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", marginTop: 1 }}><path d="M20 6 9 17l-5-5" /></svg>
      <span>{children}</span>
    </div>
  )
}

const inputStyle = { width: "100%", background: "var(--bg)", border: "1px solid var(--line-2)", borderRadius: 11, padding: "12px 13px", fontSize: 14, color: "var(--ink)", outline: "none" }

export function Field({ label, rightLabel, type = "text", value, onChange, ...rest }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)" }}>{label}</span>
        <span style={{ flex: 1 }} />
        {rightLabel}
      </div>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} {...rest} />
    </label>
  )
}

export function PasswordField({ label, rightLabel, value, onChange, ...rest }) {
  const [show, setShow] = useState(false)
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-2)" }}>{label}</span>
        <span style={{ flex: 1 }} />
        {rightLabel}
      </div>
      <div style={{ position: "relative" }}>
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, paddingRight: 42 }} {...rest} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer" : "Afficher"} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: "var(--muted)", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {show
            ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z M9.9 4.2 20 20 M1 1l22 22" /></svg>
            : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>}
        </button>
      </div>
    </label>
  )
}

export function SubmitBtn({ loading, children }) {
  return (
    <button type="submit" disabled={loading} className="btn-gold" style={{ width: "100%", background: "var(--gold)", color: "#FDF8EF", border: "none", borderRadius: 12, padding: "13px", fontWeight: 800, fontSize: 14, cursor: loading ? "default" : "pointer", opacity: loading ? 0.75 : 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9 }}>
      {loading && <span className="auth-spin" style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(253,248,239,0.4)", borderTopColor: "#FDF8EF" }} />}
      {children}
    </button>
  )
}

export function Divider({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
      <span style={{ fontSize: 11.5, color: "var(--faint)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
    </div>
  )
}

export function GoogleButton({ onClick, loading, label = "Continuer avec Google" }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className="lift" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 11, background: "var(--card)", border: "1px solid var(--line-2)", borderRadius: 12, padding: "12px", fontSize: 14, fontWeight: 700, color: "var(--ink)", cursor: loading ? "default" : "pointer" }}>
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5c-2.1 1.5-4.7 2.5-7.6 2.5-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.5l6.5 5.5C41.4 36.5 44 30.8 44 24c0-1.3-.1-2.3-.4-3.5z" /></svg>
      {label}
    </button>
  )
}

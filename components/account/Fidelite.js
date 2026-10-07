"use client"
import Link from "next/link"
import { Card, H, dFull, useAccountFetch, LoadError } from "./shared"

/* ── Abonnements & fidélité ──────────────────────────────────────── */
/* ── One carnet a salon gave the client ───────────────────────────── */
const CARNET_STATUS = {
  active: { l: "Actif", c: "var(--green)", bg: "var(--green-soft)" },
  exhausted: { l: "Épuisé", c: "var(--muted)", bg: "var(--accent-soft)" },
  expired: { l: "Expiré", c: "var(--muted)", bg: "var(--accent-soft)" },
}

function CarnetCard({ m }) {
  const st = CARNET_STATUS[m.status] || CARNET_STATUS.active
  const running = m.status === "active"
  const pct = m.total ? Math.round(((m.total - m.left) / m.total) * 100) : 0
  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="serif" style={{ fontSize: 18 }}>{m.name}</div>
          <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 12px", background: st.bg, color: st.c }}>{st.l}</span>
          {m.offered && <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 999, padding: "4px 12px", background: "var(--line)", color: "var(--ink)" }}>Offert</span>}
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
            <b style={{ color: "var(--ink)" }}>{m.left}</b> / {m.total} séance{m.total > 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 4 }}>
          {m.salon ? <Link href={`/salon/${m.salon.slug}`} style={{ color: "var(--gold-dark)", fontWeight: 700 }}>{m.salon.name}</Link> : "Salon"}
          {m.status === "expired" ? ` · expiré le ${dFull(m.endsAt)}` : ` · valable jusqu'au ${dFull(m.endsAt)}`}
        </div>
        <div style={{ height: 5, background: "var(--line-soft)", borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--ink)", borderRadius: 99 }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          {m.credits.map((c) => {
            const canBook = running && c.left > 0 && m.salon
            return (
              <div key={c.serviceId} style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "var(--bg)", borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5 }}>{c.service}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {c.left} séance{c.left > 1 ? "s" : ""} restante{c.left > 1 ? "s" : ""} sur {c.qty}
                  </div>
                </div>
                {canBook ? (
                  <Link
                    href={`/salon/${m.salon.slug}/reserver?svc=${encodeURIComponent(c.serviceId)}&abo=${encodeURIComponent(m.id)}`}
                    className="btn-gold"
                    style={{ background: "var(--gold)", color: "var(--on-gold)", borderRadius: 10, padding: "9px 14px", fontWeight: 800, fontSize: 12.5, whiteSpace: "nowrap" }}
                  >
                    Réserver avec mon carnet
                  </Link>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--faint)" }}>{c.left <= 0 ? "Séances utilisées" : "Indisponible"}</span>
                )}
              </div>
            )
          })}
        </div>
        {!running && m.salon?.phone && (
          <div style={{ fontSize: 12.5, color: "var(--muted-2)", marginTop: 12, lineHeight: 1.55 }}>
            Pour un nouveau carnet, contactez {m.salon.name} ({m.salon.phone}).
          </div>
        )}
      </div>
    </Card>
  )
}

export function Fidelite() {
  const { data: ov, error: ovErr, reload: ovReload } = useAccountFetch("overview")
  const points = ov?.loyalty?.points ?? 0
  const visits = ov?.loyalty?.visits ?? 0
  const { data: mem } = useAccountFetch("memberships")
  const memberships = Array.isArray(mem) ? mem : []

  return (
    <>
      <H>Carnets & fidélité</H>
      {ovErr && <LoadError error={ovErr} reload={ovReload} />}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 14, marginTop: 4, minWidth: 0 }}>
        <div style={{ background: "var(--inverse-bg)", border: "1px solid var(--inverse-line)", borderRadius: 18, padding: 22, color: "#FFFFFF", minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.9)" }}>Points fidélité</div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8 }}>{points} <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>pts</span></div>
          {/* No reward is attached to the points yet — a progress bar to a
              "récompense" that nobody gives was a promise the site can't keep. */}
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 10, lineHeight: 1.55 }}>
            Vos points retracent vos visites. Aucune récompense n’y est encore associée : nous l’annoncerons ici le jour où ce sera le cas.
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.75)", marginTop: 10 }}>1 point par TND dépensé, crédité après chaque visite honorée · {visits} visite{visits > 1 ? "s" : ""}</div>
        </div>
        <Card style={{ padding: 22, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>Parrainage</div>
            <span style={{ fontSize: 10, fontWeight: 800, borderRadius: 999, padding: "2px 9px", background: "var(--accent-soft)", color: "var(--gold-dark)" }}>Bientôt disponible</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--muted-2)", lineHeight: 1.65, marginTop: 8 }}>
            Le programme de parrainage n’est pas encore ouvert. Nous l’annoncerons ici dès son lancement.
          </div>
        </Card>
      </div>

      <div style={{ fontWeight: 800, fontSize: 11, marginTop: 26, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mes carnets</div>
      {memberships.length === 0 ? (
        <Card style={{ marginTop: 10, padding: 22 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: "var(--muted)" }}>Aucun carnet</div>
          <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 6, lineHeight: 1.6 }}>
            Quand un salon vous vend ou vous offre un carnet de séances, il apparaît ici et vous réservez avec en un clic.
            Il est lié au numéro de téléphone de votre compte.
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 10 }}>
          {memberships.map((m) => <CarnetCard key={m.id} m={m} />)}
        </div>
      )}
    </>
  )
}

import PageShell from "@/components/PageShell"
import ContactCard from "@/components/ContactCard"

export const metadata = {
  title: "Nous contacter",
  description: "Une question ? Contactez l'équipe Rezervy par e-mail, téléphone ou via le formulaire. Réponse sous 24h.",
  alternates: { canonical: "/contact" },
}

const CHANNELS = [
  { t: "E-mail", d: "contact@rezervy.io", href: "mailto:contact@rezervy.io", icon: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6" },
  { t: "Téléphone", d: "+216 71 000 000", href: "tel:+21671000000", icon: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" },
  { t: "Adresse", d: "Rue du Lac, Les Berges du Lac, Tunis", href: null, icon: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" },
  { t: "Horaires", d: "Lun – Ven, 9h – 18h", href: null, icon: "M12 6v6l4 2 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" },
]

export default function ContactPage() {
  return (
    <PageShell
      title="Nous contacter"
      subtitle="Une question sur une réservation, un salon ou un partenariat ? Écrivez-nous — nous répondons sous 24h."
    >
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: 22, alignItems: "start" }} className="faq-grid">
        <div>
          {CHANNELS.map((c) => {
            const inner = (
              <>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(124,77,255,0.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={c.icon} /></svg>
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: 13.5 }}>{c.t}</span>
                  <span style={{ display: "block", fontSize: 13, color: "var(--muted)", marginTop: 1 }}>{c.d}</span>
                </span>
              </>
            )
            const style = { display: "flex", alignItems: "center", gap: 13, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, color: "var(--ink)" }
            return c.href ? <a key={c.t} href={c.href} className="lift" style={style}>{inner}</a> : <div key={c.t} style={style}>{inner}</div>
          })}
        </div>
        <ContactCard />
      </div>
    </PageShell>
  )
}

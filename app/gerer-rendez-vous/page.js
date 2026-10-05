import Link from "next/link"
import PageShell from "@/components/PageShell"

export const metadata = {
  title: "Gérer un rendez-vous",
  description: "Retrouvez, reprogrammez ou annulez vos rendez-vous Rezervy depuis votre compte.",
  alternates: { canonical: "/gerer-rendez-vous" },
  robots: { index: false, follow: true },
}

/* Every booking is made from a client account, so that is where it is managed —
   reschedule and cancel are real there. */
export default function GererRdvPage() {
  return (
    <PageShell title="Gérer un rendez-vous" subtitle="Vos rendez-vous sont dans votre compte : reprogrammez ou annulez-les en un clic.">
      <div style={{ maxWidth: 460, background: "var(--card)", border: "1px solid var(--line)", borderRadius: 18, padding: 24 }}>
        <Link
          href="/compte/rendez-vous"
          className="btn-gold"
          style={{ display: "block", textAlign: "center", background: "var(--gold)", color: "var(--on-gold)", borderRadius: 12, padding: 13, fontWeight: 800, fontSize: 14 }}
        >
          Voir mes rendez-vous
        </Link>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 14, lineHeight: 1.6 }}>
          Pas encore de compte ?{" "}
          <Link href="/inscription" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>
            Créez-le en une minute
          </Link>
          .
        </div>
      </div>
    </PageShell>
  )
}

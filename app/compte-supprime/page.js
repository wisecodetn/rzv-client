import Link from "next/link"
import PageShell from "@/components/PageShell"
import { pageMeta } from "@/lib/meta"

// Where account deletion lands: the account is gone, the visitor is told so
// in plain words. Not for search engines.
export const metadata = pageMeta({
  title: "Compte supprimé",
  description: "Votre compte Rezervy a été supprimé.",
  path: "/compte-supprime",
  robots: { index: false, follow: false },
})

export default function CompteSupprimePage() {
  return (
    <PageShell title="Votre compte a été supprimé" crumb="Compte supprimé" maxWidth={720}>
      <p style={{ fontSize: 14.5, color: "var(--muted-2)", lineHeight: 1.75, margin: 0 }}>
        Votre compte, vos favoris, vos demandes de liste d&apos;attente et votre inscription à la newsletter ont été
        effacés. Vos avis publiés restent visibles sous le nom « Anonyme ». Le détail de ce qui est conservé figure dans
        notre <Link href="/confidentialite#conservation" style={{ color: "var(--gold-dark)", fontWeight: 700 }}>politique de confidentialité</Link>.
      </p>
      <p style={{ marginTop: 22 }}>
        <Link href="/" className="btn-gold" style={{ display: "inline-block", background: "var(--gold)", color: "var(--on-gold)", borderRadius: 11, padding: "11px 22px", fontWeight: 800, fontSize: 13 }}>
          Retour à l&apos;accueil
        </Link>
      </p>
    </PageShell>
  )
}

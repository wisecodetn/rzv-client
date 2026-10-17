import PageShell from "@/components/PageShell"
import TarifsTabs from "@/components/TarifsTabs"
import JsonLd from "@/components/JsonLd"
import { breadcrumbLd } from "@/lib/jsonld"
import { pageMeta } from "@/lib/meta"
import { getSiteContent } from "@/lib/site-content"

const DEFAULT_TITLE = "Tarifs | Rezervy"
const DEFAULT_DESC = "Les tarifs de Rezervy : réservation gratuite pour les clientes, abonnements Rezervy Pro pour les salons de beauté en Tunisie."

// Meta title and description are edited in admin → Site client → Page Tarifs.
export async function generateMetadata() {
  const { tarifs } = await getSiteContent()
  return pageMeta({
    absoluteTitle: tarifs?.metaTitle || DEFAULT_TITLE,
    description: tarifs?.metaDescription || DEFAULT_DESC,
    path: "/tarifs",
  })
}

export default async function TarifsPage() {
  // Managed in admin → Site client → Tarifs; plan prices are the live ones.
  const { tarifs } = await getSiteContent()
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "Accueil", url: "/" }, { name: "Tarifs", url: "/tarifs" }])]} />
      <PageShell title={tarifs?.title || "Tarifs"} subtitle={tarifs?.subtitle}>
        {tarifs ? (
          <>
            <TarifsTabs tabs={tarifs.tabs} />
            {tarifs.footnote && <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 8 }}>{tarifs.footnote}</p>}
          </>
        ) : (
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Les tarifs sont momentanément indisponibles. Réessayez dans quelques instants.</p>
        )}
      </PageShell>
    </>
  )
}

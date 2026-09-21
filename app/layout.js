import "./globals.css"
import Script from "next/script"
import { Barlow } from "next/font/google"
import { SITE } from "@/lib/site"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import JsonLd from "@/components/JsonLd"
import { AuthProvider } from "@/components/AuthProvider"
import { FavoritesProvider } from "@/components/FavoritesProvider"
import { CatalogProvider } from "@/components/CatalogProvider"
import A11ySweeper from "@/components/A11ySweeper"
import { getCatalog } from "@/lib/data"
import { organizationLd, websiteLd } from "@/lib/jsonld"

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`

const serif = Barlow({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-serif", display: "swap" })
const sans = Barlow({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-sans", display: "swap" })

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  keywords: ["réservation coiffeur Tunisie", "salon beauté Tunis", "barbier", "onglerie", "spa", "rendez-vous en ligne"],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    url: SITE.url,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    site: SITE.twitter,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#7C4DFF" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
}

export default async function RootLayout({ children }) {
  const catalog = await getCatalog()
  const catalogValue = { nodeBySlug: catalog.nodeBySlug, categories: catalog.categories, cities: catalog.cities }
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <body>
        {/* Applies the stored theme before hydration so there's no flash of the
            wrong palette. A raw <script> isn't executed on client navigation —
            next/script + beforeInteractive is the supported way to inline it. */}
        <Script id="rzv-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <A11ySweeper />
        <CatalogProvider value={catalogValue}>
          <AuthProvider>
            <FavoritesProvider>
              <Navbar />
              <main style={{ flex: 1, width: "100%" }}>{children}</main>
              <Footer />
            </FavoritesProvider>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  )
}

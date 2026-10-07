import "./globals.css"
import { Barlow } from "next/font/google"
import { SITE } from "@/lib/site"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import JsonLd from "@/components/JsonLd"
import { AuthProvider } from "@/components/AuthProvider"
import { FavoritesProvider } from "@/components/FavoritesProvider"
import { CatalogProvider } from "@/components/CatalogProvider"
import NavigationLoader from "@/components/NavigationLoader"
import AssistantLauncher from "@/components/assistant/AssistantLauncher"
import { getCatalog, getCoverage } from "@/lib/data"
import { getSiteContent, socialUrls } from "@/lib/site-content"
import { organizationLd, websiteLd } from "@/lib/jsonld"

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`

// One Barlow instance for everything (the "serif" class is the same family —
// two identical instances doubled the @font-face rules on every page).
const sans = Barlow({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-sans", display: "swap" })

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  // Only what every page shares. Titles, URLs, canonicals and robots are per
  // page (lib/meta.js pageMeta): set here, they were inherited by any page that
  // set none — so pages were shared with the home title and a "/" canonical.
  openGraph: { type: "website", locale: SITE.locale, siteName: SITE.name },
  twitter: { card: "summary_large_image" },
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
}

export default async function RootLayout({ children }) {
  const [catalog, { social }, coverage] = await Promise.all([getCatalog(), getSiteContent(), getCoverage()])
  // What client components read, nothing more — this is serialised into every
  // page. Cities carry their real salon count (the dropdowns showed
  // "{total} salons" with no total at all).
  const catalogValue = {
    nodeBySlug: Object.fromEntries(
      Object.entries(catalog.nodeBySlug).map(([k, n]) => [k, { slug: n.slug, name: n.name, lower: n.lower, top: n.top, isTop: n.isTop, parentSlug: n.parentSlug, childrenSlugs: n.childrenSlugs }]),
    ),
    categories: catalog.categories.map((c) => ({ slug: c.slug, name: c.name, subs: c.subs })),
    cities: catalog.cities.map((c) => ({ slug: c.slug, name: c.name, total: coverage.cities[c.slug] || 0 })),
  }
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning className={sans.variable}>
      <body>
        {/* Pre-paint script. A plain inline <script>, first in <body>: the
            browser runs it before painting anything below — so the right
            palette is decided before the first frame. (next/script
            "beforeInteractive" only queues it for Next's bootstrap, which runs
            after the page has already painted.) Client navigations keep the
            attribute it sets. No first-visit splash: it hid the page from real
            visitors for up to ~1.4 s while lab tools never saw it. */}
        <script id="rzv-theme" dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* First Tab on any page: jump past the navbar and its mega-menu. */}
        <a href="#contenu" className="skip-link">Aller au contenu</a>
        <JsonLd data={[organizationLd(socialUrls(social)), websiteLd()]} />
        {/* Browser-only page-to-page loader — renders nothing on the server. */}
        <NavigationLoader />
        <CatalogProvider value={catalogValue}>
          <AuthProvider>
            <FavoritesProvider>
              <Navbar />
              <main id="contenu" tabIndex={-1} style={{ flex: 1, width: "100%", outline: "none" }}>{children}</main>
              <Footer />
              {/* Browser-only, mounted once the page is idle: absent from the server HTML. */}
              <AssistantLauncher />
            </FavoritesProvider>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  )
}

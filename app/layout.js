import "./globals.css"
import { Barlow } from "next/font/google"
import { SITE } from "@/lib/site"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import JsonLd from "@/components/JsonLd"
import { AuthProvider } from "@/components/AuthProvider"
import { FavoritesProvider } from "@/components/FavoritesProvider"
import { CatalogProvider } from "@/components/CatalogProvider"
import A11ySweeper from "@/components/A11ySweeper"
import NavigationLoader from "@/components/NavigationLoader"
import AssistantBubble from "@/components/assistant/AssistantBubble"
import { LogoMark } from "@/components/brand/Logo"
import { getCatalog } from "@/lib/data"
import { organizationLd, websiteLd } from "@/lib/jsonld"

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches)?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`

/* First-load splash — decided before the first paint, SEO-safe:
   - shown once per visit (sessionStorage), never to bots or speed-testing tools;
   - the page is fully in the HTML underneath; the splash is only a layer on top;
   - JS lifts it when the page has loaded (after a short minimum so it does not
     flash), CSS lifts it on its own after ~1.4 s even if no script ever runs;
   - without JS at all it never shows (it is display:none unless this script
     adds .rzv-splash-on). */
const SPLASH_SCRIPT = `(function(){var d=document.documentElement;try{var ua=navigator.userAgent||'';if(/bot|crawl|spider|slurp|lighthouse|pagespeed|gtmetrix|headless|facebookexternalhit|whatsapp|preview/i.test(ua)||sessionStorage.getItem('rzv-splash')){return}sessionStorage.setItem('rzv-splash','1')}catch(e){return}d.classList.add('rzv-splash-on');var t0=Date.now(),off=false;function done(){if(off)return;off=true;setTimeout(function(){d.classList.add('rzv-splash-done')},Math.max(0,500-(Date.now()-t0)))}if(document.readyState==='complete')done();else window.addEventListener('load',done,{once:true});setTimeout(done,1200)})()`

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
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
}

export default async function RootLayout({ children }) {
  const catalog = await getCatalog()
  const catalogValue = { nodeBySlug: catalog.nodeBySlug, categories: catalog.categories, cities: catalog.cities }
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning className={`${serif.variable} ${sans.variable}`}>
      <body>
        {/* Pre-paint scripts. Plain inline <script>s, first in <body>: the
            browser runs them before painting anything below — so the right
            palette and the splash are decided before the first frame.
            (next/script "beforeInteractive" only queues them for Next's
            bootstrap, which runs after the page has already painted.) They
            only matter on the first document load; client navigations keep
            the html attributes they set. */}
        <script id="rzv-theme" dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script id="rzv-splash-init" dangerouslySetInnerHTML={{ __html: SPLASH_SCRIPT }} />
        {/* First-load splash: a logo-only layer over the page (no text, hidden
            from assistive tech). Inert unless SPLASH_SCRIPT switches it on. */}
        <div id="rzv-splash" aria-hidden="true">
          <div className="rzv-splash-inner">
            <span className="rzv-mark-loop"><LogoMark size={58} animate /></span>
            <span className="rzv-splash-bar" />
          </div>
        </div>
        <JsonLd data={[organizationLd(), websiteLd()]} />
        <A11ySweeper />
        {/* Browser-only page-to-page loader — renders nothing on the server. */}
        <NavigationLoader />
        <CatalogProvider value={catalogValue}>
          <AuthProvider>
            <FavoritesProvider>
              <Navbar />
              <main style={{ flex: 1, width: "100%" }}>{children}</main>
              <Footer />
              {/* Browser-only, mounted once the page is idle: absent from the server HTML. */}
              <AssistantBubble />
            </FavoritesProvider>
          </AuthProvider>
        </CatalogProvider>
      </body>
    </html>
  )
}

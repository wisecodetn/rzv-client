import { SITE } from "./site"

const DEFAULT_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: SITE.name }

/**
 * Search engines show about 160 characters of a description and cut the rest
 * mid-word. Built descriptions (city pages with their figures) and ones typed
 * in the back-office (blog excerpts) both run long, so the cut is made here,
 * at a word, with an ellipsis.
 */
export function clampDescription(text, max = 160) {
  const t = String(text ?? "").replace(/\s+/g, " ").trim()
  if (t.length <= max) return t || undefined
  const cut = t.slice(0, max - 1)
  const at = cut.lastIndexOf(" ")
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.—-]+$/, "")}…`
}

/**
 * One page's metadata, complete: title, description, canonical, Open Graph and
 * X card together. Next merges metadata shallowly — a page that sets no
 * `openGraph`/`twitter` inherits the layout's whole object — so salon, blog
 * and static pages used to be shared with the HOME title and URL. Every
 * indexable page goes through this instead.
 *
 * `title` is templated by the root layout ("%s · Rezervy"); pass
 * `absoluteTitle` for a title used as-is (the home page).
 * `ownImage`: the route has its own opengraph-image file — an explicit image
 * here would override it, so none is set.
 */
export function pageMeta({ title, absoluteTitle, description: raw, path, type = "website", robots, keywords, og, ownImage = false }) {
  const shared = absoluteTitle || `${title} · ${SITE.name}`
  const description = clampDescription(raw)
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    ...(keywords ? { keywords } : {}),
    ...(robots ? { robots } : {}),
    openGraph: {
      type,
      locale: SITE.locale,
      siteName: SITE.name,
      title: shared,
      description,
      ...(path ? { url: `${SITE.url}${path}` } : {}),
      // The site-wide card (app/opengraph-image.js): Next attaches it only to
      // pages that set no openGraph at all, so it is restated here.
      ...(ownImage ? {} : { images: [DEFAULT_IMAGE] }),
      ...og,
    },
    twitter: { card: "summary_large_image", title: shared, description, ...(ownImage ? {} : { images: [DEFAULT_IMAGE] }) },
  }
}

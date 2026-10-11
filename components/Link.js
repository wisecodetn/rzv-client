import NextLink from "next/link"
import { titleOf } from "@/lib/link-title"

/**
 * next/link with a `title` on every link — imported everywhere instead of
 * next/link (`import Link from "@/components/Link"`).
 *
 * The title is the link's own visible words (or its aria-label) unless one is
 * given: SEO audits flag links without one, and on cards and icons it shows
 * where the link goes on hover. Decorative glyphs (→ ‹ ★ …) are left out.
 */
export default function Link({ title, children, ...props }) {
  const t = title ?? (titleOf(children) || props["aria-label"] || undefined)
  return (
    <NextLink {...props} title={t}>
      {children}
    </NextLink>
  )
}

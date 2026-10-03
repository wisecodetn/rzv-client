import { MARK } from "./mark"

/**
 * The Rezervy logo: the mark, optionally followed by the wordmark.
 *
 * Drawn in `currentColor`, so it follows the text colour — near-black on the
 * light theme, white on the dark one — with no second asset to keep in sync.
 *
 * `animate` plays a short entrance (the body settles, the dot drops into
 * place) and a small nudge of the dot on hover. Both are pure CSS
 * (globals.css → .rzv-logo) and switched off under prefers-reduced-motion.
 */
export function LogoMark({ size = 28, animate = false, title, style }) {
  return (
    <svg
      viewBox={MARK.viewBox}
      width={Math.round(size * MARK.ratio * 10) / 10}
      height={size}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={animate ? "rzv-mark rzv-mark-anim" : "rzv-mark"}
      style={{ display: "block", flex: "none", overflow: "visible", ...style }}
    >
      <path className="rzv-mark-body" d={MARK.body} />
      <path className="rzv-mark-dot" d={MARK.dot} />
    </svg>
  )
}

export default function Logo({ size = 26, wordmark = true, animate = false, wordSize, gap, color = "var(--ink)", style }) {
  return (
    <span
      className="rzv-logo"
      style={{ display: "inline-flex", alignItems: "center", gap: gap ?? Math.round(size * 0.38), color, lineHeight: 1, ...style }}
    >
      <LogoMark size={size} animate={animate} title={wordmark ? undefined : "Rezervy"} />
      {wordmark && (
        <span className="serif" style={{ fontSize: wordSize ?? Math.round(size * 0.88), letterSpacing: "0.01em" }}>
          Rezervy
        </span>
      )}
    </span>
  )
}

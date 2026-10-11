import { Children, isValidElement } from "react"

/** The plain text inside a JSX tree, as a short title (no markup, no arrows). */
export function titleOf(node) {
  const text = textOf(node)
    .replace(/[→←↓↑‹›«»★☆✓×▲▼·•]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return text.length > 110 ? `${text.slice(0, 107).replace(/\s+\S*$/, "")}…` : text
}

function textOf(node) {
  if (node == null || typeof node === "boolean") return ""
  if (typeof node === "string" || typeof node === "number") return ` ${node} `
  if (Array.isArray(node)) return node.map(textOf).join("")
  if (isValidElement(node)) {
    const p = node.props || {}
    if (p["aria-hidden"] === true || p["aria-hidden"] === "true") return ""
    // An image inside a link speaks through its alt text.
    const own = typeof p.alt === "string" ? p.alt : ""
    return own || Children.toArray(p.children).map(textOf).join("")
  }
  return ""
}

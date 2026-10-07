/** "smooth" unless the visitor asked their system to reduce motion. */
export const scrollBehavior = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"

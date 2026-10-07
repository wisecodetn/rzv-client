import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

// Next's recommended rules (React, hooks, accessibility, Core Web Vitals).
// `next lint` is gone in Next 16 — run `npm run lint` (plain ESLint).
export default defineConfig([
  ...nextVitals,
  {
    rules: {
      // French copy is full of apostrophes; React renders them fine as text.
      "react/no-unescaped-entities": "off",
      // React-Compiler-era advice. The existing effects that reset state on a
      // prop change are intentional; tracked as warnings, cleaned up over time.
      "react-hooks/set-state-in-effect": "warn",
      // No type checker in this JS project: an undefined name (a forgotten
      // import) would otherwise only surface as a crash in the browser.
      "no-undef": "error",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**", "next-env.d.ts"]),
])

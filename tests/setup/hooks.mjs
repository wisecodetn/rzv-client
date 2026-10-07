// Node resolve hook so plain `node --test` can load the app's modules as Next
// does: the "@/" alias (jsconfig) and extensionless relative imports.
import { pathToFileURL, fileURLToPath } from "node:url"
import { existsSync } from "node:fs"
import path from "node:path"

const ROOT = path.resolve(fileURLToPath(new URL("../..", import.meta.url)))

export async function resolve(specifier, context, next) {
  let spec = specifier
  if (spec.startsWith("@/")) spec = pathToFileURL(path.join(ROOT, spec.slice(2))).href
  // next/server, next/navigation…: Next's own bundler resolves these; plain
  // Node ESM needs the file name (the package has no "exports" map for them).
  if (/^next\/[a-z-]+$/.test(spec)) spec = `${spec}.js`
  const isPath = spec.startsWith("./") || spec.startsWith("../") || spec.startsWith("file:")
  if (isPath && !path.extname(spec.replace(/^file:\/\/\//, ""))) {
    const base = spec.startsWith("file:") ? fileURLToPath(spec) : fileURLToPath(new URL(spec, context.parentURL))
    for (const ext of [".js", ".mjs", "/index.js"]) {
      if (existsSync(base + ext)) return next(pathToFileURL(base + ext).href, context)
    }
  }
  return next(spec, context)
}

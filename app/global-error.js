"use client" // Error boundaries must be Client Components

/**
 * Last resort: the root layout itself failed (e.g. the catalog could not be
 * loaded). This replaces the whole document, so it carries its own <html>,
 * styles and colour scheme — globals.css and the theme script don't reach it.
 */
const CSS = `
:root{color-scheme:light dark;--bg:#ffffff;--ink:#111111;--muted:#666666;--btn:#111111;--on-btn:#ffffff}
@media (prefers-color-scheme:dark){:root{--bg:#121212;--ink:#f2f2f2;--muted:#a3a3a3;--btn:#ffffff;--on-btn:#111111}}
body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:560px;margin:0 auto;padding:80px 16px;text-align:center}
h1{font-size:28px;font-weight:600;margin:0}
p{color:var(--muted);font-size:15px;line-height:1.65;margin:12px 0 0}
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:24px}
button,a{border-radius:12px;padding:13px 24px;font-weight:700;font-size:14px;text-decoration:none;cursor:pointer}
button{background:var(--btn);color:var(--on-btn);border:none}
a{border:1px solid var(--muted);color:var(--ink)}
small{display:block;color:var(--muted);font-size:11px;margin-top:22px}
`

export default function GlobalError({ error, unstable_retry }) {
  return (
    <html lang="fr">
      <body>
        <title>Un problème est survenu · Rezervy</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <main role="alert">
          <h1>Rezervy est momentanément indisponible</h1>
          <p>Le site n&apos;a pas pu se charger. Réessayez dans quelques instants — vos réservations ne sont pas affectées.</p>
          <div className="row">
            <button type="button" onClick={() => unstable_retry()}>Réessayer</button>
            {/* A full reload, not client navigation: the app shell is what failed. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/">Accueil</a>
          </div>
          {error?.digest && <small>Référence : {error.digest}</small>}
        </main>
      </body>
    </html>
  )
}

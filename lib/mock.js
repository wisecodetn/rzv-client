/**
 * Static marketplace data (ported from the Rezervy Client design). It drives the
 * server-rendered, SEO-friendly pages and the JSON-LD. No backend: everything is
 * generated at build time, which is ideal for search indexing.
 */

export const slugify = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ & /g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

/* ── Categories ─────────────────────────────────────────────── */
/* Category tree — categories and prestations share one model, up to 3 levels
   (category → prestation → sous-prestation). Every node is routable at
   /[slug]/[city]; a node's badges are its children. Slugs are globally unique
   so URLs stay flat (/coiffure/tunis → /balayage/tunis → /balayage-blond/tunis). */
const CATEGORY_TREE = [
  { name: "Coiffure", slug: "coiffure", lower: "coiffure", schema: "HairSalon", children: [
    { name: "Coupe & brushing", children: ["Coupe femme", "Coupe enfant", "Frange", "Coupe dégradée"] },
    { name: "Coloration", children: ["Coloration racines", "Coloration complète", "Patine gloss", "Mèches couleur"] },
    { name: "Balayage", children: ["Balayage blond", "Ombré hair", "Balayage caramel", "Tie and dye"] },
    { name: "Brushing", children: ["Brushing lisse", "Brushing bouclé", "Brushing volume"] },
    { name: "Lissage", children: ["Lissage brésilien", "Lissage kératine", "Défrisage"] },
    { name: "Coiffure mariée", children: ["Essai mariée", "Chignon mariée", "Attache & accessoires"] },
  ]},
  { name: "Barbier", slug: "barbier", lower: "barbier", schema: "HairSalon", children: [
    { name: "Coupe homme", children: ["Coupe ciseaux", "Dégradé américain", "Coupe & barbe"] },
    { name: "Taille de barbe", children: ["Contour barbe", "Barbe au rasoir", "Barbe & soin"] },
    { name: "Rasage traditionnel", children: ["Rasage serviette chaude", "Rasage crâne"] },
    { name: "Soin visage homme", children: ["Gommage homme", "Masque purifiant", "Soin anti-âge homme"] },
  ]},
  { name: "Onglerie", slug: "onglerie", lower: "onglerie", schema: "NailSalon", children: [
    { name: "Pose gel", children: ["Gel naturel", "French gel", "Gel couleur"] },
    { name: "Vernis semi-permanent", children: ["Semi pose", "Semi dépose & pose", "Semi & nail art"] },
    { name: "Manucure", children: ["Manucure classique", "Manucure russe", "Manucure spa"] },
    { name: "Pédicure", children: ["Pédicure classique", "Pédicure spa", "Beauté des pieds"] },
    { name: "Nail art", children: ["Déco simple", "Strass & bijoux", "Design complet"] },
  ]},
  { name: "Spa & Massage", slug: "spa-massage", lower: "spa & massage", schema: "DaySpa", children: [
    { name: "Massage relaxant", children: ["Massage californien", "Massage aux huiles", "Dos & nuque"] },
    { name: "Deep tissue", children: ["Massage sportif", "Massage décontractant", "Points de tension"] },
    { name: "Hammam", children: ["Hammam traditionnel", "Gommage noir", "Rituel hammam"] },
    { name: "Gommage", children: ["Gommage corps", "Gommage & enveloppement"] },
  ]},
  { name: "Esthétique", slug: "esthetique", lower: "esthétique", schema: "BeautySalon", children: [
    { name: "Soin visage", children: ["Nettoyage profond", "Soin hydratant", "Soin anti-âge"] },
    { name: "Épilation", children: ["Épilation cire", "Épilation sourcils", "Épilation intégrale"] },
    { name: "Maquillage", children: ["Maquillage jour", "Maquillage soirée", "Maquillage mariée"] },
    { name: "Extension de cils", children: ["Cil à cil", "Volume russe", "Rehaussement de cils"] },
  ]},
]

const _catNodes = {}
function _addCat(def, parentSlug, top, l1Name, depth, schema) {
  const name = typeof def === "string" ? def : def.name
  const slug = (typeof def === "object" && def.slug) || slugify(name)
  const node = {
    slug, name, lower: (typeof def === "object" && def.lower) || name.toLowerCase(), schema,
    parentSlug, top, depth, isTop: depth === 0,
    l1: depth === 0 ? null : (l1Name || name),
    childrenSlugs: [],
  }
  _catNodes[slug] = node
  const kids = (typeof def === "object" && def.children) || []
  node.childrenSlugs = kids.map((k) => {
    const childL1 = depth === 0 ? (typeof k === "string" ? k : k.name) : node.l1
    return _addCat(k, slug, top, childL1, depth + 1, schema).slug
  })
  return node
}
CATEGORY_TREE.forEach((c) => _addCat(c, null, c.slug, null, 0, c.schema))

// Top-level list kept for home / navbar / footer (with `subs` names for compat).
export const CATEGORIES = CATEGORY_TREE.map((c) => ({
  slug: c.slug, name: c.name, lower: c.lower, schema: c.schema, subs: c.children.map((ch) => ch.name),
}))
export const ALL_CATEGORIES = Object.values(_catNodes)
export const INDEXED_CATEGORIES = ALL_CATEGORIES.filter((n) => n.depth <= 1) // pre-rendered; deeper nodes render on demand
export const getCategory = (slug) => _catNodes[slug] || null
export const categoryChildren = (slug) => (_catNodes[slug]?.childrenSlugs || []).map((s) => _catNodes[s])
export const categoryParent = (slug) => { const p = _catNodes[slug]?.parentSlug; return p ? _catNodes[p] : null }

/* ── Cities (name, slug, home count, per-category count/price/rate) ─ */
const CITY_DEFS = [
  { name: "Tunis", total: 124, cat: 48, from: 18, rate: "4,8" },
  { name: "La Marsa", total: 38, cat: 16, from: 25, rate: "4,9" },
  { name: "Sousse", total: 67, cat: 24, from: 15, rate: "4,7" },
  { name: "Sfax", total: 54, cat: 19, from: 15, rate: "4,7" },
  { name: "Nabeul", total: 29, cat: 11, from: 12, rate: "4,6" },
  { name: "Bizerte", total: 22, cat: 8, from: 12, rate: "4,7" },
  { name: "Monastir", total: 26, cat: 9, from: 15, rate: "4,8" },
  { name: "Djerba", total: 19, cat: 7, from: 20, rate: "4,8" },
  { name: "Kairouan", total: 14, cat: 6, from: 14, rate: "4,6" },
  { name: "Gabès", total: 12, cat: 5, from: 14, rate: "4,6" },
  { name: "Sidi Bou Saïd", total: 11, cat: 4, from: 30, rate: "4,9" },
]
export const CITIES = CITY_DEFS.map((c) => ({ ...c, slug: slugify(c.name) }))
export const getCity = (slug) => CITIES.find((c) => c.slug === slug)

/* ── Staff + service + review building blocks ──────────────────── */
const STAFF = {
  a: { id: "a", n: "Amira Ben Salah", r: "Coiffeuse & coloriste", c: "#D4A874", ini: "AB" },
  k: { id: "k", n: "Khalil Mansour", r: "Barbier", c: "#7E9CD8", ini: "KM" },
  s: { id: "s", n: "Salma Trabelsi", r: "Esthéticienne", c: "#5FBF9F", ini: "ST" },
  n: { id: "n", n: "Nour Gharbi", r: "Prothésiste ongulaire", c: "#E0A3B0", ini: "NG" },
  m: { id: "m", n: "Mehdi Ayari", r: "Massothérapeute", c: "#B7A5E0", ini: "MA" },
  l: { id: "l", n: "Leïla Fourati", r: "Coloriste", c: "#C9A98F", ini: "LF" },
}
const grp = (cat, rows, who) => ({ cat, rows: rows.map((r) => ({ ...r, who })) })
const SVC = {
  coiffure: () => grp("Coiffure", [
    { n: "Coupe & brushing", d: "1h", m: 60, p: 60 },
    { n: "Coloration complète", d: "2h", m: 120, p: 140 },
    { n: "Balayage", d: "2h30", m: 150, p: 180 },
    { n: "Brushing", d: "45 min", m: 45, p: 35 },
    { n: "Coiffure mariée", d: "4h", m: 240, p: 450 },
  ], ["a", "l"]),
  barbier: () => grp("Barbier", [
    { n: "Coupe homme", d: "30 min", m: 30, p: 25 },
    { n: "Coupe + barbe", d: "45 min", m: 45, p: 40 },
    { n: "Taille de barbe", d: "20 min", m: 20, p: 15 },
    { n: "Rasage traditionnel", d: "30 min", m: 30, p: 30 },
  ], ["k"]),
  onglerie: () => grp("Onglerie", [
    { n: "Pose gel", d: "1h30", m: 90, p: 80 },
    { n: "Vernis semi-permanent", d: "45 min", m: 45, p: 45 },
    { n: "Manucure classique", d: "45 min", m: 45, p: 35 },
    { n: "Nail art", d: "1h15", m: 75, p: 55 },
  ], ["n"]),
  spa: () => grp("Spa & Soins", [
    { n: "Soin visage hydratant", d: "1h", m: 60, p: 90 },
    { n: "Massage relaxant 60 min", d: "1h", m: 60, p: 110 },
    { n: "Hammam & gommage", d: "1h", m: 60, p: 75 },
  ], ["s", "m"]),
  esthetique: () => grp("Esthétique", [
    { n: "Soin visage anti-âge", d: "1h15", m: 75, p: 95 },
    { n: "Épilation complète", d: "1h", m: 60, p: 50 },
    { n: "Maquillage", d: "1h", m: 60, p: 80 },
  ], ["s"]),
}
const REV = {
  yasmine: [
    { n: "Rania M.", starsNum: 5, date: "il y a 3 jours", txt: "Balayage magnifique avec Amira, exactement la photo que j'avais montrée. Salon impeccable, thé offert." },
    { n: "Omar C.", starsNum: 5, date: "il y a 1 semaine", txt: "Khalil est le meilleur barbier de la région. Réservation en 30 secondes, aucun temps d'attente." },
    { n: "Syrine B.", starsNum: 4, date: "il y a 2 semaines", txt: "Très bon soin visage avec Salma. Petit retard de 10 minutes, mais le résultat en valait la peine." },
  ],
  atelier: [
    { n: "Meriem K.", starsNum: 5, date: "il y a 5 jours", txt: "Le meilleur balayage du centre-ville, sans hésiter." },
    { n: "Nadia F.", starsNum: 5, date: "il y a 2 semaines", txt: "Équipe très pro, salon impeccable." },
    { n: "Ines G.", starsNum: 4, date: "il y a 3 semaines", txt: "Bon rapport qualité-prix." },
  ],
  lounge: [
    { n: "Sarra L.", starsNum: 5, date: "il y a 1 semaine", txt: "Cadre magnifique aux Berges du Lac, coloration parfaite." },
    { n: "Emna R.", starsNum: 5, date: "il y a 2 semaines", txt: "Ma coiffure de mariée était un rêve. Merci !" },
    { n: "Dorra H.", starsNum: 4, date: "il y a 1 mois", txt: "Très bien, parking facile." },
  ],
  nour: [
    { n: "Fatma B.", starsNum: 5, date: "il y a 4 jours", txt: "Rapide, efficace et pas cher. Parfait pour un brushing." },
    { n: "Olfa M.", starsNum: 4, date: "il y a 2 semaines", txt: "Bon salon de quartier, équipe adorable." },
  ],
  coiffelle: [
    { n: "Hela J.", starsNum: 5, date: "il y a 1 semaine", txt: "Lissage impeccable qui tient très bien." },
    { n: "Mouna A.", starsNum: 4, date: "il y a 3 semaines", txt: "Bon accueil, prix corrects." },
  ],
  barber: [
    { n: "Wassim N.", starsNum: 5, date: "il y a 2 jours", txt: "Dégradé parfait, ambiance au top. Le rendez-vous en ligne change la vie." },
    { n: "Aymen T.", starsNum: 5, date: "il y a 1 semaine", txt: "Rasage traditionnel serviette chaude — un vrai moment." },
  ],
  studio: [
    { n: "Ghada B.", starsNum: 5, date: "il y a 6 jours", txt: "Pose gel nickel, tenue plus de 3 semaines. Nail art superbe." },
    { n: "Rim S.", starsNum: 4, date: "il y a 3 semaines", txt: "Très propre, prothésiste minutieuse." },
  ],
  spa: [
    { n: "Leïla M.", starsNum: 5, date: "il y a 3 jours", txt: "Hammam et gommage divins, cadre de Sidi Bou Saïd sublime." },
    { n: "Yosr K.", starsNum: 5, date: "il y a 2 semaines", txt: "Massage aux pierres chaudes, je flottais en sortant." },
  ],
}

/** openingHoursSpecification (schema.org) — standard week, Sunday closed. */
const HOURS_SCHEMA = (satEnd = "20:00") => [
  { days: ["Monday", "Tuesday", "Thursday", "Friday"], opens: "09:00", closes: "19:00" },
  { days: ["Wednesday"], opens: "09:00", closes: "13:00" },
  { days: ["Wednesday"], opens: "14:30", closes: "19:00" },
  { days: ["Saturday"], opens: "09:00", closes: satEnd },
]
const HOURS_DISPLAY = (satEnd = "20h00") => [
  { d: "Lun – Ven", h: "9h00 – 19h00", c: "var(--ink)" },
  { d: "Mercredi", h: "pause 13h – 14h30", c: "var(--muted)" },
  { d: "Samedi", h: `9h00 – ${satEnd}`, c: "var(--ink)" },
  { d: "Dimanche", h: "Fermé", c: "var(--faint)" },
]

const staffList = (ids) => ids.map((id) => STAFF[id])

/* ── Salons ─────────────────────────────────────────────────── */
const RAW_SALONS = [
  {
    name: "Maison Yasmine — Beauté & Spa", kind: "Beauté & Spa", primary: "coiffure",
    categories: ["coiffure", "barbier", "onglerie", "spa-massage", "esthetique"],
    city: "La Marsa", area: "La Marsa", address: "14, rue du Lac Léman", geo: { lat: 36.8781, lng: 10.3247 },
    rate: "4,9", rev: 214, from: 25, phone: "+216 71 745 210", instagram: "@maisonyasmine.tn",
    tags: ["Coupe & brushing", "Coloration", "Balayage", "Coiffure mariée"], amenities: { dep: 1, dom: 0, park: 1, fem: 1 }, avail: 1,
    groups: ["coiffure", "barbier", "onglerie", "spa"], staff: ["a", "k", "s", "n", "m"], reviews: "yasmine",
    desc: "Salon de beauté premium à La Marsa : coiffure, barbier, onglerie et spa réunis. Équipe d'expert·e·s, produits professionnels, réservation en ligne 24h/24.",
  },
  {
    name: "L'Atelier du Cheveu", kind: "Coiffure", primary: "coiffure", categories: ["coiffure"],
    city: "Tunis", area: "Centre-ville", address: "27, av. Habib Bourguiba", geo: { lat: 36.8008, lng: 10.1817 },
    rate: "4,8", rev: 158, from: 30, phone: "+216 71 250 118", instagram: "@atelierducheveu",
    tags: ["Coupe & brushing", "Balayage", "Lissage"], amenities: { dep: 1, dom: 0, park: 0, fem: 0 }, avail: 1,
    groups: ["coiffure"], staff: ["a", "l"], reviews: "atelier",
    desc: "Atelier de coiffure au cœur de Tunis, spécialiste du balayage et du lissage. Coloristes expérimentées, ambiance boutique.",
  },
  {
    name: "Beauty Lounge Lac 2", kind: "Coiffure & Beauté", primary: "coiffure", categories: ["coiffure", "esthetique"],
    city: "Tunis", area: "Les Berges du Lac", address: "Rue du Lac Turkana", geo: { lat: 36.8422, lng: 10.256 },
    rate: "4,8", rev: 96, from: 35, phone: "+216 71 960 240", instagram: "@beautyloungelac2",
    tags: ["Coloration", "Balayage", "Coiffure mariée"], amenities: { dep: 1, dom: 1, park: 1, fem: 1 }, avail: 0,
    groups: ["coiffure", "esthetique"], staff: ["l", "s"], reviews: "lounge",
    desc: "Lounge beauté haut de gamme aux Berges du Lac : coloration, coiffure de mariée et soins visage. Service à domicile disponible.",
  },
  {
    name: "Salon Nour El Ain", kind: "Coiffure", primary: "coiffure", categories: ["coiffure"],
    city: "Tunis", area: "Lafayette", address: "12, rue de Marseille", geo: { lat: 36.8625, lng: 10.1956 },
    rate: "4,7", rev: 122, from: 20, phone: "+216 71 331 902", instagram: "@nourelain.salon",
    tags: ["Coupe & brushing", "Brushing"], amenities: { dep: 0, dom: 1, park: 0, fem: 1 }, avail: 1,
    groups: ["coiffure"], staff: ["a"], reviews: "nour",
    desc: "Salon de quartier chaleureux à Lafayette, réputé pour ses brushings rapides et son excellent rapport qualité-prix.",
  },
  {
    name: "Coiff'Elle Menzah", kind: "Coiffure", primary: "coiffure", categories: ["coiffure"],
    city: "Tunis", area: "Menzah 6", address: "Av. Hédi Nouira", geo: { lat: 36.8419, lng: 10.1633 },
    rate: "4,6", rev: 74, from: 18, phone: "+216 71 872 540", instagram: "@coiffelle.menzah",
    tags: ["Brushing", "Lissage"], amenities: { dep: 0, dom: 0, park: 1, fem: 1 }, avail: 0,
    groups: ["coiffure"], staff: ["l"], reviews: "coiffelle",
    desc: "Coiffure féminine à Menzah 6 : lissage longue tenue et brushings soignés dans un espace 100% femmes.",
  },
  {
    name: "Barber Klub", kind: "Barbier", primary: "barbier", categories: ["barbier"],
    city: "Sousse", area: "Centre", address: "Avenue Léopold Sédar Senghor", geo: { lat: 35.8256, lng: 10.6084 },
    rate: "4,8", rev: 167, from: 15, phone: "+216 73 220 118", instagram: "@barberklub.sousse",
    tags: ["Coupe homme", "Coupe + barbe", "Rasage"], amenities: { dep: 1, dom: 0, park: 0, fem: 0 }, avail: 1,
    groups: ["barbier"], staff: ["k"], reviews: "barber",
    desc: "Barbershop de référence à Sousse : dégradés nets, taille de barbe et rasage traditionnel à la serviette chaude.",
  },
  {
    name: "Le Studio Ongles", kind: "Onglerie", primary: "onglerie", categories: ["onglerie"],
    city: "Sfax", area: "Centre", address: "Rue Habib Maâzoun", geo: { lat: 34.7406, lng: 10.7603 },
    rate: "4,7", rev: 58, from: 30, phone: "+216 74 402 900", instagram: "@lestudioongles",
    tags: ["Pose gel", "Nail art", "Manucure"], amenities: { dep: 1, dom: 0, park: 1, fem: 1 }, avail: 1,
    groups: ["onglerie"], staff: ["n"], reviews: "studio",
    desc: "Onglerie spécialisée à Sfax : pose gel longue tenue, nail art personnalisé et manucures dans un cadre hygiénique impeccable.",
  },
  {
    name: "Dar Jasmin Spa", kind: "Hammam & Spa", primary: "spa-massage", categories: ["spa-massage", "esthetique"],
    city: "Sidi Bou Saïd", area: "Sidi Bou Saïd", address: "Rue Sidi Bou Fares", geo: { lat: 36.8704, lng: 10.347 },
    rate: "4,9", rev: 132, from: 45, phone: "+216 71 740 330", instagram: "@darjasmin.spa",
    tags: ["Hammam", "Massage", "Soin visage"], amenities: { dep: 1, dom: 0, park: 0, fem: 1 }, avail: 0,
    groups: ["spa", "esthetique"], staff: ["m", "s"], reviews: "spa",
    desc: "Spa d'exception à Sidi Bou Saïd : hammam traditionnel, gommage, massages et soins visage face à la Méditerranée.",
  },
]

export const SALONS = RAW_SALONS.map((r) => {
  const slug = slugify(r.name)
  const serviceGroups = r.groups.map((g) => SVC[g]())
  const priceFrom = Math.min(...serviceGroups.flatMap((g) => g.rows.map((x) => x.p)))
  return {
    ...r,
    slug,
    citySlug: slugify(r.city),
    rateNum: Number(r.rate.replace(",", ".")),
    from: r.from ?? priceFrom,
    ini: r.name[0],
    serviceGroups,
    team: staffList(r.staff),
    reviews: REV[r.reviews],
    hours: HOURS_DISPLAY(r.primary === "barbier" ? "20h00" : "20h00"),
    hoursSchema: HOURS_SCHEMA(),
    slotLabel: r.avail ? "Dispo aujourd'hui" : "Dès demain",
  }
})

export const getSalon = (slug) => SALONS.find((s) => s.slug === slug)

/** A salon matches a category node: for a top category by its `categories`,
    for a prestation (sub-category) if it also offers that prestation. */
const salonOffers = (s, node) => {
  if (!node) return false
  if (node.isTop) return s.categories.includes(node.slug)
  if (!s.categories.includes(node.top)) return false
  // Match on the level-1 prestation (mock salons carry prestation-level tags/services).
  const term = (node.l1 || node.name).toLowerCase()
  return s.tags.some((t) => t.toLowerCase().includes(term)) ||
    s.serviceGroups.some((g) => g.rows.some((r) => r.n.toLowerCase().includes(term)))
}
export const salonsForCategory = (slug) => SALONS.filter((s) => salonOffers(s, getCategory(slug)))
export const salonsFor = (slug, citySlug) =>
  SALONS.filter((s) => s.citySlug === citySlug && salonOffers(s, getCategory(slug)))

/** Cities that have ≥1 matching salon for a category node (top or prestation). */
export function categoryCities(slug) {
  const node = getCategory(slug)
  return CITIES.map((c) => {
    const list = salonsFor(slug, c.slug)
    const count = list.length || (node?.isTop ? c.cat : 0)
    return { ...c, count, hasReal: list.length > 0 }
  }).filter((c) => c.count > 0)
}

/* ── Filtering + pagination (the "search API" over the mock) ────────
   querySalons is the single source used by both the SSR pages and the
   /api/salons route handler, so client filter calls and server-rendered
   pages return identical results. PAGE_SIZE is small for the demo. */
export const PAGE_SIZE = 20
const SORT_FNS = {
  note: (a, b) => b.rateNum - a.rateNum,
  avis: (a, b) => b.rev - a.rev,
  prixA: (a, b) => a.from - b.from,
  prixD: (a, b) => b.from - a.from,
  dispo: (a, b) => (b.avail ? 1 : 0) - (a.avail ? 1 : 0),
}
const openOnWeekday = (s, wd) => {
  const h = [...s.slug].reduce((a, c) => a + c.charCodeAt(0), 0)
  return (h + wd) % 4 !== 0 // deterministic ~75% of weekdays
}
/** Single-select filter predicate — one option per metric. Exported so the
    client can compute the live "Voir N salons" count without hitting the API.
    `f` = { dispo, date, note, budget, bounds }. */
export function passFilters(s, f) {
  if (!f) return true
  const dispo = f.dispo
  if (dispo === "today" && !s.avail) return false
  if (dispo === "date" && f.date) { const d = new Date(f.date); if (!isNaN(d.getTime()) && !openOnWeekday(s, d.getDay())) return false }
  if (dispo === "tmrw") { const d = new Date(); d.setDate(d.getDate() + 1); if (!openOnWeekday(s, d.getDay())) return false }
  if (dispo === "wkend" && !(openOnWeekday(s, 6) || openOnWeekday(s, 0))) return false
  if (f.note && s.rateNum < f.note) return false
  if (f.budget === "lo" && s.from > 25) return false
  if (f.budget === "mid" && (s.from < 25 || s.from > 35)) return false
  if (f.bounds) {
    const b = f.bounds
    if (!(s.geo && s.geo.lat <= b.n && s.geo.lat >= b.s && s.geo.lng <= b.e && s.geo.lng >= b.w)) return false
  }
  return true
}
export function querySalons({ category, city, page = 1, sort = "note", filters = {} } = {}) {
  const node = getCategory(category)
  let items = SALONS.filter((s) => s.citySlug === city && salonOffers(s, node) && passFilters(s, filters))
  items = [...items].sort(SORT_FNS[filters.sort || sort] || SORT_FNS.note)
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const p = Math.min(Math.max(1, page || 1), totalPages)
  const start = (p - 1) * PAGE_SIZE
  return {
    items: items.slice(start, start + PAGE_SIZE),
    mapItems: items.slice(0, 80), // all matches (capped) for the map
    total, page: p, pageSize: PAGE_SIZE, totalPages,
  }
}

/* Global search: keyword (name/tags/services/category/city) + optional
   category, city, min rating, availability. Paginated like querySalons. */
const _norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
export function searchSalons({ q = "", category = "", city = "", rate = 0, dispo = "", sort = "note", page = 1 } = {}) {
  const words = _norm(q).split(/\s+/).filter(Boolean)
  const catNode = category ? getCategory(category) : null
  let items = SALONS.filter((s) => {
    if (catNode && !salonOffers(s, catNode)) return false
    if (city && s.citySlug !== city) return false
    if (rate && s.rateNum < rate) return false
    if (dispo === "today" && !s.avail) return false
    if (words.length) {
      const hay = _norm([
        s.name, s.kind, s.city, s.area,
        ...(s.tags || []),
        ...s.categories.map((c) => getCategory(c)?.name || ""),
        ...s.serviceGroups.flatMap((g) => [g.cat, ...g.rows.map((r) => r.n)]),
      ].join(" "))
      if (!words.every((w) => hay.includes(w))) return false
    }
    return true
  })
  items = [...items].sort(SORT_FNS[sort] || SORT_FNS.note)
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const p = Math.min(Math.max(1, page || 1), totalPages)
  const start = (p - 1) * PAGE_SIZE
  return { items: items.slice(start, start + PAGE_SIZE), total, page: p, pageSize: PAGE_SIZE, totalPages }
}

/* ── Home / landing content ────────────────────────────────── */
export const HERO_CATS = CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }))

export const HOW_STEPS = [
  { i: 1, t: "Trouvez votre salon", d: "Parcourez les salons près de chez vous : services, prix, photos et avis vérifiés de vraies clientes." },
  { i: 2, t: "Réservez en 30 secondes", d: "Choisissez votre praticien(ne), votre créneau et payez l'acompte en ligne — Flouci, e-Dinar ou carte." },
  { i: 3, t: "Profitez, on s'occupe du reste", d: "Confirmation et rappel par SMS, reprogrammation en un clic, points fidélité à chaque visite." },
]
export const POP_SVCS = [
  { n: "Coupe & brushing", c: "Coiffure femme", p: 35, cat: "coiffure" },
  { n: "Coupe homme", c: "Barbier", p: 15, cat: "barbier" },
  { n: "Balayage", c: "Coloration", p: 120, cat: "coiffure" },
  { n: "Pose gel", c: "Onglerie", p: 60, cat: "onglerie" },
  { n: "Soin visage", c: "Esthétique", p: 70, cat: "esthetique" },
  { n: "Massage relaxant", c: "Spa & bien-être", p: 80, cat: "spa-massage" },
  { n: "Épilation complète", c: "Esthétique", p: 50, cat: "esthetique" },
  { n: "Coiffure mariée", c: "Événementiel", p: 250, cat: "coiffure" },
]
export const TESTIMONIALS = [
  { n: "Meriem K.", city: "Tunis", ini: "MK", c: "#D4A874", txt: "Fini les appels sans réponse. Je réserve mon brushing du samedi le mardi soir, dans mon lit." },
  { n: "Yassine B.", city: "Sousse", ini: "YB", c: "#7E9CD8", txt: "Le rappel SMS m'a sauvé deux fois. Et payer l'acompte avec Flouci, c'est réglé en 10 secondes." },
  { n: "Amel T.", city: "Sfax", ini: "AT", c: "#E0A3B0", txt: "J'ai découvert mon onglerie préférée grâce aux avis. Les points fidélité m'ont déjà offert une pose gel." },
]
export const FAQS = [
  ["La réservation est-elle gratuite ?", "Oui, réserver via Rezervy est 100% gratuit pour les clientes. Certains salons demandent un petit acompte, entièrement déduit du prix de la prestation."],
  ["Comment payer l'acompte ?", "Par Flouci, carte e-Dinar SmartPay ou carte bancaire (Visa / Mastercard). Certains salons acceptent aussi la confirmation simple sans paiement."],
  ["Puis-je annuler ou déplacer mon rendez-vous ?", "Oui, directement depuis le lien SMS de confirmation ou votre compte, gratuitement jusqu'à 24h avant. Passé ce délai, l'acompte peut être conservé par le salon."],
  ["Que se passe-t-il si le salon est complet ?", "Rejoignez la liste d'attente : dès qu'un créneau se libère, vous recevez un SMS avec un lien de réservation prioritaire valable 30 minutes."],
  ["Comment fonctionnent les points fidélité ?", "Chaque visite réservée via Rezervy vous rapporte des points chez ce salon, à échanger contre des prestations offertes. Le parrainage d'une amie rapporte 50 points."],
]
export const STATS = [
  { v: "480+", l: "salons partenaires" },
  { v: "65 000", l: "rendez-vous par mois" },
  { v: "4,8 / 5", l: "satisfaction moyenne" },
  { v: "24 gouvernorats", l: "couverts en Tunisie" },
]

export const PRICE_ROWS = {
  coiffure: [
    { n: "Coupe & brushing", range: "25 – 60 TND", avg: 40 },
    { n: "Coloration complète", range: "90 – 180 TND", avg: 130 },
    { n: "Balayage", range: "120 – 250 TND", avg: 170 },
    { n: "Brushing seul", range: "20 – 45 TND", avg: 30 },
    { n: "Coiffure mariée", range: "200 – 450 TND", avg: 300 },
  ],
  barbier: [
    { n: "Coupe homme", range: "12 – 30 TND", avg: 20 },
    { n: "Coupe + barbe", range: "25 – 50 TND", avg: 35 },
    { n: "Taille de barbe", range: "10 – 25 TND", avg: 15 },
    { n: "Rasage traditionnel", range: "20 – 40 TND", avg: 30 },
  ],
  onglerie: [
    { n: "Pose gel", range: "50 – 90 TND", avg: 70 },
    { n: "Vernis semi-permanent", range: "30 – 55 TND", avg: 45 },
    { n: "Manucure", range: "25 – 45 TND", avg: 35 },
    { n: "Nail art", range: "40 – 90 TND", avg: 60 },
  ],
  "spa-massage": [
    { n: "Massage relaxant 60 min", range: "70 – 140 TND", avg: 100 },
    { n: "Hammam & gommage", range: "35 – 80 TND", avg: 55 },
    { n: "Pierres chaudes", range: "90 – 160 TND", avg: 120 },
  ],
  esthetique: [
    { n: "Soin visage", range: "50 – 120 TND", avg: 75 },
    { n: "Épilation complète", range: "30 – 90 TND", avg: 55 },
    { n: "Maquillage", range: "60 – 150 TND", avg: 90 },
  ],
}

/** Flattened service list for a salon's booking flow (with global indices). */
export function flatServices(salon) {
  const flat = []
  salon.serviceGroups.forEach((g) => g.rows.forEach((r) => flat.push({ ...r, cat: g.cat })))
  return flat
}

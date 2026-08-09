/** Pure, data-free salon helpers — safe to import from client components
 *  (no API/react-cache imports, so nothing heavy gets bundled client-side). */

/** Flattened service list for a salon's booking flow (with global indices). */
export function flatServices(salon) {
  const flat = []
  salon.serviceGroups.forEach((g) => g.rows.forEach((r) => flat.push({ ...r, cat: g.cat })))
  return flat
}

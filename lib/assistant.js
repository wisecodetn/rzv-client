const API = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "")

/**
 * Is the assistant live, and how long are its conversations kept? Read from
 * the API's admin settings, so every page that states it (the assistant page,
 * the privacy policy, the chat bubble) says the same thing. Cached a minute: an
 * admin switching the assistant off must not leave a page saying "En ligne".
 */
export async function getAssistantStatus() {
  try {
    const res = await fetch(`${API}/public/assistant`, { next: { revalidate: 60 } })
    const d = res.ok ? await res.json() : null
    return { enabled: !!d?.enabled, retentionDays: Number(d?.retentionDays) || 90 }
  } catch {
    return { enabled: false, retentionDays: 90 }
  }
}

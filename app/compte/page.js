import { Dashboard } from "@/components/account/sections"

export const metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
}

export default function ComptePage() {
  return <Dashboard />
}

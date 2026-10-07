import { Dashboard } from "@/components/account/Dashboard"

export const metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
}

export default function ComptePage() {
  return <Dashboard />
}

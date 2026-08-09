import { Suspense } from "react"
import ResetForm from "@/components/auth/ResetForm"

export const metadata = {
  title: "Réinitialiser le mot de passe",
  robots: { index: false, follow: false },
}

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  )
}

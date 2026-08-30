import { Suspense } from "react"
import VerifyEmailForm from "@/components/auth/VerifyEmailForm"

export const metadata = {
  title: "Vérifier votre e-mail",
  robots: { index: false, follow: false },
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  )
}

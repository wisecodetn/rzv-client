import { Suspense } from "react"
import LoginForm from "@/components/auth/LoginForm"

export const metadata = {
  title: "Se connecter",
  robots: { index: false, follow: false },
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

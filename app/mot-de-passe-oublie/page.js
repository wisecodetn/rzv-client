import ForgotForm from "@/components/auth/ForgotForm"

export const metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
}

export default function ForgotPage() {
  return <ForgotForm />
}

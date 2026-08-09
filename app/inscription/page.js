import RegisterForm from "@/components/auth/RegisterForm"

export const metadata = {
  title: "Créer un compte",
  robots: { index: false, follow: false },
}

export default function InscriptionPage() {
  return <RegisterForm />
}

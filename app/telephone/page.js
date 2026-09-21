import PhoneForm from "@/components/auth/PhoneForm"

export const metadata = {
  title: "Votre numéro de téléphone",
  robots: { index: false, follow: false },
}

export default function TelephonePage() {
  return <PhoneForm />
}

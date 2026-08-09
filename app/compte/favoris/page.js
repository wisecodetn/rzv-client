import { Favoris } from "@/components/account/sections"

export const metadata = {
  title: "Mes favoris",
  robots: { index: false, follow: false },
}

export default function FavorisPage() {
  return <Favoris />
}

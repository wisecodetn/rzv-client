import ManageRdv from "@/components/ManageRdv"

export const dynamicParams = true

export async function generateMetadata({ params }) {
  const { token } = await params
  return { title: `Gérer le rendez-vous ${token}`, robots: { index: false, follow: false } }
}

export default async function RdvPage({ params }) {
  const { token } = await params
  return <ManageRdv code={token} />
}

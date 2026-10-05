import { redirect } from "next/navigation"

/* Old "manage by reference" links: bookings live in the client account. */
export default function RdvPage() {
  redirect("/compte/rendez-vous")
}

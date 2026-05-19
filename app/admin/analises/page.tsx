import { redirect } from "next/navigation"
import AnalisesPage from "@/presentation/admin/AnalisesPage"
import { getCurrentUserRole, getAllAppointments } from "@/lib/actions/admin"
import { getAllAppointmentsWithClients } from "@/lib/actions/analises"

export default async function AnalisesRoute() {
  const role = await getCurrentUserRole()

  if (role !== "admin") {
    redirect("/admin/login")
  }

  const appointments = await getAllAppointmentsWithClients()

  return <AnalisesPage appointments={appointments} />
}

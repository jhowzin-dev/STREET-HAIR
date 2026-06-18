import { redirect } from "next/navigation"
import { getAllAppointmentsWithClients } from "@/lib/actions/analises"
import { getAdminStats, getCurrentUserRole } from "@/lib/actions/admin"
import AdminDashboard from "@/presentation/admin/AdminDashboard"

export default async function AdminPage() {
  const role = await getCurrentUserRole()

  if (role !== "admin") {
    redirect("/admin/login")
  }

  const [appointments, stats] = await Promise.all([
    getAllAppointmentsWithClients(),
    getAdminStats(),
  ])

  return <AdminDashboard appointments={appointments} stats={stats} />
}

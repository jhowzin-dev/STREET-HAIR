import { redirect } from "next/navigation"
import { getAllAppointments, getAdminStats, getCurrentUserRole } from "@/lib/actions/admin"
import AdminDashboard from "@/presentation/admin/AdminDashboard"

export default async function AdminPage() {
  const role = await getCurrentUserRole()

  if (role !== "admin") {
    redirect("/admin/login")
  }

  const [appointments, stats] = await Promise.all([
    getAllAppointments(),
    getAdminStats(),
  ])

  return <AdminDashboard appointments={appointments} stats={stats} />
}

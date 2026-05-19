import { Suspense } from "react";
import AppointmentsPage from "@/presentation/pages/AppointmentsPage";

export default function Appointments() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-white/20 border-t-white rounded-full" />
      </main>
    }>
      <AppointmentsPage />
    </Suspense>
  );
}

import { Suspense } from "react";
import HomePage from "@/presentation/pages/HomePage";

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <HomePage />
    </Suspense>
  );
}

"use client"

import Link from "next/link"
import { ArrowLeft, LogOut } from "lucide-react"
import { signOut } from "@/lib/actions/auth"

interface PageHeaderProps {
  title: string
  subtitle?: string
  backHref?: string
  showLogout?: boolean
}

export function PageHeader({ title, subtitle = "Street Hair - Barbearia", backHref = "/", showLogout = false }: PageHeaderProps) {
  return (
    <header className="bg-black border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link href={backHref} className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
          <p className="text-white/40 text-xs">{subtitle}</p>
        </div>
      </div>
      {showLogout && (
        <form action={signOut}>
          <button type="submit" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 text-white/60" />
          </button>
        </form>
      )}
    </header>
  )
}

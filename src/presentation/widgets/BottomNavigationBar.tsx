"use client";

import { Home, Scissors, Calendar, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  icon: typeof Home;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/booking", icon: Scissors, label: "Agendar" },
  { href: "/appointments", icon: Calendar, label: "Agendamentos" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function BottomNavigationBar() {
  const pathname = usePathname();

  return (
    // Centralização perfeita usando left-1/2 e -translate-x-1/2 para evitar bugs no PC e Android
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full px-6 flex justify-center z-50 pointer-events-none">
      <div className="flex justify-around items-center w-full max-w-sm border border-white/10 rounded-[2.5rem] py-4 bg-black/80 backdrop-blur-md shadow-2xl pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative p-2">
              <Icon
                className={`w-5 h-5 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "text-white scale-110"
                    : "text-white/40 hover:text-white"
                }`}
              />
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-white transition-all duration-300 ease-out ${
                  isActive ? "w-5 opacity-100" : "w-0 opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
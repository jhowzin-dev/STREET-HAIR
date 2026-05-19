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
    <nav className="fixed bottom-10 w-full px-6 flex justify-center">
      <div className="flex justify-around items-center w-full max-w-sm border border-white/20 rounded-[2.5rem] py-4 bg-black/40 backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative">
              <Icon
                className={`w-6 h-6 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? "text-white scale-110"
                    : "text-white/40 hover:text-white"
                }`}
              />
              <span
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-white transition-all duration-300 ease-out ${
                  isActive ? "w-6 opacity-100" : "w-0 opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

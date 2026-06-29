import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { MenuSheet } from "./MenuSheet";

interface TopHeaderProps {
  showBack?: boolean;
  backHref?: string;
}

export function TopHeader({ showBack, backHref = "/" }: TopHeaderProps) {
  return (
    <header className="w-full pt-8 px-6">
      <div className="flex justify-between items-center mb-4">
        {showBack ? (
          <Link href={backHref}>
            <ChevronLeft className="w-8 h-8 text-white cursor-pointer hover:text-white/80 active:scale-90 transition-all duration-150" />
          </Link>
        ) : (
          <MenuSheet />
        )}
        {/* Logo da Barbearia */}
        <Link href="/" className="w-14 h-14   relative">
          <Image src="/logo.jpg" alt="Street Hair" fill className="object-contain" />
        </Link>
      </div>
      <div className="h-[1px] w-full bg-white/20" />
    </header>
  );
}
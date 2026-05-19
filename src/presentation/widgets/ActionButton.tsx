import { PlusCircle } from "lucide-react";
import Link from "next/link";

interface ActionButtonProps {
  label: string;
  href: string;
}

export function ActionButton({ label, href }: ActionButtonProps) {
  const className = "flex items-center gap-3 border border-white/60 px-12 py-5 hover:bg-white/10 active:scale-95 active:bg-white/20 transition-all duration-150 group";

  return (
    <Link href={href} className={className}>
      <PlusCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" strokeWidth={1.5} />
      <span className="text-white text-2xl font-light tracking-[0.2em] uppercase">
        {label}
      </span>
    </Link>
  );
}
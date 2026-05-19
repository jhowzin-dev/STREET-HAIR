"use client";

import Image from "next/image";
import { Clock, MapPin } from "lucide-react";
import { TopHeader } from "../widgets/TopHeader";
import { ActionButton } from "../widgets/ActionButton";
import { BottomNavigationBar } from "../widgets/BottomNavigationBar";

export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-black flex flex-col items-center">

      <TopHeader />

      {/* Logo Central + Info */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-10">
        <div className="w-56 h-56 relative">
          <Image src="/logo.jpg" alt="Street Hair" fill className="object-contain" priority />
        </div>

        {/* INFO CARDS - Horário & Endereço */}
        <div className="flex gap-3 mt-8">
          {/* Card Horário */}
          <div className="bg-neutral-900 rounded-xl p-3 w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-white text-xs font-medium">Funcionamento</span>
            </div>
            <p className="text-[11px] text-white/80">Ter-Sex: 09h-19:30h</p>
            <p className="text-[11px] text-white/80">Sáb: 09h-18h</p>
            <p className="text-[11px] text-red-400">Dom-Seg: Fechado</p>
          </div>

          {/* Card Endereço */}
          <div className="bg-neutral-900 rounded-xl p-3 w-[150px]">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-red-500" />
              <span className="text-white text-xs font-medium">Endereço</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
             R. P Viêira da Silva<br />
              Vila Louro, Embu-Guaçu, SP
            </p>
          </div>
        </div>
      </div>

      {/* Sempre mostra o botão de agendar porque usuário está logado */}
      <div className="absolute bottom-[140px] left-1/2 -translate-x-1/2">
        <ActionButton label="Agendar" href="/booking" />
      </div>

      <BottomNavigationBar />

    </main>
  );
}

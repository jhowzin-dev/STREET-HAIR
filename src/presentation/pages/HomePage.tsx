"use client";

import Image from "next/image";
import { Clock, MapPin } from "lucide-react";
import { TopHeader } from "../widgets/TopHeader";
import { ActionButton } from "../widgets/ActionButton";
import { BottomNavigationBar } from "../widgets/BottomNavigationBar";

export default function HomePage() {
  return (
    // 1. 'h-screen overflow-y-auto' permite que a tela respire se o celular for ridiculamente pequeno.
    // 2. Trocamos o padding inferior para um valor fixo seguro 'pb-32' que casa com a altura da sua barra.
    <main className="h-screen w-full bg-black flex flex-col items-center justify-between overflow-y-auto scrollbar-none pt-[env(safe-area-inset-top)] pb-32 px-4 relative">

      <TopHeader />

      {/* CONTAINER INTEGRADO (Logo + Cards + Botão) */}
      <div className="flex-1 flex flex-col items-center justify-end w-full max-w-md mx-auto gap-y-6 py-4 min-h-0">
        
        {/* BLOCO 1: Logo Central */}
        <div className="w-48 h-48 min-[400px]:w-56 min-[400px]:h-56 max-h-[22vh] min-h-[120px] aspect-square relative flex-shrink">
          <Image src="/logo.jpg" alt="Street Hair" fill className="object-contain" priority />
        </div>

        {/* BLOCO 2: INFO CARDS - Horário & Endereço */}
        <div className="flex gap-3 justify-center w-full flex-shrink-0">
          
          {/* Card Horário */}
          <div className="bg-neutral-900 rounded-xl p-3 w-[135px] flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-white text-[11px] font-medium truncate">Funcionamento</span>
            </div>
            <p className="text-[10px] text-white/80 whitespace-nowrap">Ter-Sex: 09h-19:30h</p>
            <p className="text-[10px] text-white/80">Sáb: 09h-18h</p>
            <p className="text-[10px] text-red-400 mt-0.5">Dom-Seg: Fechado</p>
          </div>

          {/* Card Endereço */}
          <div className="bg-neutral-900 rounded-xl p-3 w-[135px] flex-shrink-0">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-white text-[11px] font-medium">Endereço</span>
            </div>
            <p className="text-[10px] text-white/80 leading-relaxed break-words">
              R. P Viêira da Silva<br />
              Vila Louro, Embu-Guaçu, SP
            </p>
          </div>

        </div>

        {/* Botão de Agendamento */}
        <div className="w-full flex justify-center flex-shrink-0 z-10">
          <ActionButton label="Agendar" href="/booking" />
        </div>
        
      </div>

    
      <BottomNavigationBar />

    </main>
  );
}
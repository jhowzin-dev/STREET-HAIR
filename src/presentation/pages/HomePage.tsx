"use client";

import Image from "next/image";
import { Clock, MapPin } from "lucide-react";
import { TopHeader } from "../widgets/TopHeader";
import { ActionButton } from "../widgets/ActionButton";
import { BottomNavigationBar } from "../widgets/BottomNavigationBar";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-start pt-[env(safe-area-inset-top)] pb-36 px-4 relative overflow-x-hidden">

      <TopHeader />

      {/* CONTAINER INTEGRADO - Usando my-auto para centralizar perfeitamente na vertical se sobrar espaço */}
      <div className="my-auto flex flex-col items-center w-full max-w-md mx-auto gap-y-8 py-6">
        
        {/* BLOCO 1: Logo Central */}
        <div className="w-48 h-48 min-[400px]:w-56 min-[400px]:h-56 aspect-square relative">
          <Image src="/logo.jpg" alt="Street Hair" fill className="object-contain" priority />
        </div>

        {/* BLOCO 2: INFO CARDS - Horário & Endereço */}
        <div className="flex gap-4 justify-center w-full">
          
          {/* Card Horário */}
          <div className="bg-neutral-900 rounded-xl p-3.5 w-[145px] flex-shrink-0 border border-neutral-800/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-white text-[11px] font-medium truncate">Funcionamento</span>
            </div>
            <p className="text-[10px] text-white/80 whitespace-nowrap">Ter-Sex: 09h-19:30h</p>
            <p className="text-[10px] text-white/80">Sáb: 09h-18h</p>
            <p className="text-[10px] text-red-400 mt-0.5">Dom-Seg: Fechado</p>
          </div>

          {/* Card Endereço */}
          <div className="bg-neutral-900 rounded-xl p-3.5 w-[145px] flex-shrink-0 border border-neutral-800/50">
            <div className="flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <span className="text-white text-[11px] font-medium">Endereço</span>
            </div>
            <p className="text-[10px] text-white/80 leading-relaxed text-xs">
              Rua Arnaldo Mendes de Freitas 140<br />
              Vila Louro, Embu-Guaçu, SP
            </p>
          </div>

        </div>

        {/* Botão de Agendamento */}
        <div className="w-full flex justify-center z-10 px-2">
          <ActionButton label="Agendar" href="/booking" />
        </div>
        
      </div>

      {/* Barra de Navegação Isolada no fundo */}
      <BottomNavigationBar />

    </main>
  );
}
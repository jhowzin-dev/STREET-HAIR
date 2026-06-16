"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, MapPin, MessageCircle, Users, Info, Camera, Scissors, LayoutDashboard, BarChart3 } from "lucide-react";
import { createClient } from "@/core/utils/supabase";

interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  onClick: () => void;
  isAdminItem?: boolean;
}

export function MenuSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.role === "admin") {
              setIsAdmin(true);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const baseItems: MenuItem[] = [
   // {
   //   icon: Info,
   //   label: "Sobre Nós",
   //   description: "Nossa história e valores",
   //   onClick: () => {
   //     router.push("/about?from=menu");
   //     setIsOpen(false);
   //   },
   // },
   // {
   //   icon: Users,
   //   label: "Nossa Equipe",
   //   description: "Gabriel & Renan",
   //   onClick: () => {
   //     alert("Gabriel Barreto e Renan Amaral - Especialistas em cortes modernos e barbas tradicionais.");
   //     setIsOpen(false);
   //   },
   // },
    {
      icon: MapPin,
      label: "Endereço",
      description: "Ver no mapa",
      onClick: () => {
        window.open("https://maps.app.goo.gl/abckH8jxWZDBSJd68", "_blank");
        setIsOpen(false);
      },
    },
    {
      icon: MessageCircle,
      label: "Fale Conosco",
      description: "WhatsApp",
      onClick: () => {
        window.open("https://wa.me/5511934280473", "_blank");
        setIsOpen(false);
      },
    },
    //{
    //  icon: Camera,
    //  label: "Redes Sociais",
    //  description: "@streethair",
    //  onClick: () => {
    //    window.open("https://instagram.com/streethair", "_blank");
    //    setIsOpen(false);
    //  },
    //},
  ];

  const menuItems = [...baseItems];

  return (
    <>
      {/* Botão Menu */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Menu className="w-8 h-8 text-white" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[59] animate-fadeIn"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-neutral-900 z-[60] transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header do Sheet */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Scissors className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Street Hair</h2>
              <p className="text-white/40 text-xs">Barbearia Premium</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center group-hover:bg-neutral-700 transition-colors">
                  <Icon className="w-5 h-5 text-white/60 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{item.label}</p>
                  <p className="text-white/40 text-xs">{item.description}</p>
                </div>
              </button>
            );
          })}
          
          {/* Items Admin - Condicional */}
          {isAdmin && (
            <>
              <button
                onClick={() => {
                  router.push("/admin");
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 transition-colors group"
              >
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                  <LayoutDashboard className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-amber-400 font-medium text-sm">Painel Admin</p>
                  <p className="text-amber-400/60 text-xs">Gerenciar agendamentos</p>
                </div>
              </button>
            
            </>
          )}
          
          {loading && (
            <div className="p-4 text-center">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
          <p className="text-white/30 text-xs text-center">
            Funcionamento: Ter-Sáb 09h às 19:30h
          </p>
        </div>
      </div>
    </>
  );
}
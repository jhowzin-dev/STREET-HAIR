"use client"

import { useState, useMemo } from "react"
import {
  ChevronDown,
  Target,
  Award,
  Users,
  Clock,
  MapPin,
  Sparkles,
  Phone,
  ArrowRight,
  Scissors,
  Star,
  Camera,
  Mail,
  type LucideIcon,
} from "lucide-react"
import { TopHeader } from "../widgets/TopHeader"
import { BottomNavigationBar } from "../widgets/BottomNavigationBar"
import { cn } from "@/lib/utils"

// Types & Interfaces

interface SectionData {
  id: string
  icon: React.ReactNode
  title: string
  content: React.ReactNode
}

interface AccordionSectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  isOpen: boolean
  onClick: () => void
}

// Accordion Section (Reusable)
function AccordionSection({
  icon,
  title,
  children,
  isOpen,
  onClick,
}: AccordionSectionProps) {
  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors active:bg-white/10"
        aria-expanded={isOpen}
        aria-controls={`section-content-${title}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center shrink-0">
            {icon}
          </div>
          <span className="text-white font-medium text-left">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-white/50 transition-transform duration-300 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        id={`section-content-${title}`}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="px-4 pb-4 text-white/70 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  )
}

// Stat Card
function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="bg-neutral-900/80 rounded-xl p-4 border border-white/5 text-center">
      <div className="flex justify-center mb-2 text-amber-500">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-white/50 text-xs mt-1">{label}</p>
    </div>
  )
}

// Quick Info Card
function QuickInfoCard({
  icon,
  title,
  children,
  action,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="bg-neutral-900 rounded-xl p-4 border border-white/10 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-white text-sm font-medium">{title}</span>
      </div>
      <div className="flex-1">{children}</div>
      {action && <div className="mt-3 pt-3 border-t border-white/10">{action}</div>}
    </div>
  )
}

// Main Component
export default function AboutPage() {
  const [openSection, setOpenSection] = useState<string | null>("historia")

  const handleSectionClick = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id))
  }

  // ── Sections Data ──
  const sections = useMemo<SectionData[]>(
    () => [
      {
        id: "historia",
        icon: <Sparkles className="w-5 h-5 text-amber-500" />,
        title: "Nossa História",
        content: (
          <div className="space-y-3">
            <p>
              Fundada em 2020, a <strong className="text-white">Street Hair</strong> nasceu da
              paixão de dois amigos por transformar o visual masculino. Gabriel e Renan começaram
              atendendo em uma pequena sala alugada, com apenas duas cadeiras e um sonho:
              <em> democratizar a barbearia premium</em>.
            </p>
            <p>
              Hoje, somos referência na região, com milhares de clientes satisfeitos e uma comunidade
              engajada que valoriza qualidade, estilo e autenticidade.
            </p>
          </div>
        ),
      },
      {
        id: "missao",
        icon: <Target className="w-5 h-5 text-white" />,
        title: "Missão & Visão",
        content: (
          <div className="space-y-3">
            <p>
              <strong className="text-white">Missão:</strong> Proporcionar uma experiência única de
              cuidado masculino, combinando tradição barbeira com tendências modernas, em um ambiente
              acolhedor e descontraído.
            </p>
            <p>
              <strong className="text-white">Visão:</strong> Ser reconhecida como a melhor barbearia
              da região, expandindo nossa marca mantendo a excelência no atendimento e a conexão genuína
              com nossos clientes.
            </p>
          </div>
        ),
      },
      {
        id: "diferenciais",
        icon: <Award className="w-5 h-5 text-amber-500" />,
        title: "Nossos Diferenciais",
        content: (
          <ul className="space-y-2">
            {[
              "Profissionais especializados - Gabriel e Renan possuem certificações internacionais",
              "Produtos premium - Usamos apenas as melhores marcas do mercado",
              "Agendamento online - Praticidade para marcar seu horário",
              "Ambiente exclusivo - Decoração street, música e vibe única",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-amber-500 text-lg leading-none mt-0.5">▸</span>
                {(() => {
  const parts = item.split(/-\s+/);
  const before = parts.shift() ?? '';
  const after = parts.join(' - ');
  return (
    <>
      <strong className="text-white">{before}</strong> - {after}
    </>
  );
})()}
              </li>
            ))}
          </ul>
        ),
      },
      {
        id: "equipe",
        icon: <Users className="w-5 h-5 text-white" />,
        title: "Nossa Equipe",
        content: (
          <div className="space-y-4">
            <TeamMemberCard
              name="Gabriel Barreto"
              role="Fundador & Barbeiro Master"
              description="Especialista em cortes modernos, degradê e desenhos. 8 anos de experiência e certificação em Londres pela London School of Barbering."
              initials="GB"
            />
            <TeamMemberCard
              name="Renan Amaral"
              role="Co-fundador & Especialista em Barbas"
              description={`Mestre na arte da barba tradicional e navalhada. Conhecido pelo atendimento personalizado e pelo famoso "tratamento barba de respeito".`}
              initials="RA"
            />
          </div>
        ),
      },
      {
        id: "horarios",
        icon: <Clock className="w-5 h-5 text-white" />,
        title: "Horários de Funcionamento",
        content: (
          <div className="space-y-2">
            <ScheduleRow day="Segunda-feira" hours="Fechado" closed />
            <ScheduleRow day="Terça a Sexta" hours="09:00 - 19:30" />
            <ScheduleRow day="Sábado" hours="09:00 - 18:00" />
            <ScheduleRow day="Domingo" hours="Fechado" closed />
            <p className="text-amber-500 text-xs mt-3 flex items-center gap-1">
              <Star className="w-3 h-3" />
              Dica: Agende online para garantir seu horário!
            </p>
          </div>
        ),
      },
      {
        id: "localizacao",
        icon: <MapPin className="w-5 h-5 text-red-500" />,
        title: "Onde Estamos",
        content: (
          <div className="space-y-3">
            <p>
              <strong className="text-white">Rua das Navalhas, 404</strong>
              <br />
              Bairro Hipster - São Paulo, SP
              <br />
              CEP: 01234-567
            </p>
            <p className="text-white/60 text-sm">
              Estacionamento gratuito para clientes. Próximo ao metrô República (10min a pé).
            </p>
            <button
              onClick={() => window.open("https://maps.google.com", "_blank")}
              className="w-full py-2.5 bg-neutral-700 hover:bg-neutral-600 active:bg-neutral-500 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Abrir no Google Maps
            </button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <main className="relative min-h-screen bg-black flex flex-col">
      <TopHeader showBack backHref="/" />

      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
            <Scissors className="w-10 h-10 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Street Hair</h1>
            <p className="text-white/60 text-sm">Barbearia Premium desde 2020</p>
          </div>
        </div>

        <p className="mt-4 text-amber-500 text-lg font-medium italic">
          &ldquo;Estilo é a assinatura da sua atitude&rdquo;
        </p>
      </div>

      {/* Stats */}
      <div className="px-6 pb-4 grid grid-cols-3 gap-3">
        <StatCard value="10K+" label="Clientes" icon={<Users className="w-5 h-5" />} />
        <StatCard value="50K+" label="Cortes" icon={<Scissors className="w-5 h-5" />} />
        <StatCard value="4.9" label="Avaliação" icon={<Star className="w-5 h-5" />} />
      </div>

      {/* Info Cards */}
      <div className="px-6 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <QuickInfoCard
          icon={<Clock className="w-4 h-4 text-amber-500" />}
          title="Horário"
        >
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-white/60">Ter-Sex</span>
              <span className="text-white">09h-19:30h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Sáb</span>
              <span className="text-white">09h-18h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Dom-Seg</span>
              <span className="text-red-400">Fechado</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-amber-500 text-xs flex items-center gap-1">
              <Star className="w-3 h-3" />
              Agende online para garantir seu horário!
            </p>
          </div>
        </QuickInfoCard>

        <QuickInfoCard
          icon={<MapPin className="w-4 h-4 text-red-500" />}
          title="Endereço"
        >
          <p className="text-xs text-white/80 leading-relaxed">
            Rua das Navalhas, 404
            <br />
            Bairro Hipster, SP
          </p>
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => window.open("https://maps.google.com", "_blank")}
              className="text-xs text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              Ver no mapa <ArrowRight className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Phone className="w-3 h-3" />
              <span>(11) 99999-9999</span>
            </div>
          </div>
        </QuickInfoCard>
      </div>

      {/* Accordion */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="bg-neutral-900 rounded-2xl overflow-hidden border border-white/10">
          {sections.map((section) => (
            <AccordionSection
              key={section.id}
              icon={section.icon}
              title={section.title}
              isOpen={openSection === section.id}
              onClick={() => handleSectionClick(section.id)}
            >
              {section.content}
            </AccordionSection>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-6 bg-neutral-900 rounded-2xl overflow-hidden border border-white/10 p-4">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-amber-500" />
            Contato
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ContactButton
              icon={<Phone className="w-4 h-4" />}
              label="WhatsApp"
              href="https://wa.me/5511999999999"
            />
            <ContactButton
              icon={<Camera className="w-4 h-4 text-amber-500" />}
              label="Instagram"
              href="https://instagram.com/streethair"
            />
            <ContactButton
              icon={<Mail className="w-4 h-4" />}
              label="Email"
              href="mailto:contato@streethair.com"
            />
            <ContactButton
              icon={<MapPin className="w-4 h-4" />}
              label="Google Maps"
              href="https://maps.google.com"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm mb-3">Pronto para transformar seu visual?</p>
          <a
            href="/booking"
            className="inline-flex items-center gap-2 bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors"
          >
            <Scissors className="w-5 h-5" />
            Agendar Agora
          </a>
        </div>
      </div>

      <BottomNavigationBar />
    </main>
  )
}

// ──────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────

function TeamMemberCard({
  name,
  role,
  description,
  initials,
}: {
  name: string
  role: string
  description: string
  initials: string
}) {
  return (
    <div className="bg-neutral-800 rounded-lg p-3 hover:bg-neutral-700/50 transition-colors">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 font-bold text-sm">
          {initials}
        </div>
        <div>
          <p className="font-medium text-white">{name}</p>
          <p className="text-white/60 text-xs">{role}</p>
        </div>
      </div>
      <p className="text-white/80 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function ScheduleRow({
  day,
  hours,
  closed,
}: {
  day: string
  hours: string
  closed?: boolean
}) {
  return (
    <div className="flex justify-between py-1.5 border-b border-white/5 last:border-b-0">
      <span className="text-white/70">{day}</span>
      <span className={closed ? "text-white/40" : "text-white font-medium"}>{hours}</span>
    </div>
  )
}

function ContactButton({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode
  label: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 active:bg-neutral-600 transition-colors"
    >
      <span className="text-amber-500">{icon}</span>
      <span className="text-white text-sm">{label}</span>
    </a>
  )
}

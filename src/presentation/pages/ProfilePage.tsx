"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { User, Calendar, Scissors, Bell, ChevronRight, FileText, Shield, Camera, X, Check, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { TopHeader } from "../widgets/TopHeader"
import { BottomNavigationBar } from "../widgets/BottomNavigationBar"
import { getProfile, updateProfile } from "@/lib/actions/profile"
import { getAppointments } from "@/lib/actions/appointments"
import { signOut, getCurrentUser } from "@/lib/actions/auth"
import type { UserProfile, Appointment } from "@/domain/entities"
import { PhoneInput } from "@/components/ui/PhoneInput"

// ── Input de nome isolado para evitar re-render do modal inteiro ──
const NameInput = memo(function NameInput({
  initialValue,
  onChange,
  disabled,
}: {
  initialValue: string
  onChange: (value: string) => void
  disabled: boolean
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      onChange(e.target.value)
    },
    [onChange]
  )

  return (
    <input
      type="text"
      autoComplete="name"
      autoCorrect="off"
      autoCapitalize="words"
      spellCheck={false}
      value={value}
      onChange={handleChange}
      placeholder="Digite aqui..."
      disabled={disabled}
      className="w-full bg-neutral-800 text-white p-4 rounded-xl border border-white/10 focus:border-amber-500 outline-none mb-4"
    />
  )
})

// ── Componente de Modal para Termos e Políticas (Novo) ──
const LegalModal = memo(function LegalModal({
  isOpen,
  type,
  onClose,
}: {
  isOpen: boolean
  type: "terms" | "privacy" | null
  onClose: () => void
}) {
  if (!isOpen || !type) return null

  const isTerms = type === "terms"

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-neutral-900 w-full max-w-md rounded-3xl p-6 max-h-[80vh] flex flex-col border border-white/5">
        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
          <h3 className="text-white text-lg font-semibold flex items-center gap-2">
            {isTerms ? <FileText className="w-5 h-5 text-amber-500" /> : <Shield className="w-5 h-5 text-amber-500" />}
            {isTerms ? "Termos de Uso" : "Política de Privacidade"}
          </h3>
          <button onClick={onClose} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-750 transition-colors">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 text-sm text-white/70 space-y-4 leading-relaxed scrollbar-thin">
          {isTerms ? (
            <>
              <p className="font-medium text-white">1. Aceitação dos Termos</p>
              <p>Ao acessar o Street Hair, você concorda em cumprir estes termos de serviço e todas as leis aplicáveis.</p>
              <p className="font-medium text-white">2. Agendamentos e Cancelamentos</p>
              <p>Os agendamentos são de responsabilidade do usuário. Caso não possa comparecer, realize o cancelamento prévio pelo aplicativo com antecedência para liberar o horário.</p>
              <p className="font-medium text-white">3. Modificações no Serviço</p>
              <p>Reservamos o direito de modificar ou descontinuar o serviço temporariamente por motivos de manutenção programada.</p>
            </>
          ) : (
            <>
              <p className="font-medium text-white">1. Coleta de Informações</p>
              <p>Coletamos informações básicas como seu nome completo, e-mail e número de telefone para garantir a segurança e a realização dos seus agendamentos na barbearia.</p>
              <p className="font-medium text-white">2. Uso dos Dados</p>
              <p>Seus dados são armazenados de forma criptografada e segura, sendo utilizados exclusivamente para gerenciar seu histórico de cortes e enviar lembretes importantes.</p>
              <p className="font-medium text-white">3. Seus Direitos</p>
              <p>Você possui total controle sobre seus dados e pode alterá-los ou solicitar a exclusão da sua conta a qualquer momento direto pela tela de configurações.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
})

// ── Componente de Modal com state interno isolado ──
interface EditModalProps {
  editModal: "name" | "phone" | "photo" | null
  editValue: string
  profile: UserProfile | null
  isSaving: boolean
  onClose: () => void
  onSave: (field: "name" | "phone" | "avatar_url", value: string) => void
  onChangeValue: (value: string) => void
}

const EditModal = memo(function EditModal({
  editModal,
  editValue: externalEditValue,
  profile,
  isSaving,
  onClose,
  onSave,
  onChangeValue,
}: EditModalProps) {
  const [localValue, setLocalValue] = useState(externalEditValue)

  useEffect(() => {
    setLocalValue(externalEditValue)
  }, [externalEditValue, editModal])

  const titles: Record<string, string> = {
    name: "Nome completo",
    phone: "Telefone",
    photo: "Foto de perfil",
  }

  const isPhone = editModal === "phone"
  const isName = editModal === "name"

  const handleChange = useCallback(
    (value: string) => {
      setLocalValue(value)
      onChangeValue(value)
    },
    [onChangeValue]
  )

  const handleSaveClick = useCallback(() => {
    if ((isName || isPhone) && editModal) {
      onSave(editModal, localValue)
    }
  }, [isName, isPhone, editModal, localValue, onSave])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      onSave("avatar_url", base64String)
    }
    reader.readAsDataURL(file)
  }

  if (!editModal) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-end justify-center z-50">
      <div className="bg-neutral-900 w-full max-w-md rounded-t-3xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white text-lg font-medium">{titles[editModal]}</h3>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {editModal === "photo" ? (
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto bg-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url!} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-white/40" />
              )}
            </div>
            
            <label className="w-full bg-amber-500 text-black font-medium py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-600 transition-colors">
              <Camera className="w-5 h-5" />
              {isSaving ? "Enviando..." : "Escolher foto da galeria"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isSaving}
                onChange={handleFileChange}
              />
            </label>

            {profile?.avatar_url && (
              <button
                onClick={() => onSave("avatar_url", "")}
                className="w-full bg-neutral-800 text-red-400 font-medium py-4 rounded-xl"
              >
                Remover foto
              </button>
            )}
          </div>
        ) : (
          <>
            {isPhone ? (
              <PhoneInput
                value={localValue}
                onChange={handleChange}
                autoFocus
                className="w-full bg-neutral-800 text-white p-4 rounded-xl border border-white/10 focus:border-amber-500 outline-none mb-4"
              />
            ) : (
              <NameInput
                initialValue={localValue}
                onChange={handleChange}
                disabled={isSaving}
              />
            )}
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="w-full bg-white text-black font-medium py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Salvar
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
})

// ── Componente principal de perfil ──
export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [notifications, setNotifications] = useState({
    reminders: true,
    promotions: false,
    news: true,
  })
  const [editModal, setEditModal] = useState<null | "name" | "phone" | "photo">(null)
  const [legalModalType, setLegalModalType] = useState<"terms" | "privacy" | null>(null)
  const [editValue, setEditValue] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadProfileData() {
      try {
        const user = await getCurrentUser()
        if (!user) return

        const [profileData, appointmentsData] = await Promise.all([getProfile(), getAppointments()])

        if (profileData) {
          setProfile(profileData)
          if (profileData.notification_preferences) {
            setNotifications(profileData.notification_preferences)
          }
        }
        if (appointmentsData) {
          setAppointments(appointmentsData)
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [])

  const handleSaveField = useCallback(
    async (field: "name" | "phone" | "avatar_url", value: string) => {
      setIsSaving(true)
      try {
        const updates: Partial<Pick<UserProfile, "full_name" | "phone" | "avatar_url">> = {}
        if (field === "name") updates.full_name = value
        if (field === "phone") updates.phone = value
        if (field === "avatar_url") updates.avatar_url = value

        await updateProfile(updates)
        setProfile((prev) => (prev ? { ...prev, ...updates } : null))
      } catch (err) {
        console.error("Erro ao salvar:", err)
      } finally {
        setIsSaving(false)
        setEditModal(null)
        setEditValue("")
      }
    },
    [])

  const openEdit = useCallback(
    (field: "name" | "phone") => {
      setEditValue((profile?.full_name || "") as string)
      if (field === "phone") {
        setEditValue((profile?.phone || "") as string)
      }
      setEditModal(field)
    },
    [profile]
  )

  const handleCloseModal = useCallback(() => {
    setEditModal(null)
  }, [])

  const handleChangeValue = useCallback((value: string) => {
    setEditValue(value)
  }, [])

  const totalCuts = appointments.length
  const lastCut = appointments[appointments.length - 1]

  interface MenuItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onClick: () => void;
    danger?: boolean;
  }

  const MenuItem = ({ icon, title, subtitle, onClick, danger = false }: MenuItemProps) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${danger ? "text-red-400" : ""}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? "bg-red-500/10" : "bg-neutral-800"}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className={`font-medium ${danger ? "text-red-400" : "text-white"}`}>{title}</p>
        {subtitle && <p className="text-white/40 text-xs">{subtitle}</p>}
      </div>
      <ChevronRight className={`w-5 h-5 ${danger ? "text-red-400/50" : "text-white/30"}`} />
    </button>
  )

  interface ToggleProps {
    checked: boolean;
    onChange: () => void;
  }

  const Toggle = ({ checked, onChange }: ToggleProps) => (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full transition-colors ${checked ? "bg-amber-500" : "bg-neutral-700"}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-0.5"}`} />
    </button>
  )

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <main className="relative min-h-screen bg-black flex flex-col">
      <TopHeader showBack />

      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditModal("photo")}
            className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden relative group"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url!} alt="Foto" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white/40" />
            )}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile?.full_name || "Cliente"}</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-4">
        <div className="bg-neutral-900 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              Meus Dados
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            <button
              onClick={() => openEdit("name")}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                <User className="w-5 h-5 text-white/60" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Nome completo</p>
                <p className="text-white/40 text-xs">{profile?.full_name || "Adicionar nome"}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </button>

            <div className="w-full flex items-center gap-4 p-4 text-left opacity-60">
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                <span className="text-white/60 text-sm font-bold">@</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Email</p>
                <p className="text-white/40 text-xs">{profile?.email || "Adicionar email"}</p>
              </div>
            </div>

            <button
              onClick={() => openEdit("phone")}
              className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center">
                <span className="text-white/60 text-sm">📱</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Telefone</p>
                <p className="text-white/40 text-xs">{profile?.phone || "Adicionar telefone"}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </button>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-medium flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-500" />
              Meu Histórico
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 border-b border-white/10">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">{totalCuts}</p>
              <p className="text-white/50 text-xs">Cortes realizados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">
                {lastCut ? lastCut.professional?.name?.split(" ")[0] || "-" : "-"}
              </p>
              <p className="text-white/50 text-xs">Último barbeiro</p>
            </div>
          </div>

          <MenuItem
            icon={<Calendar className="w-5 h-5 text-white/60" />}
            title="Ver todos os agendamentos"
            subtitle={`${totalCuts} registros`}
            onClick={() => router.push("/appointments")}
          />
        </div>

        <div className="bg-neutral-900 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Notificações
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-white text-sm">Lembretes de agendamento</p>
                <p className="text-white/40 text-xs">1 dia antes</p>
              </div>
              <Toggle
                checked={notifications.reminders}
                onChange={() => setNotifications((prev) => ({ ...prev, reminders: !prev.reminders }))}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-white text-sm">Promoções e ofertas</p>
                <p className="text-white/40 text-xs">Descontos exclusivos</p>
              </div>
              <Toggle
                checked={notifications.promotions}
                onChange={() => setNotifications((prev) => ({ ...prev, promotions: !prev.promotions }))}
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="text-white text-sm">Novidades</p>
                <p className="text-white/40 text-xs">Serviços e barbeiros</p>
              </div>
              <Toggle
                checked={notifications.news}
                onChange={() => setNotifications((prev) => ({ ...prev, news: !prev.news }))}
              />
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-white font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Privacidade e Segurança
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            <MenuItem
              icon={<FileText className="w-5 h-5 text-white/60" />}
              title="Termos de Uso"
              onClick={() => setLegalModalType("terms")}
            />
            <MenuItem
              icon={<Shield className="w-5 h-5 text-white/60" />}
              title="Política de Privacidade"
              onClick={() => setLegalModalType("privacy")}
            />
            <MenuItem
              icon={<LogOut className="w-5 h-5 text-red-400" />}
              title="Sair da conta"
              danger
              onClick={handleSignOut}
            />
          </div>
        </div>

        <p className="text-center text-white/20 text-xs pt-4">Street Hair v1.0.0</p>
      </div>

      <BottomNavigationBar />

      <EditModal
        editModal={editModal}
        editValue={editValue}
        profile={profile}
        isSaving={isSaving}
        onClose={handleCloseModal}
        onSave={handleSaveField}
        onChangeValue={handleChangeValue}
      />

      {/* Janela de Termos / Privacidade controlada por state local */}
      <LegalModal
        isOpen={legalModalType !== null}
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </main>
  )
}
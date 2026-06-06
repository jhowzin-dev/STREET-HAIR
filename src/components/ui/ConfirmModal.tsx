import { X } from "lucide-react"

interface ConfirmModalProps {
  open: boolean
  message: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export default function ConfirmModal({ open, message, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-neutral-900 w-full max-w-md rounded-xl p-6">
        <p className="text-white mb-4 text-center">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-neutral-600 text-white rounded"
          >
            Não
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-amber-500 text-black rounded"
          >
            Sim
          </button>
        </div>
        <button onClick={onCancel} className="absolute top-4 right-4 p-2">
          <X className="w-5 h-5 text-white/60" />
        </button>
      </div>
    </div>
  )
}

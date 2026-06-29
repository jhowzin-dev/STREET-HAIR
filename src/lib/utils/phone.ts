// Formata um número de telefone brasileiro: aceita apenas os dígitos e aplica máscara
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "")

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : ""
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  // 11 dígitos: (XX) XXXXX-XXXX
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
}

// Remove a formatação e retorna apenas os dígitos
export function removePhoneMask(phone: string): string {
  return phone.replace(/\D/g, "")
}

// Verifica se um número de telefone é válido (11 dígitos = celular)
export function isPhoneValid(phone: string): boolean {
  const digits = removePhoneMask(phone)
  return digits.length === 11
}

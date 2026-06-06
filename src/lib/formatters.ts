// Formata um valor em centavos para string de moeda brasileira

// Centralized timezone for the entire app
const TIMEZONE = "America/Sao_Paulo"

export function getToday(): string {
  // Use en-CA locale to get ISO-like components
  const now = new Date()
  const year = now.toLocaleString("en-CA", { timeZone: TIMEZONE, year: "numeric" })
  const month = now.toLocaleString("en-CA", { timeZone: TIMEZONE, month: "2-digit" })
  const day = now.toLocaleString("en-CA", { timeZone: TIMEZONE, day: "2-digit" })
  return `${year}-${month}-${day}`
}

export function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`
}

 // Converte uma string de moeda para centavos

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".")
  return Math.round(parseFloat(cleaned) * 100)
}

export function formatDate(date: string): string {
  // Format full date (e.g., 5 de junho de 2026) using the app timezone
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  })
}

   // Formata uma data ISO para formato curto
 
export function formatDateShort(date: string): string {
  // Short date (dd/mm) respecting app timezone
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: TIMEZONE,
  })
}

  // Retorna a data de hoje no formato YYYY-MM-DD
export function todayStr(): string {
  return getToday()
}

   // Formata um horário (HH:MM:SS) para formato curto

export function formatFull(date: string): string {
  // Full date with weekday (e.g., "sexta-feira, 5 de junho de 2026")
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMEZONE,
  })
}

export function formatTime(time: string): string {
  return time.substring(0, 5)
}

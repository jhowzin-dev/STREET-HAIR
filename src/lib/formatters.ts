// Formata um valor em centavos para string de moeda brasileira

export function formatCurrency(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`
}

 // Converte uma string de moeda para centavos

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".")
  return Math.round(parseFloat(cleaned) * 100)
}

export function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

   // Formata uma data ISO para formato curto
 
export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

  // Retorna a data de hoje no formato YYYY-MM-DD
export function todayStr(): string {
  return new Date().toISOString().split("T")[0]
}

   // Formata um horário (HH:MM:SS) para formato curto

export function formatTime(time: string): string {
  return time.substring(0, 5)
}

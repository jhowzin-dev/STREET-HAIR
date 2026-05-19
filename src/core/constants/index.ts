


export const BUSINESS_HOURS = {
 
  OPEN: "09:00",

  CLOSE: "19:30",

  CLOSE_SATURDAY: "18:00",

  CLOSED_DAYS: ["Dom", "Seg"] as const,
 
  OPEN_DAYS: [
    { day: "Ter", start: "09:00", end: "19:30" },
    { day: "Qua", start: "09:00", end: "19:30" },
    { day: "Qui", start: "09:00", end: "19:30" },
    { day: "Sex", start: "09:00", end: "19:30" },
    { day: "Sáb", start: "09:00", end: "18:00" },
  ] as const,
} as const;


export const BOOKING = {

  SLOT_MINUTES: 40,
  START_HOUR: 9,
  START_MINUTE: 0,
  END_HOUR: 19,

  END_MINUTE: 30,
} as const;

// ============ SUPABASE TABLES ============
export const DB_TABLES = {
  PROFILES: "profiles",
  APPOINTMENTS: "appointments",
  PROFESSIONALS: "professionals",
  SERVICES: "services",
} as const;

// ============ STATUS DE AGENDAMENTO ============
export const APPOINTMENT_STATUS = {
  CONFIRMED: "confirmed",
  CANCELED: "canceled",
  COMPLETED: "completed",
} as const;

// ============ PAGINAÇÃO / LIMITES ============
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ============ NOTIFICAÇÕES ============
export const NOTIFICATION_DEFAULTS = {
  reminders: true,
  promotions: false,
  news: true,
} as const;

// ============ APP INFO ============
export const APP_INFO = {
  NAME: "Street Hair",
  VERSION: "1.0.0",
  SINCE: 2020,
  SLOGAN: "Estilo é a assinatura da sua atitude",
  CONTACT: {
    WHATSAPP: "https://wa.me/5511999999999",
    INSTAGRAM: "https://instagram.com/streethair",
    MAPS: "https://maps.google.com",
  },
  ADDRESS: {
    STREET: "Rua das Navalhas, 404",
    NEIGHBORHOOD: "Bairro Hipster",
    CITY: "São Paulo",
    STATE: "SP",
    CEP: "01234-567",
  },
} as const;

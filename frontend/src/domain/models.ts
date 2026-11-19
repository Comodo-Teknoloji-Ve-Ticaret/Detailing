// Domain modelleri — backend (ComodoDetailing.Domain) ile birebir aynı sözleşme.

export type ServiceCategory = 'detailing' | 'ceramic' | 'ppf'

export interface VehicleSegment {
  id: string
  name: string
  examples: string
  /** Fiyat çarpanı (Hatchback = 1.0) */
  priceMultiplier: number
  /** İşçilik süresi çarpanı */
  durationMultiplier: number
}

export interface ServicePackage {
  id: string
  category: ServiceCategory
  name: string
  tagline: string
  /** Hatchback segmenti için baz fiyat (TL) */
  basePrice: number
  /** Hatchback için tahmini işçilik (saat) */
  baseDurationHours: number
  /** Koruma / garanti süresi (ay) — detailing için 0 */
  protectionMonths: number
  /** İşlem sonrası beklenen parlaklık (GU — Gloss Unit, 60°) */
  glossAfter: number
  features: string[]
  popular?: boolean
}

export interface AddOn {
  id: string
  name: string
  price: number
  /** true ise segment çarpanı uygulanır */
  scalesWithSegment: boolean
}

export interface Catalog {
  segments: VehicleSegment[]
  packages: ServicePackage[]
  addOns: AddOn[]
}

export interface QuoteRequest {
  segmentId: string
  packageId: string
  addOnIds: string[]
}

export interface QuoteLine {
  label: string
  amount: number
}

export interface Quote {
  segmentId: string
  packageId: string
  addOnIds: string[]
  lines: QuoteLine[]
  total: number
  estimatedHours: number
  /** İş günü cinsinden teslim süresi */
  deliveryDays: number
}

export interface TimeSlot {
  time: string // "09:00"
  available: boolean
  remaining: number
}

export interface DayAvailability {
  date: string // "2026-11-20"
  closed: boolean
  slots: TimeSlot[]
}

export type AppointmentStatus = 'Onay Bekliyor' | 'Onaylandı' | 'İşlemde' | 'Teslime Hazır' | 'Teslim Edildi'

export interface CreateAppointmentRequest {
  segmentId: string
  packageId: string
  addOnIds: string[]
  date: string
  time: string
  customerName: string
  phone: string
  email?: string
  vehicleBrandModel: string
  plate: string
  note?: string
}

export interface Appointment {
  code: string
  segmentId: string
  segmentName: string
  packageId: string
  packageName: string
  addOnIds: string[]
  date: string
  time: string
  customerName: string
  phone: string
  email?: string
  vehicleBrandModel: string
  plate: string
  note?: string
  total: number
  deliveryDays: number
  status: AppointmentStatus
  createdAt: string
}

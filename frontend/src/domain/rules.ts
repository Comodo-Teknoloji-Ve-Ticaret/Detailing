// Saf iş kuralları — backend'deki PricingCalculator & SchedulingRules ile aynı mantık.
import type { AddOn, Catalog, DayAvailability, Quote, QuoteRequest, ServicePackage, VehicleSegment } from './models'

export const SCHEDULE = {
  openHour: 9,
  closeHour: 18, // son kabul 17:00
  slotMinutes: 60,
  bayCapacity: 2, // aynı saatte kabul edilebilecek araç sayısı
  closedWeekdays: [0], // Pazar
  bookingWindowDays: 30,
  workHoursPerDay: 9,
}

/** 50 TL'ye yuvarlar */
export function roundPrice(value: number): number {
  return Math.round(value / 50) * 50
}

export function priceForSegment(pkg: ServicePackage, segment: VehicleSegment): number {
  return roundPrice(pkg.basePrice * segment.priceMultiplier)
}

export function addOnPrice(addOn: AddOn, segment: VehicleSegment): number {
  return addOn.scalesWithSegment ? roundPrice(addOn.price * segment.priceMultiplier) : addOn.price
}

export function calculateQuote(catalog: Catalog, req: QuoteRequest): Quote {
  const segment = catalog.segments.find((s) => s.id === req.segmentId)
  const pkg = catalog.packages.find((p) => p.id === req.packageId)
  if (!segment) throw new Error('Araç segmenti bulunamadı.')
  if (!pkg) throw new Error('Paket bulunamadı.')

  const addOns = catalog.addOns.filter((a) => req.addOnIds.includes(a.id))
  const lines = [
    { label: `${pkg.name} — ${segment.name}`, amount: priceForSegment(pkg, segment) },
    ...addOns.map((a) => ({ label: a.name, amount: addOnPrice(a, segment) })),
  ]
  const estimatedHours = Math.ceil(pkg.baseDurationHours * segment.durationMultiplier + addOns.length * 0.5)

  return {
    segmentId: segment.id,
    packageId: pkg.id,
    addOnIds: addOns.map((a) => a.id),
    lines,
    total: lines.reduce((sum, l) => sum + l.amount, 0),
    estimatedHours,
    deliveryDays: Math.max(1, Math.ceil(estimatedHours / SCHEDULE.workHoursPerDay)),
  }
}

export function slotTimes(): string[] {
  const times: string[] = []
  for (let h = SCHEDULE.openHour; h < SCHEDULE.closeHour; h++) times.push(`${String(h).padStart(2, '0')}:00`)
  return times
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function buildAvailability(
  date: string,
  bookedTimes: string[],
  now: Date = new Date(),
): DayAvailability {
  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(y, m - 1, d)
  const closed = SCHEDULE.closedWeekdays.includes(day.getDay())
  const isToday = toIsoDate(now) === date

  const slots = slotTimes().map((time) => {
    const used = bookedTimes.filter((t) => t === time).length
    const remaining = Math.max(0, SCHEDULE.bayCapacity - used)
    const hour = Number(time.slice(0, 2))
    const past = isToday && hour <= now.getHours()
    return { time, remaining, available: !closed && !past && remaining > 0 }
  })
  return { date, closed, slots }
}

/** Telefonu 05XX XXX XX XX biçiminde doğrular */
export function isValidPhone(phone: string): boolean {
  return /^0?5\d{9}$/.test(phone.replace(/\D/g, ''))
}

/** Türk plaka biçimi: 34 ABC 123, 06 AB 1234, 07 A 12345 */
export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/\s+/g, ' ').trim()
}

export function isValidPlate(plate: string): boolean {
  return /^(0[1-9]|[1-7]\d|8[01])\s?[A-ZÇĞİÖŞÜ]{1,3}\s?\d{2,5}$/.test(normalizePlate(plate))
}

export function formatTL(value: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
}

// localStorage tabanlı mock servisler — API hazır olana kadar front bağımsız çalışır.
import type { Services } from '../../application/ports'
import type { Appointment, CreateAppointmentRequest } from '../../domain/models'
import { buildAvailability, calculateQuote, isValidPhone, isValidPlate, normalizePlate } from '../../domain/rules'
import { seedCatalog } from './seed'

const STORAGE_KEY = 'comodo-detailing-appointments'
const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms))

function load(): Appointment[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Appointment[]
  } catch {
    return []
  }
}

function save(list: Appointment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* depolama kapalı olabilir */
  }
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPRSTUVYZ23456789'
  let code = 'CMD-'
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export const mockServices: Services = {
  catalog: {
    async getCatalog() {
      await delay(150)
      return structuredClone(seedCatalog)
    },
    async calculateQuote(req) {
      await delay(80)
      return calculateQuote(seedCatalog, req)
    },
  },
  appointments: {
    async getAvailability(date) {
      await delay(150)
      const booked = load().filter((a) => a.date === date).map((a) => a.time)
      return buildAvailability(date, booked)
    },
    async create(req: CreateAppointmentRequest) {
      await delay(400)
      if (!req.customerName.trim()) throw new Error('Ad Soyad zorunludur.')
      if (!isValidPhone(req.phone)) throw new Error('Geçerli bir cep telefonu girin (05XX XXX XX XX).')
      if (!isValidPlate(req.plate)) throw new Error('Plaka biçimi geçersiz (örn. 07 ABC 123).')

      const list = load()
      const availability = buildAvailability(req.date, list.filter((a) => a.date === req.date).map((a) => a.time))
      if (!availability.slots.find((s) => s.time === req.time)?.available)
        throw new Error('Seçilen saat artık dolu, lütfen başka bir saat seçin.')

      const quote = calculateQuote(seedCatalog, req)
      const segment = seedCatalog.segments.find((s) => s.id === req.segmentId)!
      const pkg = seedCatalog.packages.find((p) => p.id === req.packageId)!
      const appointment: Appointment = {
        ...req,
        plate: normalizePlate(req.plate),
        code: generateCode(),
        segmentName: segment.name,
        packageName: pkg.name,
        addOnIds: quote.addOnIds,
        total: quote.total,
        deliveryDays: quote.deliveryDays,
        status: 'Onay Bekliyor',
        createdAt: new Date().toISOString(),
      }
      save([...list, appointment])
      return appointment
    },
    async getByCode(code) {
      await delay(200)
      return load().find((a) => a.code === code.trim().toUpperCase()) ?? null
    },
  },
}

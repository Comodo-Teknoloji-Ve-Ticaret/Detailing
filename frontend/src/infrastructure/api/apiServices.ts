// .NET WebApi adaptörü — VITE_DATA_SOURCE=api ile devreye girer.
import type { Services } from '../../application/ports'
import type { Appointment, Catalog, DayAvailability, Quote } from '../../domain/models'
import { ApiError, http } from '../http/httpClient'

export const apiServices: Services = {
  catalog: {
    getCatalog: () => http.get<Catalog>('/catalog'),
    calculateQuote: (req) => http.post<Quote>('/quotes', req),
  },
  appointments: {
    getAvailability: (date) => http.get<DayAvailability>(`/availability?date=${encodeURIComponent(date)}`),
    create: (req) => http.post<Appointment>('/appointments', req),
    async getByCode(code) {
      try {
        return await http.get<Appointment>(`/appointments/${encodeURIComponent(code.trim().toUpperCase())}`)
      } catch (e) {
        if (e instanceof ApiError && e.status === 404) return null
        throw e
      }
    },
  },
}

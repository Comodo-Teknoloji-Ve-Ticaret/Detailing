// Application katmanı port sözleşmeleri — UI yalnızca bu arayüzleri bilir.
import type {
  Appointment,
  Catalog,
  CreateAppointmentRequest,
  DayAvailability,
  Quote,
  QuoteRequest,
} from '../domain/models'

export interface CatalogServicePort {
  getCatalog(): Promise<Catalog>
  calculateQuote(request: QuoteRequest): Promise<Quote>
}

export interface AppointmentServicePort {
  getAvailability(date: string): Promise<DayAvailability>
  create(request: CreateAppointmentRequest): Promise<Appointment>
  getByCode(code: string): Promise<Appointment | null>
}

export interface Services {
  catalog: CatalogServicePort
  appointments: AppointmentServicePort
}

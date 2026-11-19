import { CalendarCheck, CheckCircle2, Copy, Loader2, Search } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import type { Appointment, Catalog, DayAvailability, Quote } from '../domain/models'
import { formatTL, isValidPhone, isValidPlate, SCHEDULE, toIsoDate } from '../domain/rules'
import { services } from '../infrastructure/container'

interface Props {
  catalog: Catalog
  segmentId: string
  packageId: string
  addOnIds: string[]
  quote: Quote | null
}

const dayFmt = new Intl.DateTimeFormat('tr-TR', { weekday: 'short' })
const dateFmt = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' })
const longFmt = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

function upcomingDays(count: number): Date[] {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  return Array.from({ length: count }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i))
}

function parseIso(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function Booking({ catalog, segmentId, packageId, addOnIds, quote }: Props) {
  const days = useMemo(() => upcomingDays(14), [])
  const firstOpen = days.find((d) => !SCHEDULE.closedWeekdays.includes(d.getDay())) ?? days[0]
  const [date, setDate] = useState(toIsoDate(firstOpen))
  const [availability, setAvailability] = useState<DayAvailability | null>(null)
  const [time, setTime] = useState('')
  const [form, setForm] = useState({ customerName: '', phone: '', email: '', vehicleBrandModel: '', plate: '', note: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [created, setCreated] = useState<Appointment | null>(null)

  useEffect(() => {
    let alive = true
    setAvailability(null)
    setTime('')
    services.appointments.getAvailability(date).then((a) => alive && setAvailability(a))
    return () => {
      alive = false
    }
  }, [date, created])

  const segment = catalog.segments.find((s) => s.id === segmentId)
  const pkg = catalog.packages.find((p) => p.id === packageId)

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }))

  function validate() {
    const e: Record<string, string> = {}
    if (!form.customerName.trim()) e.customerName = 'Ad Soyad zorunludur.'
    if (!isValidPhone(form.phone)) e.phone = 'Örn. 0532 123 45 67'
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Geçerli bir e-posta girin.'
    if (!form.vehicleBrandModel.trim()) e.vehicleBrandModel = 'Marka / model girin.'
    if (!isValidPlate(form.plate)) e.plate = 'Örn. 07 ABC 123'
    if (!time) e.time = 'Lütfen bir saat seçin.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setSubmitting(true)
    try {
      const a = await services.appointments.create({
        segmentId,
        packageId,
        addOnIds,
        date,
        time,
        ...form,
        email: form.email || undefined,
        note: form.note || undefined,
      })
      setCreated(a)
      setForm({ customerName: '', phone: '', email: '', vehicleBrandModel: '', plate: '', note: '' })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Randevu oluşturulamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section section-alt" id="randevu">
      <div className="container">
        <header className="section-head">
          <span className="eyebrow">Online Randevu</span>
          <h2>Aracınızı bırakacağınız saati seçin</h2>
          <p>Pazartesi–Cumartesi 09:00–18:00. Her saat diliminde {SCHEDULE.bayCapacity} araç kabul ediyoruz.</p>
        </header>

        {created ? (
          <div className="success-card">
            <CheckCircle2 size={44} className="accent" aria-hidden />
            <h3>Randevu talebiniz alındı</h3>
            <p>
              <strong>{longFmt.format(parseIso(created.date))}, {created.time}</strong> için {created.packageName} ({created.segmentName}) randevunuz
              oluşturuldu. Ekibimiz 30 dakika içinde arayarak onaylayacak.
            </p>
            <div className="code-box">
              <span>Randevu kodunuz</span>
              <strong>{created.code}</strong>
              <button className="icon-btn" onClick={() => navigator.clipboard?.writeText(created.code)} aria-label="Kodu kopyala">
                <Copy size={16} />
              </button>
            </div>
            <p className="muted">Toplam {formatTL(created.total)} · tahmini teslim {created.deliveryDays} iş günü</p>
            <button className="btn btn-ghost" onClick={() => setCreated(null)}>Yeni randevu oluştur</button>
          </div>
        ) : (
          <form className="booking-grid" onSubmit={submit} noValidate>
            <div className="booking-col">
              <div className="selected-box">
                <span className="muted small">Seçili hizmet</span>
                <strong>{pkg?.name ?? '—'}</strong>
                <span>{segment?.name}{addOnIds.length ? ` · +${addOnIds.length} ekstra` : ''}</span>
                <span className="selected-price">{quote ? formatTL(quote.total) : ''}</span>
                <a href="#fiyatlar" className="link-btn">Değiştir</a>
              </div>

              <fieldset className="fieldset">
                <legend>Tarih</legend>
                <div className="day-strip">
                  {days.map((d) => {
                    const iso = toIsoDate(d)
                    const closed = SCHEDULE.closedWeekdays.includes(d.getDay())
                    return (
                      <button
                        type="button"
                        key={iso}
                        disabled={closed}
                        className={`day ${iso === date ? 'is-active' : ''}`}
                        onClick={() => setDate(iso)}
                        aria-pressed={iso === date}
                      >
                        <small>{dayFmt.format(d)}</small>
                        <strong>{d.getDate()}</strong>
                        <small>{closed ? 'Kapalı' : dateFmt.format(d).split(' ')[1]}</small>
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset className="fieldset">
                <legend>Saat</legend>
                {!availability ? (
                  <p className="muted"><Loader2 size={16} className="spin" aria-hidden /> Uygunluk yükleniyor…</p>
                ) : availability.closed ? (
                  <p className="muted">Bu gün kapalıyız.</p>
                ) : (
                  <div className="slot-grid">
                    {availability.slots.map((s) => (
                      <button
                        type="button"
                        key={s.time}
                        disabled={!s.available}
                        className={`slot ${s.time === time ? 'is-active' : ''}`}
                        onClick={() => setTime(s.time)}
                        aria-pressed={s.time === time}
                      >
                        {s.time}
                        <small>{s.available ? (s.remaining === 1 ? 'Son 1 yer' : 'Müsait') : 'Dolu'}</small>
                      </button>
                    ))}
                  </div>
                )}
                {errors.time && <p className="field-error">{errors.time}</p>}
              </fieldset>
            </div>

            <div className="booking-col">
              <div className="form-grid">
                <Field label="Ad Soyad" error={errors.customerName}>
                  <input value={form.customerName} onChange={set('customerName')} autoComplete="name" />
                </Field>
                <Field label="Cep Telefonu" error={errors.phone}>
                  <input value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" placeholder="05XX XXX XX XX" />
                </Field>
                <Field label="E-posta (isteğe bağlı)" error={errors.email}>
                  <input value={form.email} onChange={set('email')} type="email" autoComplete="email" />
                </Field>
                <Field label="Plaka" error={errors.plate}>
                  <input value={form.plate} onChange={set('plate')} placeholder="07 ABC 123" style={{ textTransform: 'uppercase' }} />
                </Field>
                <Field label="Marka / Model" error={errors.vehicleBrandModel} wide>
                  <input value={form.vehicleBrandModel} onChange={set('vehicleBrandModel')} placeholder="Örn. BMW 320i 2022" />
                </Field>
                <Field label="Not (isteğe bağlı)" wide>
                  <textarea value={form.note} onChange={set('note')} rows={3} placeholder="Boya durumu, özel istekler…" />
                </Field>
              </div>
              {serverError && <p className="form-alert" role="alert">{serverError}</p>}
              <button className="btn btn-primary btn-block btn-lg" disabled={submitting || !quote}>
                {submitting ? <Loader2 size={18} className="spin" aria-hidden /> : <CalendarCheck size={18} aria-hidden />}
                {time ? `${dateFmt.format(parseIso(date))} ${time} için randevu al` : 'Randevu al'}
              </button>
              <p className="muted small center">Ödeme araç tesliminde alınır. Ücretsiz iptal: 24 saat öncesine kadar.</p>
            </div>
          </form>
        )}

        <Lookup />
      </div>
    </section>
  )
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`field ${wide ? 'field-wide' : ''} ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

function Lookup() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<Appointment | null | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  async function search(e: FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    try {
      setResult(await services.appointments.getByCode(code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lookup">
      <form onSubmit={search} className="lookup-form">
        <label htmlFor="lookup-code">Randevu sorgula</label>
        <div className="lookup-row">
          <input id="lookup-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="CMD-XXXXXX" />
          <button className="btn btn-ghost" disabled={loading}><Search size={16} aria-hidden /> Sorgula</button>
        </div>
      </form>
      {result === null && <p className="field-error">Bu koda ait randevu bulunamadı.</p>}
      {result && (
        <div className="lookup-result">
          <span className="status-pill">{result.status}</span>
          <strong>{result.packageName}</strong>
          <span>{longFmt.format(parseIso(result.date))} · {result.time}</span>
          <span>{result.vehicleBrandModel} · {result.plate}</span>
          <span>{formatTL(result.total)}</span>
        </div>
      )}
    </div>
  )
}

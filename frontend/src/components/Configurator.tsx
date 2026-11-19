import { Check, Clock, ShieldCheck, Sparkles, Table2 } from 'lucide-react'
import { useState } from 'react'
import type { Catalog, Quote, ServiceCategory } from '../domain/models'
import { addOnPrice, formatTL, priceForSegment } from '../domain/rules'

const IMG = `${import.meta.env.BASE_URL}images/`

const CATEGORIES: { id: ServiceCategory; label: string; desc: string }[] = [
  { id: 'detailing', label: 'Detailing', desc: 'Temizlik & pasta cila' },
  { id: 'ceramic', label: 'Seramik Kaplama', desc: '1–5 yıl SiO₂ koruma' },
  { id: 'ppf', label: 'PPF Film', desc: 'Taş & çizik kalkanı' },
]

interface Props {
  catalog: Catalog
  segmentId: string
  packageId: string
  addOnIds: string[]
  quote: Quote | null
  onSegment: (id: string) => void
  onPackage: (id: string) => void
  onToggleAddOn: (id: string) => void
  onBook: () => void
}

export function Configurator({ catalog, segmentId, packageId, addOnIds, quote, onSegment, onPackage, onToggleAddOn, onBook }: Props) {
  const segment = catalog.segments.find((s) => s.id === segmentId)!
  const selectedPkg = catalog.packages.find((p) => p.id === packageId)
  const [category, setCategory] = useState<ServiceCategory>(selectedPkg?.category ?? 'ceramic')
  const [showTable, setShowTable] = useState(false)
  // Paket başka bir bölümden (ör. parlaklık kaydırıcısı) değişirse sekme de takip etsin
  const [syncedPkg, setSyncedPkg] = useState(packageId)
  if (syncedPkg !== packageId) {
    setSyncedPkg(packageId)
    if (selectedPkg) setCategory(selectedPkg.category)
  }
  const activeCategory = category
  const pkgs = catalog.packages.filter((p) => p.category === activeCategory)

  return (
    <section className="section" id="fiyatlar">
      <div className="container">
        <header className="section-head split">
          <div>
            <span className="eyebrow">Fiyatlar</span>
            <h2>Segmentinizi seçin, fiyatı anında görün.</h2>
          </div>
          <p>Tüm fiyatlar KDV dahildir. Aracı gördükten sonra sürpriz ek ücret çıkmaz.</p>
        </header>

        <div className="config-grid">
          <div className="config-main">
            <h3 className="step-title"><span>1</span> Araç segmenti</h3>
            <div className="segment-grid" role="radiogroup" aria-label="Araç segmenti">
              {catalog.segments.map((s) => (
                <button
                  key={s.id}
                  role="radio"
                  aria-checked={s.id === segmentId}
                  className={`segment-card ${s.id === segmentId ? 'is-active' : ''}`}
                  onClick={() => onSegment(s.id)}
                >
                  <span className="segment-photo">
                    <img src={`${IMG}seg-${s.id}.jpg`} alt="" loading="lazy" />
                  </span>
                  <span className="segment-text">
                    <strong>{s.name}</strong>
                    <small>{s.examples}</small>
                  </span>
                </button>
              ))}
            </div>

            <h3 className="step-title"><span>2</span> Hizmet ve paket</h3>
            <div className="tabs" role="tablist">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={c.id === activeCategory}
                  className={`tab ${c.id === activeCategory ? 'is-active' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  <strong>{c.label}</strong>
                  <small>{c.desc}</small>
                </button>
              ))}
            </div>

            <div className="package-grid">
              {pkgs.map((p) => {
                const active = p.id === packageId
                return (
                  <article key={p.id} className={`package-card ${active ? 'is-active' : ''} ${p.popular ? 'is-popular' : ''}`}>
                    {p.popular && <span className="badge">En çok tercih edilen</span>}
                    <h4>{p.name}</h4>
                    <p className="muted">{p.tagline}</p>
                    <div className="price">
                      {formatTL(priceForSegment(p, segment))}
                      <small>{segment.name}</small>
                    </div>
                    <ul className="feature-list">
                      {p.features.map((f) => (
                        <li key={f}><Check size={16} aria-hidden /> {f}</li>
                      ))}
                    </ul>
                    <div className="package-meta">
                      <span><Clock size={14} aria-hidden /> ~{Math.ceil(p.baseDurationHours * segment.durationMultiplier)} saat</span>
                      {p.protectionMonths > 0 && (
                        <span><ShieldCheck size={14} aria-hidden /> {p.protectionMonths / 12} yıl garanti</span>
                      )}
                    </div>
                    <button className={`btn ${active ? 'btn-primary' : 'btn-ghost'} btn-block`} onClick={() => onPackage(p.id)}>
                      {active ? 'Seçildi' : 'Bu paketi seç'}
                    </button>
                  </article>
                )
              })}
            </div>

            <h3 className="step-title"><span>3</span> Ekstralar <em>(isteğe bağlı)</em></h3>
            <div className="addon-grid">
              {catalog.addOns.map((a) => {
                const on = addOnIds.includes(a.id)
                return (
                  <label key={a.id} className={`addon ${on ? 'is-active' : ''}`}>
                    <input type="checkbox" checked={on} onChange={() => onToggleAddOn(a.id)} />
                    <span className="addon-check"><Check size={14} aria-hidden /></span>
                    <span className="addon-name">{a.name}</span>
                    <span className="addon-price">+{formatTL(addOnPrice(a, segment))}</span>
                  </label>
                )
              })}
            </div>

            <button className="link-btn" onClick={() => setShowTable((v) => !v)} aria-expanded={showTable}>
              <Table2 size={16} aria-hidden /> {showTable ? 'Tüm segment fiyat tablosunu gizle' : 'Tüm segmentlerin fiyat tablosunu göster'}
            </button>
            {showTable && (
              <div className="table-wrap">
                <table className="price-table">
                  <thead>
                    <tr>
                      <th scope="col">Paket</th>
                      {catalog.segments.map((s) => (
                        <th key={s.id} scope="col" className={s.id === segmentId ? 'is-col' : ''}>{s.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {catalog.packages.map((p) => (
                      <tr key={p.id} className={p.id === packageId ? 'is-row' : ''}>
                        <th scope="row">{p.name}</th>
                        {catalog.segments.map((s) => (
                          <td key={s.id} className={s.id === segmentId ? 'is-col' : ''}>{formatTL(priceForSegment(p, s))}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <aside className="summary" aria-live="polite">
            <figure className="summary-car">
              <img key={segment.id} src={`${IMG}seg-${segment.id}.jpg`} alt={`${segment.name} segmenti örnek araç`} />
              <figcaption>
                <strong>{segment.name}</strong>
                <span>{segment.examples}</span>
              </figcaption>
            </figure>
            <h3><Sparkles size={18} aria-hidden /> Teklif özeti</h3>
            {quote ? (
              <>
                <ul className="summary-lines">
                  {quote.lines.map((l) => (
                    <li key={l.label}><span>{l.label}</span><strong>{formatTL(l.amount)}</strong></li>
                  ))}
                </ul>
                <div className="summary-total">
                  <span>Toplam</span>
                  <strong>{formatTL(quote.total)}</strong>
                </div>
                <p className="muted small">
                  Tahmini işçilik {quote.estimatedHours} saat · teslim {quote.deliveryDays} iş günü
                </p>
                <button className="btn btn-primary btn-block" onClick={onBook}>Bu teklifle randevu al</button>
              </>
            ) : (
              <p className="muted">Bir paket seçin.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  )
}

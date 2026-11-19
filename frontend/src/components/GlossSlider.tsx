import { useCallback, useRef, useState } from 'react'
import type { ServicePackage } from '../domain/models'
import { GLOSS_BEFORE } from '../infrastructure/mock/seed'
import { CarArt, type Finish } from './CarArt'

const COLORS = [
  { name: 'Gece Siyahı', value: '#15171b' },
  { name: 'Safir Mavi', value: '#1d3f8f' },
  { name: 'Yakut Kırmızı', value: '#9b1420' },
  { name: 'Grafit Gri', value: '#4a5058' },
  { name: 'İnci Beyaz', value: '#d9dde2' },
]

interface Props {
  packages: ServicePackage[]
  selectedPackageId: string
  onSelectPackage: (id: string) => void
}

export function GlossSlider({ packages, selectedPackageId, onSelectPackage }: Props) {
  const [pos, setPos] = useState(50)
  const [color, setColor] = useState(COLORS[0].value)
  const frameRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const pkg = packages.find((p) => p.id === selectedPackageId) ?? packages[0]
  const finish: Finish = pkg?.id === 'ppf-matte' ? 'matte' : 'gloss'
  const glossAfter = pkg?.glossAfter ?? 90
  const gain = glossAfter - GLOSS_BEFORE

  const updateFromPointer = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(100, Math.max(0, pct)))
  }, [])

  // Ekranda görünen yüzeyin ağırlıklı ortalama parlaklığı
  const readout = Math.round((GLOSS_BEFORE * pos + glossAfter * (100 - pos)) / 100)

  return (
    <section className="section" id="parlaklik">
      <div className="container">
        <header className="section-head">
          <span className="eyebrow">Öncesi / Sonrası</span>
          <h2>Parlaklığı kendiniz kaydırarak görün</h2>
          <p>
            Paketi seçin, çizgiyi sürükleyin. Solda işlem öncesi hareli ve donuk boya, sağda {pkg?.name} sonrası yüzey.
            Değerler 60° parlaklık ölçer (GU) ortalamalarıdır.
          </p>
        </header>

        <div className="gloss-toolbar">
          <div className="chip-row" role="tablist" aria-label="Paket">
            {packages
              .filter((p) => p.category !== 'detailing' || p.id === 'detail-polish')
              .map((p) => (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={p.id === pkg?.id}
                  className={`chip ${p.id === pkg?.id ? 'is-active' : ''}`}
                  onClick={() => onSelectPackage(p.id)}
                >
                  {p.name}
                </button>
              ))}
          </div>
          <div className="swatches" aria-label="Boya rengi">
            {COLORS.map((c) => (
              <button
                key={c.value}
                className={`swatch ${c.value === color ? 'is-active' : ''}`}
                style={{ background: c.value }}
                title={c.name}
                aria-label={c.name}
                aria-pressed={c.value === color}
                onClick={() => setColor(c.value)}
              />
            ))}
          </div>
        </div>

        <div
          className="gloss-frame"
          ref={frameRef}
          onPointerDown={(e) => {
            dragging.current = true
            ;(e.target as Element).setPointerCapture?.(e.pointerId)
            updateFromPointer(e.clientX)
          }}
          onPointerMove={(e) => dragging.current && updateFromPointer(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <div className="gloss-layer gloss-layer--after">
            <div className="studio-light" />
            <CarArt variant="after" color={color} finish={finish} beads={pkg?.category === 'ceramic'} />
          </div>
          <div className="gloss-layer gloss-layer--before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <CarArt variant="before" color={color} finish="gloss" />
          </div>

          <span className="gloss-tag gloss-tag--left">ÖNCESİ · {GLOSS_BEFORE} GU</span>
          <span className="gloss-tag gloss-tag--right">
            SONRASI · {glossAfter} GU{finish === 'matte' ? ' (saten)' : ''}
          </span>

          <div className="gloss-handle" style={{ left: `${pos}%` }} aria-hidden="true">
            <span className="gloss-knob">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>

          <input
            className="gloss-range"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(pos)}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Öncesi / sonrası karşılaştırma kaydırıcısı"
            aria-valuetext={`Yüzde ${Math.round(pos)} öncesi gösteriliyor`}
          />
        </div>

        <div className="gloss-stats">
          <div className="stat">
            <span className="stat-label">Ekrandaki ortalama</span>
            <strong className="stat-value">{readout} GU</strong>
            <span className="stat-sub">yüzeyin %{Math.round(100 - pos)}'i işlem sonrası</span>
          </div>
          <div className="stat">
            <span className="stat-label">{finish === 'matte' ? 'Görünüm' : 'Parlaklık artışı'}</span>
            <strong className="stat-value accent">
              {finish === 'matte' ? 'Saten mat' : `+${Math.round((gain / GLOSS_BEFORE) * 100)}%`}
            </strong>
            <div className="meter" aria-hidden="true">
              <span className="meter-before" style={{ width: `${GLOSS_BEFORE}%` }} />
              <span className="meter-after" style={{ width: `${glossAfter}%` }} />
            </div>
          </div>
          <div className="stat">
            <span className="stat-label">Koruma süresi</span>
            <strong className="stat-value">
              {pkg && pkg.protectionMonths > 0 ? `${pkg.protectionMonths / 12} yıl` : 'Bakım odaklı'}
            </strong>
            <span className="stat-sub">{pkg?.tagline}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

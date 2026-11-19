import { useCallback, useEffect, useRef, useState } from 'react'
import type { ServicePackage } from '../domain/models'
import { GLOSS_BEFORE } from '../infrastructure/mock/seed'

const BASE = import.meta.env.BASE_URL

const SCENES = [
  { id: 'suv', label: 'Tam araç', src: `${BASE}images/ba-suv.jpg`, alt: 'Siyah SUV, karanlık stüdyoda' },
  { id: 'hood', label: 'Kaput yakın çekim', src: `${BASE}images/ba-hood.jpg`, alt: 'Siyah kaput ve far yakın çekim' },
  { id: 'sport', label: 'Spor araç', src: `${BASE}images/ba-sport.jpg`, alt: 'Lacivert spor araç sokakta' },
]

interface Props {
  packages: ServicePackage[]
  selectedPackageId: string
  onSelectPackage: (id: string) => void
}

/** İşlem öncesi boyadaki hare (swirl), çizik ve toz dokusunu prosedürel üretir. */
function useDefectTexture() {
  const [url, setUrl] = useState('')
  useEffect(() => {
    const c = document.createElement('canvas')
    c.width = 1600
    c.height = 1000
    const ctx = c.getContext('2d')
    if (!ctx) return
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

    // Hareler: ışık noktaları etrafında eşmerkezli ince yaylar
    for (let h = 0; h < 9; h++) {
      const cx = rnd() * 1600
      const cy = rnd() * 1000
      for (let i = 0; i < 260; i++) {
        const r = 8 + rnd() * 260
        const a = rnd() * Math.PI * 2
        ctx.strokeStyle = `rgba(255,255,255,${0.14 + rnd() * 0.3})`
        ctx.lineWidth = 0.6 + rnd() * 0.7
        ctx.beginPath()
        ctx.arc(cx, cy, r, a, a + 0.15 + rnd() * 0.5)
        ctx.stroke()
      }
    }
    // Düz çizikler (kısa, ince)
    for (let i = 0; i < 45; i++) {
      const x = rnd() * 1600
      const y = rnd() * 1000
      const len = 12 + rnd() * 50
      const ang = rnd() * Math.PI
      ctx.strokeStyle = `rgba(255,255,255,${0.25 + rnd() * 0.35})`
      ctx.lineWidth = 0.5 + rnd()
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
      ctx.stroke()
    }
    // Toz ve kireç lekeleri
    for (let i = 0; i < 4200; i++) {
      const r = rnd() * 1.8
      ctx.fillStyle = `rgba(214,200,170,${0.35 + rnd() * 0.5})`
      ctx.beginPath()
      ctx.arc(rnd() * 1600, rnd() * 1000, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // Kireç lekeleri (küçük halkalar)
    for (let i = 0; i < 90; i++) {
      const x = rnd() * 1600
      const y = rnd() * 1000
      const r = 2 + rnd() * 5
      ctx.strokeStyle = `rgba(230,225,210,${0.4 + rnd() * 0.4})`
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
    }
    setUrl(c.toDataURL('image/png'))
  }, [])
  return url
}

export function GlossSlider({ packages, selectedPackageId, onSelectPackage }: Props) {
  const [pos, setPos] = useState(50)
  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const frameRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const defects = useDefectTexture()

  const scene = SCENES.find((s) => s.id === sceneId)!
  const pkg = packages.find((p) => p.id === selectedPackageId) ?? packages[0]
  const matte = pkg?.id === 'ppf-matte'
  const glossAfter = pkg?.glossAfter ?? 90
  const readout = Math.round((GLOSS_BEFORE * pos + glossAfter * (100 - pos)) / 100)

  const updateFromPointer = useCallback((clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  return (
    <section className="section" id="parlaklik">
      <div className="container">
        <header className="section-head split">
          <div>
            <span className="eyebrow">Öncesi / Sonrası</span>
            <h2>Farkı kendiniz görün.</h2>
          </div>
          <p>
            Çizgiyi sürükleyin. Solda hareli, tozlu ve donuk boya; sağda <strong>{pkg?.name}</strong> sonrası yüzey.
          </p>
        </header>

        <div className="ba-toolbar">
          <div className="seg-control" role="tablist" aria-label="Görsel">
            {SCENES.map((s) => (
              <button key={s.id} role="tab" aria-selected={s.id === sceneId} className={s.id === sceneId ? 'is-active' : ''} onClick={() => setSceneId(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
          <label className="select">
            <span>Paket</span>
            <select value={pkg?.id} onChange={(e) => onSelectPackage(e.target.value)}>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="ba-frame"
          ref={frameRef}
          onPointerDown={(e) => {
            dragging.current = true
            e.currentTarget.setPointerCapture(e.pointerId)
            updateFromPointer(e.clientX)
          }}
          onPointerMove={(e) => dragging.current && updateFromPointer(e.clientX)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          <img className={`ba-img ba-after ${matte ? 'is-matte' : ''}`} src={scene.src} alt={`${scene.alt} — işlem sonrası`} draggable={false} />
          <div className="ba-before" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <img className="ba-img" src={scene.src} alt={`${scene.alt} — işlem öncesi`} draggable={false} />
            {defects && (
              <div
                className="ba-defects"
                style={{
                  backgroundImage: `url(${defects})`,
                  // Fotoğrafın kendi parlaklığıyla maskele: kusurlar yalnızca ışık alan boyada görünür
                  maskImage: `url(${scene.src})`,
                  WebkitMaskImage: `url(${scene.src})`,
                }}
              />
            )}
            <div className="ba-haze" />
          </div>

          <span className="ba-tag ba-tag--left">Öncesi <b>{GLOSS_BEFORE} GU</b></span>
          <span className="ba-tag ba-tag--right">Sonrası <b>{glossAfter} GU</b></span>

          <div className="ba-handle" style={{ left: `${pos}%` }} aria-hidden="true">
            <span className="ba-knob">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </div>

          <input
            className="ba-range"
            type="range"
            min={0}
            max={100}
            value={Math.round(pos)}
            onChange={(e) => setPos(Number(e.target.value))}
            aria-label="Öncesi / sonrası karşılaştırma"
          />
        </div>

        <dl className="ba-stats">
          <div>
            <dt>Ekrandaki ortalama parlaklık</dt>
            <dd>{readout} <small>GU</small></dd>
          </div>
          <div>
            <dt>{matte ? 'Görünüm' : 'Parlaklık artışı'}</dt>
            <dd>{matte ? 'Saten mat' : `+${Math.round(((glossAfter - GLOSS_BEFORE) / GLOSS_BEFORE) * 100)}%`}</dd>
          </div>
          <div>
            <dt>Koruma</dt>
            <dd>{pkg && pkg.protectionMonths > 0 ? `${pkg.protectionMonths / 12} yıl` : 'Bakım'}</dd>
          </div>
        </dl>
        <p className="footnote">Parlaklık değerleri 60° gloss metre ile ölçülen ortalamalardır. Öncesi görünüm temsilidir.</p>
      </div>
    </section>
  )
}

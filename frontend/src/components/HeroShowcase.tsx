import { useEffect, useRef, useState } from 'react'

const IMG = `${import.meta.env.BASE_URL}images/`

export const HERO_CARS = [
  { id: 'blue', src: `${IMG}hero-blue.jpg`, name: 'Spor Sedan', service: 'Seramik Pro 9H', pos: '50% 62%' },
  { id: 'suv', src: `${IMG}ba-suv.jpg`, name: 'Premium SUV', service: 'PPF Full Body', pos: '50% 58%' },
  { id: 'silver', src: `${IMG}hero-silver.jpg`, name: 'Lüks Sedan', service: 'Seramik Elite 5 Yıl', pos: '50% 60%' },
  { id: 'graphite', src: `${IMG}hero-graphite.jpg`, name: 'Grand Tourer', service: 'Full Detailing', pos: '50% 62%' },
]

const CYCLE_MS = 7000

/**
 * Gerçek araç fotoğrafları üzerinde fareyle hareket eden sahne:
 * katmanlı paralaks + perspektif eğim + imleci izleyen stüdyo ışığı yansıması.
 */
export function HeroShowcase() {
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // Fare takibi — CSS değişkenlerine ataletli (lerp) aktarım
  useEffect(() => {
    const stage = stageRef.current
    const hero = stage?.closest('section')
    if (!stage || !hero) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let tx = 0, ty = 0, cx = 0, cy = 0, lx = 0.62, ly = 0.4, clx = 0.62, cly = 0.4
    let raf = 0

    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width
      const ny = (e.clientY - r.top) / r.height
      tx = nx * 2 - 1
      ty = ny * 2 - 1
      const s = stage.getBoundingClientRect()
      lx = (e.clientX - s.left) / s.width
      ly = (e.clientY - s.top) / s.height
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      lx = 0.62
      ly = 0.4
    }
    const tick = () => {
      cx += (tx - cx) * 0.07
      cy += (ty - cy) * 0.07
      clx += (lx - clx) * 0.1
      cly += (ly - cly) * 0.1
      stage.style.setProperty('--mx', cx.toFixed(4))
      stage.style.setProperty('--my', cy.toFixed(4))
      stage.style.setProperty('--lx', `${(clx * 100).toFixed(2)}%`)
      stage.style.setProperty('--ly', `${(cly * 100).toFixed(2)}%`)
      raf = requestAnimationFrame(tick)
    }
    if (!reduced) {
      hero.addEventListener('pointermove', onMove)
      hero.addEventListener('pointerleave', onLeave)
      raf = requestAnimationFrame(tick)
    }
    return () => {
      cancelAnimationFrame(raf)
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Otomatik geçiş (fare sahnedeyken durur)
  useEffect(() => {
    if (paused) return
    const t = setTimeout(() => setActive((i) => (i + 1) % HERO_CARS.length), CYCLE_MS)
    return () => clearTimeout(t)
  }, [active, paused])

  const car = HERO_CARS[active]

  return (
    <div className="showcase" ref={stageRef} onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
      <div className="showcase-tilt">
        {HERO_CARS.map((c, i) => (
          <img
            key={c.id}
            src={c.src}
            alt={i === active ? `${c.name} — ${c.service} uygulanmış araç` : ''}
            aria-hidden={i !== active}
            className={`showcase-img ${i === active ? 'is-active' : ''}`}
            style={{ objectPosition: c.pos }}
            fetchPriority={i === 0 ? 'high' : 'low'}
            draggable={false}
          />
        ))}
        <div className="showcase-light" aria-hidden="true" />
        <div className="showcase-sweep" aria-hidden="true" key={car.id} />
      </div>

      <div className="showcase-meta" aria-live="polite">
        <span className="showcase-index">0{active + 1} / 0{HERO_CARS.length}</span>
        <strong>{car.name}</strong>
        <span>{car.service}</span>
      </div>

      <div className="showcase-thumbs" role="tablist" aria-label="Araç seçimi">
        {HERO_CARS.map((c, i) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={i === active}
            aria-label={`${c.name} — ${c.service}`}
            className={`thumb ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
          >
            <img src={c.src} alt="" style={{ objectPosition: c.pos }} />
            {i === active && !paused && <span className="thumb-progress" style={{ animationDuration: `${CYCLE_MS}ms` }} />}
          </button>
        ))}
      </div>
    </div>
  )
}

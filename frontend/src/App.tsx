import { Award, Droplets, MapPin, Phone, ShieldCheck, Sparkles, Sun, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Booking } from './components/Booking'
import { CarArt } from './components/CarArt'
import { Configurator } from './components/Configurator'
import { GlossSlider } from './components/GlossSlider'
import type { Catalog, Quote } from './domain/models'
import { services } from './infrastructure/container'

const SERVICES = [
  { icon: Sparkles, title: 'Detailing & Pasta Cila', text: 'Kil temizliği, 3 adım makine polisajı ile hare ve çizikleri %90’a kadar gideriyoruz.' },
  { icon: Droplets, title: 'Seramik Kaplama', text: '9H–10H SiO₂ kaplama ile 5 yıla kadar UV, kuş pisliği ve kimyasal koruma, su itici yüzey.' },
  { icon: ShieldCheck, title: 'PPF Boya Koruma Filmi', text: 'Kendini onaran TPU film; taş darbesi ve çiziklere karşı 10 yıla kadar garantili koruma.' },
]

const STEPS = [
  { icon: Timer, title: 'Ön inceleme', text: 'Boya kalınlığı ölçümü ve kusur haritası çıkarılır.' },
  { icon: Sun, title: 'Hazırlık & polisaj', text: 'Yıkama, dekontaminasyon ve düzeltme polisajı.' },
  { icon: Droplets, title: 'Uygulama', text: 'Toz kontrollü kabinde seramik veya PPF uygulaması.' },
  { icon: Award, title: 'Kürleme & teslim', text: 'Kızılötesi kürleme, kalite kontrol ve garanti belgesi.' },
]

export function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState('')
  const [segmentId, setSegmentId] = useState('sedan')
  const [packageId, setPackageId] = useState('ceramic-3')
  const [addOnIds, setAddOnIds] = useState<string[]>([])
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    services.catalog.getCatalog().then(setCatalog).catch((e: Error) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!catalog) return
    let alive = true
    services.catalog
      .calculateQuote({ segmentId, packageId, addOnIds })
      .then((q) => alive && setQuote(q))
      .catch(() => alive && setQuote(null))
    return () => {
      alive = false
    }
  }, [catalog, segmentId, packageId, addOnIds])

  const toggleAddOn = (id: string) =>
    setAddOnIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <a href="#" className="brand" aria-label="Comodo Detailing ana sayfa">
            <span className="brand-mark">C</span>
            <span>Comodo <b>Detailing</b></span>
          </a>
          <nav className="nav" aria-label="Ana menü">
            <a href="#hizmetler">Hizmetler</a>
            <a href="#fiyatlar">Fiyatlar</a>
            <a href="#parlaklik">Öncesi/Sonrası</a>
            <a href="#randevu" className="btn btn-primary btn-sm">Randevu Al</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow">Detailing · Seramik Kaplama · PPF</span>
              <h1>
                Aracınıza <span className="gradient-text">showroom parlaklığı</span>, yıllarca koruma.
              </h1>
              <p className="lead">
                Segmentinizi seçin, paket fiyatını saniyeler içinde görün; öncesi/sonrası farkını kaydırarak inceleyin ve
                online randevunuzu oluşturun.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => scrollTo('fiyatlar')}>Fiyatımı hesapla</button>
                <button className="btn btn-ghost btn-lg" onClick={() => scrollTo('parlaklik')}>Farkı gör</button>
              </div>
              <ul className="hero-proof">
                <li><strong>2.400+</strong><span>kaplanan araç</span></li>
                <li><strong>10 yıl</strong><span>PPF garantisi</span></li>
                <li><strong>4.9/5</strong><span>müşteri puanı</span></li>
              </ul>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <div className="studio-light" />
              <CarArt variant="after" color="#1d3f8f" finish="gloss" beads />
            </div>
          </div>
        </section>

        <section className="section" id="hizmetler">
          <div className="container">
            <div className="service-grid">
              {SERVICES.map(({ icon: Icon, title, text }) => (
                <article key={title} className="service-card">
                  <span className="service-icon"><Icon size={22} aria-hidden /></span>
                  <h3>{title}</h3>
                  <p className="muted">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {error && <p className="container form-alert">{error}</p>}
        {catalog ? (
          <>
            <Configurator
              catalog={catalog}
              segmentId={segmentId}
              packageId={packageId}
              addOnIds={addOnIds}
              quote={quote}
              onSegment={setSegmentId}
              onPackage={setPackageId}
              onToggleAddOn={toggleAddOn}
              onBook={() => scrollTo('randevu')}
            />
            <GlossSlider packages={catalog.packages} selectedPackageId={packageId} onSelectPackage={setPackageId} />

            <section className="section">
              <div className="container">
                <header className="section-head">
                  <span className="eyebrow">Süreç</span>
                  <h2>Aracınız bizde nasıl ilerler?</h2>
                </header>
                <ol className="steps">
                  {STEPS.map(({ icon: Icon, title, text }, i) => (
                    <li key={title} className="step">
                      <span className="step-no">0{i + 1}</span>
                      <Icon size={22} className="accent" aria-hidden />
                      <h3>{title}</h3>
                      <p className="muted">{text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <Booking catalog={catalog} segmentId={segmentId} packageId={packageId} addOnIds={addOnIds} quote={quote} />
          </>
        ) : (
          !error && <p className="container muted center loading">Paketler yükleniyor…</p>
        )}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="brand">
            <span className="brand-mark">C</span>
            <span>Comodo <b>Detailing</b></span>
          </div>
          <div className="footer-contact">
            <a href="tel:+902420000000"><Phone size={16} aria-hidden /> 0242 000 00 00</a>
            <span><MapPin size={16} aria-hidden /> Antalya</span>
          </div>
          <small className="muted">© {new Date().getFullYear()} Comodo Teknoloji ve Ticaret</small>
        </div>
      </footer>
    </>
  )
}

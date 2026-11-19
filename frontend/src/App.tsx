import { ArrowRight, ArrowUpRight, MapPin, Phone, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Booking } from './components/Booking'
import { Configurator } from './components/Configurator'
import { GlossSlider } from './components/GlossSlider'
import { HeroShowcase } from './components/HeroShowcase'
import { WhatsAppIcon } from './components/WhatsAppIcon'
import { CONTACT, whatsappLink } from './contact'
import type { Catalog, Quote } from './domain/models'
import { services } from './infrastructure/container'

const IMG = `${import.meta.env.BASE_URL}images/`

const SERVICES = [
  {
    no: '01', title: 'Detailing', pkg: 'detail-polish', img: 'svc-detailing.jpg',
    text: 'Kil temizliği ve 3 adım makine polisajı. Hareler, ince çizikler ve oksitlenme gider; boya ilk günkü derinliğine döner.',
    from: '4.500',
  },
  {
    no: '02', title: 'Seramik Kaplama', pkg: 'ceramic-3', img: 'svc-ceramic.jpg',
    text: '9H–10H SiO₂ kaplama. Su ve kir tutmayan, UV ve kimyasala dayanıklı cam sertliğinde bir katman; 5 yıla kadar garanti.',
    from: '14.000',
  },
  {
    no: '03', title: 'PPF Koruma Filmi', pkg: 'ppf-front', img: 'svc-ppf.jpg',
    text: 'Kendini onaran şeffaf TPU film. Taş darbesi, çizik ve kapı vuruklarına karşı görünmez zırh; 10 yıl üretici garantisi.',
    from: '38.000',
  },
]

const STEPS = [
  { img: 'step-prep.jpg', title: 'Yıkama & dekontaminasyon', text: 'pH nötr köpük, demir tozu sökücü ve kil ile yüzey tamamen arındırılır.' },
  { img: 'step-polish.jpg', title: 'Boya düzeltme', text: 'Boya kalınlığı ölçülür, kusur haritasına göre çok adımlı polisaj yapılır.' },
  { img: 'step-detail.jpg', title: 'Uygulama', text: 'Toz kontrollü kabinde seramik katmanları ya da PPF film uygulanır.' },
  { img: 'step-interior.jpg', title: 'Kürleme & teslim', text: 'Kızılötesi kürleme, ışık tüneli kontrolü ve garanti belgesi ile teslim.' },
]

export function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState('')
  const [segmentId, setSegmentId] = useState('sedan')
  const [packageId, setPackageId] = useState('ceramic-3')
  const [addOnIds, setAddOnIds] = useState<string[]>([])
  const [quote, setQuote] = useState<Quote | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    services.catalog.getCatalog().then(setCatalog).catch((e: Error) => setError(e.message))
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
  const choosePackage = (id: string) => {
    setPackageId(id)
    scrollTo('fiyatlar')
  }

  return (
    <>
      <header className={`topbar ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="container topbar-inner">
          <a href="#" className="brand" aria-label="Comodo Detailing ana sayfa">
            <span className="brand-word">COMODO</span>
            <span className="brand-sub">Detailing Studio</span>
          </a>
          <nav className="nav" aria-label="Ana menü">
            <a href="#hizmetler">Hizmetler</a>
            <a href="#fiyatlar">Fiyatlar</a>
            <a href="#parlaklik">Öncesi / Sonrası</a>
            <a href="#surec">Süreç</a>
            <a href={CONTACT.phoneTel} className="nav-phone"><Phone size={16} aria-hidden /> {CONTACT.phoneDisplay}</a>
            <a href="#randevu" className="btn btn-primary btn-sm">Randevu al</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <HeroShowcase />
          <div className="container hero-content">
            <span className="eyebrow">Detailing · Seramik Kaplama · PPF</span>
            <h1>
              Boyanız için<br />
              <em>kusursuz</em> koruma.
            </h1>
            <p className="lead">
              Antalya'da ışık tünelli, toz kontrollü stüdyomuzda aracınızı fabrika çıkışından daha iyi hâle getiriyoruz.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={() => scrollTo('fiyatlar')}>
                Fiyatını hesapla <ArrowRight size={18} aria-hidden />
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => scrollTo('parlaklik')}>Öncesi / sonrası</button>
            </div>
          </div>
          <div className="container hero-proof">
            <div><strong>2.400+</strong><span>kaplanan araç</span></div>
            <div><strong>10 yıl</strong><span>PPF garantisi</span></div>
            <div><strong>4.9 <Star size={16} fill="currentColor" aria-hidden /></strong><span>Google puanı</span></div>
          </div>
        </section>

        <section className="section" id="hizmetler">
          <div className="container">
            <header className="section-head split">
              <div>
                <span className="eyebrow">Hizmetler</span>
                <h2>Üç uzmanlık, tek standart.</h2>
              </div>
              <p>Her işe boya kalınlığı ölçümüyle başlar, ışık tünelinde kontrol ederek bitiririz. Sonuç fotoğraflarla raporlanır.</p>
            </header>
            <div className="service-grid">
              {SERVICES.map((s) => (
                <article key={s.no} className="service-card">
                  <div className="service-media">
                    <img src={IMG + s.img} alt={s.title} loading="lazy" />
                    <span className="service-no">{s.no}</span>
                  </div>
                  <div className="service-body">
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                    <div className="service-foot">
                      <span><small>başlayan fiyatlarla</small>₺{s.from}</span>
                      <button className="icon-link" onClick={() => choosePackage(s.pkg)} aria-label={`${s.title} paketlerini gör`}>
                        <ArrowUpRight size={20} aria-hidden />
                      </button>
                    </div>
                  </div>
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

            <section className="section" id="surec">
              <div className="container">
                <header className="section-head split">
                  <div>
                    <span className="eyebrow">Süreç</span>
                    <h2>Aracınız bizde nasıl ilerler?</h2>
                  </div>
                  <p>Her aşama fotoğraflanır ve WhatsApp üzerinden sizinle paylaşılır.</p>
                </header>
                <ol className="steps">
                  {STEPS.map((s, i) => (
                    <li key={s.title} className="step">
                      <img src={IMG + s.img} alt="" loading="lazy" />
                      <div className="step-body">
                        <span className="step-no">0{i + 1}</span>
                        <h3>{s.title}</h3>
                        <p>{s.text}</p>
                      </div>
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

      <section className="contact-band" id="iletisim">
        <div className="container contact-inner">
          <div>
            <span className="eyebrow">İletişim</span>
            <h2>Aracınız için ücretsiz ön değerlendirme.</h2>
            <p>Fotoğraf gönderin, boya durumuna göre en doğru paketi birlikte seçelim.</p>
          </div>
          <div className="contact-actions">
            <a className="contact-card" href={whatsappLink()} target="_blank" rel="noopener">
              <span className="contact-icon is-wa"><WhatsAppIcon size={22} /></span>
              <span><small>WhatsApp</small><strong>{CONTACT.phoneDisplay}</strong></span>
            </a>
            <a className="contact-card" href={CONTACT.phoneTel}>
              <span className="contact-icon"><Phone size={20} aria-hidden /></span>
              <span><small>Telefon</small><strong>{CONTACT.phoneDisplay}</strong></span>
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="brand">
            <span className="brand-word">COMODO</span>
            <span className="brand-sub">Detailing Studio</span>
          </div>
          <div className="footer-contact">
            <a href={CONTACT.phoneTel}><Phone size={16} aria-hidden /> {CONTACT.phoneDisplay}</a>
            <a href={whatsappLink()} target="_blank" rel="noopener"><WhatsAppIcon size={16} /> WhatsApp</a>
            <span><MapPin size={16} aria-hidden /> {CONTACT.city}</span>
            <span>{CONTACT.hours}</span>
          </div>
        </div>
        <div className="container footer-legal">
          <small>© {new Date().getFullYear()} Comodo Teknoloji ve Ticaret</small>
          <small>
            Fotoğraflar: <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a>
          </small>
        </div>
      </footer>

      <a className="wa-float" href={whatsappLink()} target="_blank" rel="noopener" aria-label="WhatsApp ile yazın">
        <WhatsAppIcon size={28} />
        <span className="wa-float-label">WhatsApp'tan yazın</span>
      </a>
    </>
  )
}

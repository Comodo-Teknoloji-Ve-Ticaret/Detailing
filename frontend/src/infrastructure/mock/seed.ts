import type { Catalog } from '../../domain/models'

// Backend InMemory seed ile aynı veri seti (2026 fiyatları, KDV dahil).
export const seedCatalog: Catalog = {
  segments: [
    { id: 'hatchback', name: 'Hatchback / Kompakt', examples: 'Clio, Polo, Corsa, i20', priceMultiplier: 1, durationMultiplier: 1 },
    { id: 'sedan', name: 'Sedan', examples: 'Corolla, Egea, Civic, Passat', priceMultiplier: 1.15, durationMultiplier: 1.1 },
    { id: 'suv', name: 'SUV / Crossover', examples: 'Tucson, Kuga, 3008, Q5', priceMultiplier: 1.35, durationMultiplier: 1.25 },
    { id: 'luxury', name: 'Lüks / Spor', examples: 'E Serisi, 5 Serisi, 911, Model S', priceMultiplier: 1.6, durationMultiplier: 1.4 },
    { id: 'commercial', name: 'Ticari / Pick-up', examples: 'Transporter, Hilux, Ranger', priceMultiplier: 1.5, durationMultiplier: 1.35 },
  ],
  packages: [
    {
      id: 'detail-interior', category: 'detailing', name: 'İç Detaylı Temizlik', tagline: 'Koltuktan tavana buharlı hijyen',
      basePrice: 4500, baseDurationHours: 5, protectionMonths: 0, glossAfter: 72,
      features: ['Buharlı koltuk & döşeme temizliği', 'Tavan ve torpido detay', 'Ozon ile koku giderme', 'Plastik aksam bakımı'],
    },
    {
      id: 'detail-polish', category: 'detailing', name: 'Dış Detay + 3 Adım Pasta Cila', tagline: 'Çizik ve hareleri giderir',
      basePrice: 8500, baseDurationHours: 8, protectionMonths: 0, glossAfter: 86,
      features: ['Kil (clay bar) ile kontaminasyon temizliği', '3 adım makine polisaj', 'Hare & çizik giderme (%80-90)', 'Jant ve lastik detay'],
      popular: true,
    },
    {
      id: 'detail-full', category: 'detailing', name: 'Full Detailing', tagline: 'İç + dış komple yenileme',
      basePrice: 12500, baseDurationHours: 12, protectionMonths: 0, glossAfter: 88,
      features: ['İç detaylı temizlik dahil', '3 adım pasta cila dahil', 'Motor bölmesi temizliği', '3 ay sentetik wax koruma'],
    },
    {
      id: 'ceramic-1', category: 'ceramic', name: 'Seramik Hydro (1 Yıl)', tagline: 'Giriş seviyesi su itici koruma',
      basePrice: 14000, baseDurationHours: 10, protectionMonths: 12, glossAfter: 91,
      features: ['1 adım hazırlık polisajı', '1 kat SiO₂ seramik', 'Hidrofobik yüzey', '1 yıl garanti belgesi'],
    },
    {
      id: 'ceramic-3', category: 'ceramic', name: 'Seramik Pro 9H (3 Yıl)', tagline: 'En çok tercih edilen koruma',
      basePrice: 24000, baseDurationHours: 16, protectionMonths: 36, glossAfter: 95,
      features: ['3 adım düzeltme polisajı', '2 kat 9H seramik', 'Jant ön yüz seramik', '3 yıl garanti + ücretsiz 1. bakım'],
      popular: true,
    },
    {
      id: 'ceramic-5', category: 'ceramic', name: 'Seramik Elite (5 Yıl)', tagline: 'Showroom ötesi derinlik',
      basePrice: 36000, baseDurationHours: 22, protectionMonths: 60, glossAfter: 98,
      features: ['Kusur giderme + finiş polisaj', '3 kat 10H elite seramik', 'Cam, jant ve trim seramik', '5 yıl garanti + yıllık bakım'],
    },
    {
      id: 'ppf-front', category: 'ppf', name: 'PPF Ön Paket', tagline: 'Taş darbelerine karşı ön kalkan',
      basePrice: 38000, baseDurationHours: 14, protectionMonths: 84, glossAfter: 94,
      features: ['Ön tampon + kaput', 'Çamurluklar ve aynalar', 'Farlar', '7 yıl kendini onaran TPU film'],
    },
    {
      id: 'ppf-full', category: 'ppf', name: 'PPF Full Body Parlak', tagline: 'Komple görünmez zırh',
      basePrice: 120000, baseDurationHours: 40, protectionMonths: 120, glossAfter: 97,
      features: ['Tüm boyalı yüzeyler', 'Kapı içleri ve eşikler', 'Kendini onaran üst katman', '10 yıl üretici garantisi'],
      popular: true,
    },
    {
      id: 'ppf-matte', category: 'ppf', name: 'PPF Full Body Mat (Satin)', tagline: 'Parlak boyayı saten mata çevirir',
      basePrice: 135000, baseDurationHours: 44, protectionMonths: 120, glossAfter: 30,
      features: ['Tüm boyalı yüzeyler', 'Saten mat görünüm', 'Sökülünce orijinal boya', '10 yıl üretici garantisi'],
    },
  ],
  addOns: [
    { id: 'wheel-ceramic', name: 'Jant Komple Seramik (4 adet)', price: 3500, scalesWithSegment: false },
    { id: 'glass-coat', name: 'Cam Su İtici Kaplama', price: 1500, scalesWithSegment: true },
    { id: 'interior-ceramic', name: 'Deri & Döşeme Seramik', price: 4000, scalesWithSegment: true },
    { id: 'engine-bay', name: 'Motor Bölmesi Detay Temizliği', price: 1200, scalesWithSegment: false },
    { id: 'headlight-ppf', name: 'Far PPF + Sis Farı', price: 3000, scalesWithSegment: false },
  ],
}

/** İşlem öncesi ortalama boya parlaklığı (GU) */
export const GLOSS_BEFORE = 58

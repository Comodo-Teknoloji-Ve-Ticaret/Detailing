# Comodo Detailing — Oto Detailing, Seramik Kaplama & PPF

Detailing, seramik kaplama ve PPF merkezleri için web uygulaması:

- **Gerçek araç fotoğraflı ana sahne:** 4 araç arasında geçiş; fareyle paralaks, perspektif eğim ve imleci izleyen stüdyo ışığı.
- **Araç segmenti → anında paket fiyatı:** Her segment gerçek araç fotoğrafıyla; Hatchback, Sedan, SUV, Lüks/Spor, Ticari segmentleri; Detailing / Seramik / PPF paketleri, ekstralar, canlı teklif özeti ve tüm segmentlerin fiyat tablosu.
- **Öncesi / sonrası parlaklık kaydırıcısı:** Gerçek fotoğraflar üzerinde sürüklenebilir (klavyeyle de kullanılabilir) karşılaştırma; 3 sahne, paket seçimi, GU (gloss unit) göstergesi. Öncesi tarafındaki hare/toz/kireç katmanı fotoğrafın parlaklığıyla maskelenir, yalnızca boyada görünür.
- **Online randevu:** 14 günlük tarih şeridi, saat başı 2 araç kapasiteli slotlar, Pazar kapalı, telefon/plaka doğrulama, randevu kodu ve kodla sorgulama.

## Yapı

```
frontend/   React 19 + TypeScript + Vite (katmanlı: domain / application / infrastructure / components)
backend/    .NET 10 Clean Architecture
  src/ComodoDetailing.Domain          Varlıklar, PricingCalculator, SchedulingRules, Validators
  src/ComodoDetailing.Application     Port arayüzleri, DTO'lar, CatalogService, AppointmentService
  src/ComodoDetailing.Infrastructure  Bellek içi repository'ler, seed, saat (Europe/Istanbul), kod üretici
  src/ComodoDetailing.WebApi          Minimal API uç noktaları, ProblemDetails hata eşleme
  tests/ComodoDetailing.Tests         Domain birim testleri + WebApplicationFactory entegrasyon testleri
```

Fiyat ve takvim kuralları frontend (`src/domain/rules.ts`) ve backend (`Domain/Rules.cs`) tarafında aynıdır.

## Çalıştırma

```bash
# Frontend (varsayılan: mock veri + localStorage, backend gerekmez)
cd frontend && npm install && npm run dev

# Backend
cd backend && dotnet run --project src/ComodoDetailing.WebApi   # https://localhost:7001
cd backend && dotnet test

# Frontend'i API'ye bağlamak
cd frontend && VITE_DATA_SOURCE=api npm run dev   # /api → https://localhost:7001 proxy
```

## API

| Metot | Yol | Açıklama |
|---|---|---|
| GET | `/api/catalog` | Segmentler, paketler, ekstralar |
| POST | `/api/quotes` | `{ segmentId, packageId, addOnIds }` → teklif |
| GET | `/api/availability?date=yyyy-MM-dd` | Günün saat slotları |
| POST | `/api/appointments` | Randevu oluştur (dolu slot → 409) |
| GET | `/api/appointments/{code}` | Kodla randevu sorgula |
| GET | `/api/appointments` | Tüm randevular |

## Yayın

`main` dalına her push'ta GitHub Actions `frontend/dist` çıktısını GitHub Pages'e yayınlar (`.github/workflows/deploy.yml`).

## Görseller

Tüm fotoğraflar [Unsplash](https://unsplash.com) lisansıyla (ücretsiz ticari kullanım) `frontend/public/images` altındadır.

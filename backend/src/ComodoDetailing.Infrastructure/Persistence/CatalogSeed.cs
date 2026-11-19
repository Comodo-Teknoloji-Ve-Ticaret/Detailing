using ComodoDetailing.Domain;

namespace ComodoDetailing.Infrastructure.Persistence;

/// <summary>Frontend src/infrastructure/mock/seed.ts ile aynı veri seti (2026 fiyatları, KDV dahil).</summary>
public static class CatalogSeed
{
    public static readonly IReadOnlyList<VehicleSegment> Segments =
    [
        new("hatchback", "Hatchback / Kompakt", "Clio, Polo, Corsa, i20", 1.00m, 1.00m),
        new("sedan", "Sedan", "Corolla, Egea, Civic, Passat", 1.15m, 1.10m),
        new("suv", "SUV / Crossover", "Tucson, Kuga, 3008, Q5", 1.35m, 1.25m),
        new("luxury", "Lüks / Spor", "E Serisi, 5 Serisi, 911, Model S", 1.60m, 1.40m),
        new("commercial", "Ticari / Pick-up", "Transporter, Hilux, Ranger", 1.50m, 1.35m),
    ];

    public static readonly IReadOnlyList<ServicePackage> Packages =
    [
        new("detail-interior", ServiceCategory.Detailing, "İç Detaylı Temizlik", "Koltuktan tavana buharlı hijyen", 4500m, 5m, 0, 72,
            ["Buharlı koltuk & döşeme temizliği", "Tavan ve torpido detay", "Ozon ile koku giderme", "Plastik aksam bakımı"]),
        new("detail-polish", ServiceCategory.Detailing, "Dış Detay + 3 Adım Pasta Cila", "Çizik ve hareleri giderir", 8500m, 8m, 0, 86,
            ["Kil (clay bar) ile kontaminasyon temizliği", "3 adım makine polisaj", "Hare & çizik giderme (%80-90)", "Jant ve lastik detay"], Popular: true),
        new("detail-full", ServiceCategory.Detailing, "Full Detailing", "İç + dış komple yenileme", 12500m, 12m, 0, 88,
            ["İç detaylı temizlik dahil", "3 adım pasta cila dahil", "Motor bölmesi temizliği", "3 ay sentetik wax koruma"]),
        new("ceramic-1", ServiceCategory.Ceramic, "Seramik Hydro (1 Yıl)", "Giriş seviyesi su itici koruma", 14000m, 10m, 12, 91,
            ["1 adım hazırlık polisajı", "1 kat SiO₂ seramik", "Hidrofobik yüzey", "1 yıl garanti belgesi"]),
        new("ceramic-3", ServiceCategory.Ceramic, "Seramik Pro 9H (3 Yıl)", "En çok tercih edilen koruma", 24000m, 16m, 36, 95,
            ["3 adım düzeltme polisajı", "2 kat 9H seramik", "Jant ön yüz seramik", "3 yıl garanti + ücretsiz 1. bakım"], Popular: true),
        new("ceramic-5", ServiceCategory.Ceramic, "Seramik Elite (5 Yıl)", "Showroom ötesi derinlik", 36000m, 22m, 60, 98,
            ["Kusur giderme + finiş polisaj", "3 kat 10H elite seramik", "Cam, jant ve trim seramik", "5 yıl garanti + yıllık bakım"]),
        new("ppf-front", ServiceCategory.Ppf, "PPF Ön Paket", "Taş darbelerine karşı ön kalkan", 38000m, 14m, 84, 94,
            ["Ön tampon + kaput", "Çamurluklar ve aynalar", "Farlar", "7 yıl kendini onaran TPU film"]),
        new("ppf-full", ServiceCategory.Ppf, "PPF Full Body Parlak", "Komple görünmez zırh", 120000m, 40m, 120, 97,
            ["Tüm boyalı yüzeyler", "Kapı içleri ve eşikler", "Kendini onaran üst katman", "10 yıl üretici garantisi"], Popular: true),
        new("ppf-matte", ServiceCategory.Ppf, "PPF Full Body Mat (Satin)", "Parlak boyayı saten mata çevirir", 135000m, 44m, 120, 30,
            ["Tüm boyalı yüzeyler", "Saten mat görünüm", "Sökülünce orijinal boya", "10 yıl üretici garantisi"]),
    ];

    public static readonly IReadOnlyList<AddOn> AddOns =
    [
        new("wheel-ceramic", "Jant Komple Seramik (4 adet)", 3500m, false),
        new("glass-coat", "Cam Su İtici Kaplama", 1500m, true),
        new("interior-ceramic", "Deri & Döşeme Seramik", 4000m, true),
        new("engine-bay", "Motor Bölmesi Detay Temizliği", 1200m, false),
        new("headlight-ppf", "Far PPF + Sis Farı", 3000m, false),
    ];
}

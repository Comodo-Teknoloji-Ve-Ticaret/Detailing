using System.Globalization;
using ComodoDetailing.Domain;

namespace ComodoDetailing.Application;

internal static class Mapping
{
    public static string ToApi(this ServiceCategory c) => c switch
    {
        ServiceCategory.Detailing => "detailing",
        ServiceCategory.Ceramic => "ceramic",
        ServiceCategory.Ppf => "ppf",
        _ => c.ToString().ToLowerInvariant(),
    };

    public static string ToApi(this DateOnly d) => d.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
    public static string ToApi(this TimeOnly t) => t.ToString("HH:mm", CultureInfo.InvariantCulture);

    public static AppointmentDto ToDto(this Appointment a) => new(
        a.Code, a.Segment.Id, a.Segment.Name, a.Package.Id, a.Package.Name, a.AddOns.Select(x => x.Id).ToList(),
        a.Date.ToApi(), a.Time.ToApi(), a.CustomerName, a.Phone, a.Email, a.VehicleBrandModel, a.Plate, a.Note,
        a.Total, a.DeliveryDays, a.Status.ToDisplay(), a.CreatedAt);

    public static DateOnly ParseDate(string value) =>
        DateOnly.TryParseExact(value, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var d)
            ? d
            : throw new ValidationException("Tarih yyyy-MM-dd biçiminde olmalıdır.");

    public static TimeOnly ParseTime(string value) =>
        TimeOnly.TryParseExact(value, "HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var t)
            ? t
            : throw new ValidationException("Saat HH:mm biçiminde olmalıdır.");
}

public sealed class CatalogService(ICatalogRepository catalog)
{
    public async Task<CatalogDto> GetCatalogAsync(CancellationToken ct)
    {
        var segments = await catalog.GetSegmentsAsync(ct);
        var packages = await catalog.GetPackagesAsync(ct);
        var addOns = await catalog.GetAddOnsAsync(ct);
        return new CatalogDto(
            segments.Select(s => new SegmentDto(s.Id, s.Name, s.Examples, s.PriceMultiplier, s.DurationMultiplier)).ToList(),
            packages.Select(p => new PackageDto(p.Id, p.Category.ToApi(), p.Name, p.Tagline, p.BasePrice, p.BaseDurationHours,
                p.ProtectionMonths, p.GlossAfter, p.Features, p.Popular)).ToList(),
            addOns.Select(a => new AddOnDto(a.Id, a.Name, a.Price, a.ScalesWithSegment)).ToList());
    }

    public async Task<QuoteDto> CalculateQuoteAsync(QuoteRequest req, CancellationToken ct)
    {
        var quote = await ResolveQuoteAsync(req.SegmentId, req.PackageId, req.AddOnIds, ct);
        return new QuoteDto(quote.Segment.Id, quote.Package.Id, quote.AddOns.Select(a => a.Id).ToList(),
            quote.Lines.Select(l => new QuoteLineDto(l.Label, l.Amount)).ToList(),
            quote.Total, quote.EstimatedHours, quote.DeliveryDays);
    }

    internal async Task<QuoteResult> ResolveQuoteAsync(string segmentId, string packageId, IReadOnlyList<string>? addOnIds, CancellationToken ct)
    {
        var segment = (await catalog.GetSegmentsAsync(ct)).FirstOrDefault(s => s.Id == segmentId)
            ?? throw new ValidationException("Araç segmenti bulunamadı.");
        var pkg = (await catalog.GetPackagesAsync(ct)).FirstOrDefault(p => p.Id == packageId)
            ?? throw new ValidationException("Paket bulunamadı.");
        var ids = addOnIds ?? [];
        var addOns = (await catalog.GetAddOnsAsync(ct)).Where(a => ids.Contains(a.Id)).ToList();
        return PricingCalculator.Calculate(segment, pkg, addOns);
    }
}

public sealed class AppointmentService(
    CatalogService catalogService,
    IAppointmentRepository appointments,
    IClock clock,
    IAppointmentCodeGenerator codes)
{
    public async Task<DayAvailabilityDto> GetAvailabilityAsync(string date, CancellationToken ct)
    {
        var day = Mapping.ParseDate(date);
        var booked = (await appointments.GetByDateAsync(day, ct)).Select(a => a.Time);
        var availability = SchedulingRules.Build(day, booked, clock.Now);
        return new DayAvailabilityDto(availability.Date.ToApi(), availability.Closed,
            availability.Slots.Select(s => new TimeSlotDto(s.Time.ToApi(), s.Available, s.Remaining)).ToList());
    }

    public async Task<AppointmentDto> CreateAsync(CreateAppointmentRequest req, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(req.CustomerName)) throw new ValidationException("Ad Soyad zorunludur.");
        if (!Validators.IsValidPhone(req.Phone ?? "")) throw new ValidationException("Geçerli bir cep telefonu girin (05XX XXX XX XX).");
        if (!Validators.IsValidPlate(req.Plate ?? "")) throw new ValidationException("Plaka biçimi geçersiz (örn. 07 ABC 123).");
        if (string.IsNullOrWhiteSpace(req.VehicleBrandModel)) throw new ValidationException("Marka / model zorunludur.");

        var date = Mapping.ParseDate(req.Date);
        var time = Mapping.ParseTime(req.Time);
        var quote = await catalogService.ResolveQuoteAsync(req.SegmentId, req.PackageId, req.AddOnIds, ct);

        var appointment = new Appointment
        {
            Code = codes.Next(),
            Segment = quote.Segment,
            Package = quote.Package,
            AddOns = quote.AddOns,
            Date = date,
            Time = time,
            CustomerName = req.CustomerName.Trim(),
            Phone = req.Phone!.Trim(),
            Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim(),
            VehicleBrandModel = req.VehicleBrandModel.Trim(),
            Plate = Validators.NormalizePlate(req.Plate!),
            Note = string.IsNullOrWhiteSpace(req.Note) ? null : req.Note.Trim(),
            Total = quote.Total,
            DeliveryDays = quote.DeliveryDays,
        };

        await appointments.AddAsync(appointment, sameDay =>
        {
            SchedulingRules.EnsureBookable(date, time, sameDay.Select(a => a.Time), clock.Now);
            return Task.CompletedTask;
        }, ct);

        return appointment.ToDto();
    }

    public async Task<AppointmentDto> GetByCodeAsync(string code, CancellationToken ct)
    {
        var a = await appointments.GetByCodeAsync(code.Trim().ToUpperInvariant(), ct)
            ?? throw new NotFoundException("Bu koda ait randevu bulunamadı.");
        return a.ToDto();
    }

    public async Task<IReadOnlyList<AppointmentDto>> GetAllAsync(CancellationToken ct) =>
        (await appointments.GetAllAsync(ct)).OrderBy(a => a.Date).ThenBy(a => a.Time).Select(a => a.ToDto()).ToList();
}

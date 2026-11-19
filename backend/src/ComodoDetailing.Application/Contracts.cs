using ComodoDetailing.Domain;

namespace ComodoDetailing.Application;

// ---- Ports (Infrastructure tarafından uygulanır) ----

public interface ICatalogRepository
{
    Task<IReadOnlyList<VehicleSegment>> GetSegmentsAsync(CancellationToken ct);
    Task<IReadOnlyList<ServicePackage>> GetPackagesAsync(CancellationToken ct);
    Task<IReadOnlyList<AddOn>> GetAddOnsAsync(CancellationToken ct);
}

public interface IAppointmentRepository
{
    Task<IReadOnlyList<Appointment>> GetByDateAsync(DateOnly date, CancellationToken ct);
    Task<Appointment?> GetByCodeAsync(string code, CancellationToken ct);
    Task<IReadOnlyList<Appointment>> GetAllAsync(CancellationToken ct);
    /// <summary>Kapasite kontrolü ile ekleme atomik olmalı (aynı slota yarış durumunu engeller).</summary>
    Task AddAsync(Appointment appointment, Func<IReadOnlyList<Appointment>, Task> guard, CancellationToken ct);
}

public interface IClock
{
    DateTime Now { get; }
}

public interface IAppointmentCodeGenerator
{
    string Next();
}

// ---- DTO'lar (frontend src/domain/models.ts ile aynı JSON sözleşmesi) ----

public sealed record SegmentDto(string Id, string Name, string Examples, decimal PriceMultiplier, decimal DurationMultiplier);

public sealed record PackageDto(
    string Id, string Category, string Name, string Tagline, decimal BasePrice, decimal BaseDurationHours,
    int ProtectionMonths, int GlossAfter, IReadOnlyList<string> Features, bool Popular);

public sealed record AddOnDto(string Id, string Name, decimal Price, bool ScalesWithSegment);

public sealed record CatalogDto(IReadOnlyList<SegmentDto> Segments, IReadOnlyList<PackageDto> Packages, IReadOnlyList<AddOnDto> AddOns);

public sealed record QuoteRequest(string SegmentId, string PackageId, IReadOnlyList<string>? AddOnIds);

public sealed record QuoteLineDto(string Label, decimal Amount);

public sealed record QuoteDto(
    string SegmentId, string PackageId, IReadOnlyList<string> AddOnIds, IReadOnlyList<QuoteLineDto> Lines,
    decimal Total, int EstimatedHours, int DeliveryDays);

public sealed record TimeSlotDto(string Time, bool Available, int Remaining);

public sealed record DayAvailabilityDto(string Date, bool Closed, IReadOnlyList<TimeSlotDto> Slots);

public sealed record CreateAppointmentRequest(
    string SegmentId, string PackageId, IReadOnlyList<string>? AddOnIds, string Date, string Time,
    string CustomerName, string Phone, string? Email, string VehicleBrandModel, string Plate, string? Note);

public sealed record AppointmentDto(
    string Code, string SegmentId, string SegmentName, string PackageId, string PackageName,
    IReadOnlyList<string> AddOnIds, string Date, string Time, string CustomerName, string Phone, string? Email,
    string VehicleBrandModel, string Plate, string? Note, decimal Total, int DeliveryDays, string Status, DateTimeOffset CreatedAt);

/// <summary>Uygulama katmanında doğrulama hatası — WebApi 400 ProblemDetails'e çevirir.</summary>
public sealed class ValidationException(string message) : Exception(message);

public sealed class NotFoundException(string message) : Exception(message);

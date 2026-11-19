namespace ComodoDetailing.Domain;

public enum ServiceCategory { Detailing, Ceramic, Ppf }

public enum AppointmentStatus { OnayBekliyor, Onaylandi, Islemde, TeslimeHazir, TeslimEdildi }

public static class AppointmentStatusExtensions
{
    public static string ToDisplay(this AppointmentStatus status) => status switch
    {
        AppointmentStatus.OnayBekliyor => "Onay Bekliyor",
        AppointmentStatus.Onaylandi => "Onaylandı",
        AppointmentStatus.Islemde => "İşlemde",
        AppointmentStatus.TeslimeHazir => "Teslime Hazır",
        AppointmentStatus.TeslimEdildi => "Teslim Edildi",
        _ => status.ToString(),
    };
}

public sealed record VehicleSegment(
    string Id,
    string Name,
    string Examples,
    decimal PriceMultiplier,
    decimal DurationMultiplier);

public sealed record ServicePackage(
    string Id,
    ServiceCategory Category,
    string Name,
    string Tagline,
    decimal BasePrice,
    decimal BaseDurationHours,
    int ProtectionMonths,
    int GlossAfter,
    IReadOnlyList<string> Features,
    bool Popular = false);

public sealed record AddOn(string Id, string Name, decimal Price, bool ScalesWithSegment);

public sealed class Appointment
{
    public required string Code { get; init; }
    public required VehicleSegment Segment { get; init; }
    public required ServicePackage Package { get; init; }
    public required IReadOnlyList<AddOn> AddOns { get; init; }
    public required DateOnly Date { get; init; }
    public required TimeOnly Time { get; init; }
    public required string CustomerName { get; init; }
    public required string Phone { get; init; }
    public string? Email { get; init; }
    public required string VehicleBrandModel { get; init; }
    public required string Plate { get; init; }
    public string? Note { get; init; }
    public required decimal Total { get; init; }
    public required int DeliveryDays { get; init; }
    public AppointmentStatus Status { get; private set; } = AppointmentStatus.OnayBekliyor;
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;

    public void Confirm()
    {
        if (Status != AppointmentStatus.OnayBekliyor)
            throw new DomainException("Yalnızca onay bekleyen randevular onaylanabilir.");
        Status = AppointmentStatus.Onaylandi;
    }
}

public sealed class DomainException(string message) : Exception(message);

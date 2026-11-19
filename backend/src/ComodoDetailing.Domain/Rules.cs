using System.Text.RegularExpressions;

namespace ComodoDetailing.Domain;

public sealed record QuoteLine(string Label, decimal Amount);

public sealed record QuoteResult(
    VehicleSegment Segment,
    ServicePackage Package,
    IReadOnlyList<AddOn> AddOns,
    IReadOnlyList<QuoteLine> Lines,
    decimal Total,
    int EstimatedHours,
    int DeliveryDays);

/// <summary>Fiyat kuralları — frontend src/domain/rules.ts ile birebir aynı.</summary>
public static class PricingCalculator
{
    public static decimal RoundPrice(decimal value) =>
        Math.Round(value / 50m, MidpointRounding.AwayFromZero) * 50m;

    public static decimal PriceFor(ServicePackage pkg, VehicleSegment segment) =>
        RoundPrice(pkg.BasePrice * segment.PriceMultiplier);

    public static decimal PriceFor(AddOn addOn, VehicleSegment segment) =>
        addOn.ScalesWithSegment ? RoundPrice(addOn.Price * segment.PriceMultiplier) : addOn.Price;

    public static QuoteResult Calculate(VehicleSegment segment, ServicePackage pkg, IReadOnlyList<AddOn> addOns)
    {
        var lines = new List<QuoteLine> { new($"{pkg.Name} — {segment.Name}", PriceFor(pkg, segment)) };
        lines.AddRange(addOns.Select(a => new QuoteLine(a.Name, PriceFor(a, segment))));

        var hours = (int)Math.Ceiling(pkg.BaseDurationHours * segment.DurationMultiplier + addOns.Count * 0.5m);
        var days = Math.Max(1, (int)Math.Ceiling(hours / (decimal)SchedulingRules.WorkHoursPerDay));

        return new QuoteResult(segment, pkg, addOns, lines, lines.Sum(l => l.Amount), hours, days);
    }
}

public sealed record TimeSlot(TimeOnly Time, bool Available, int Remaining);

public sealed record DayAvailability(DateOnly Date, bool Closed, IReadOnlyList<TimeSlot> Slots);

/// <summary>Atölye çalışma saatleri ve kapasite kuralları.</summary>
public static class SchedulingRules
{
    public const int OpenHour = 9;
    public const int CloseHour = 18;
    public const int BayCapacity = 2;
    public const int BookingWindowDays = 30;
    public const int WorkHoursPerDay = 9;
    public static readonly DayOfWeek[] ClosedDays = [DayOfWeek.Sunday];

    public static IEnumerable<TimeOnly> SlotTimes() =>
        Enumerable.Range(OpenHour, CloseHour - OpenHour).Select(h => new TimeOnly(h, 0));

    public static DayAvailability Build(DateOnly date, IEnumerable<TimeOnly> bookedTimes, DateTime now)
    {
        var booked = bookedTimes.ToList();
        var closed = ClosedDays.Contains(date.DayOfWeek);
        var isToday = DateOnly.FromDateTime(now) == date;
        var isPast = date < DateOnly.FromDateTime(now);

        var slots = SlotTimes().Select(t =>
        {
            var remaining = Math.Max(0, BayCapacity - booked.Count(b => b == t));
            var past = isPast || (isToday && t.Hour <= now.Hour);
            return new TimeSlot(t, !closed && !past && remaining > 0, remaining);
        }).ToList();

        return new DayAvailability(date, closed, slots);
    }

    public static void EnsureBookable(DateOnly date, TimeOnly time, IEnumerable<TimeOnly> bookedTimes, DateTime now)
    {
        if (date > DateOnly.FromDateTime(now).AddDays(BookingWindowDays))
            throw new DomainException($"En fazla {BookingWindowDays} gün sonrası için randevu alınabilir.");

        var slot = Build(date, bookedTimes, now).Slots.FirstOrDefault(s => s.Time == time)
            ?? throw new DomainException("Geçersiz randevu saati.");
        if (!slot.Available)
            throw new DomainException("Seçilen saat artık dolu, lütfen başka bir saat seçin.");
    }
}

public static partial class Validators
{
    [GeneratedRegex(@"^0?5\d{9}$")]
    private static partial Regex PhoneRegex();

    [GeneratedRegex(@"^(0[1-9]|[1-7]\d|8[01])\s?[A-ZÇĞİÖŞÜ]{1,3}\s?\d{2,5}$")]
    private static partial Regex PlateRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex Whitespace();

    public static bool IsValidPhone(string phone) => PhoneRegex().IsMatch(new string(phone.Where(char.IsDigit).ToArray()));

    public static string NormalizePlate(string plate) =>
        Whitespace().Replace(plate.ToUpperInvariant(), " ").Trim();

    public static bool IsValidPlate(string plate) => PlateRegex().IsMatch(NormalizePlate(plate));
}

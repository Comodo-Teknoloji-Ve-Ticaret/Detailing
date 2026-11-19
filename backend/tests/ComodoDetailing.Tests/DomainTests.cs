using ComodoDetailing.Domain;
using ComodoDetailing.Infrastructure.Persistence;

namespace ComodoDetailing.Tests;

public class PricingTests
{
    private static VehicleSegment Seg(string id) => CatalogSeed.Segments.Single(s => s.Id == id);
    private static ServicePackage Pkg(string id) => CatalogSeed.Packages.Single(p => p.Id == id);
    private static AddOn Add(string id) => CatalogSeed.AddOns.Single(a => a.Id == id);

    [Theory]
    [InlineData("hatchback", "ceramic-3", 24000)]
    [InlineData("sedan", "ceramic-3", 27600)]
    [InlineData("suv", "ppf-full", 162000)]
    [InlineData("luxury", "detail-polish", 13600)]
    public void Package_price_scales_with_segment(string segment, string pkg, decimal expected) =>
        Assert.Equal(expected, PricingCalculator.PriceFor(Pkg(pkg), Seg(segment)));

    [Fact]
    public void Quote_sums_package_and_addons_with_segment_scaling_only_where_flagged()
    {
        var q = PricingCalculator.Calculate(Seg("sedan"), Pkg("ceramic-3"), [Add("wheel-ceramic"), Add("glass-coat")]);
        // 27.600 + 3.500 (sabit) + 1.750 (1.500 x 1.15 = 1.725 → 50'ye yuvarlanır: 1.750)
        Assert.Equal(32850m, q.Total);
        Assert.Equal(3, q.Lines.Count);
        Assert.Equal(19, q.EstimatedHours); // 16 x 1.1 + 2 x 0.5 = 18.6 → 19
        Assert.Equal(3, q.DeliveryDays);
    }
}

public class SchedulingTests
{
    private static readonly DateTime Now = new(2026, 11, 19, 10, 30, 0); // Perşembe

    [Fact]
    public void Sunday_is_closed()
    {
        var day = SchedulingRules.Build(new DateOnly(2026, 11, 22), [], Now);
        Assert.True(day.Closed);
        Assert.All(day.Slots, s => Assert.False(s.Available));
    }

    [Fact]
    public void Past_hours_today_are_unavailable()
    {
        var day = SchedulingRules.Build(new DateOnly(2026, 11, 19), [], Now);
        Assert.False(day.Slots.Single(s => s.Time == new TimeOnly(10, 0)).Available);
        Assert.True(day.Slots.Single(s => s.Time == new TimeOnly(11, 0)).Available);
    }

    [Fact]
    public void Slot_fills_at_bay_capacity()
    {
        var t = new TimeOnly(14, 0);
        var date = new DateOnly(2026, 11, 20);
        Assert.Equal(1, SchedulingRules.Build(date, [t], Now).Slots.Single(s => s.Time == t).Remaining);
        Assert.Throws<DomainException>(() => SchedulingRules.EnsureBookable(date, t, [t, t], Now));
    }

    [Theory]
    [InlineData("07 ABC 123", true)]
    [InlineData("34abc1234", true)]
    [InlineData("06 A 12345", true)]
    [InlineData("99 AB 123", false)]
    [InlineData("ABC 123", false)]
    public void Plate_validation(string plate, bool valid) => Assert.Equal(valid, Validators.IsValidPlate(plate));

    [Theory]
    [InlineData("0532 123 45 67", true)]
    [InlineData("5321234567", true)]
    [InlineData("0212 123 45 67", false)]
    public void Phone_validation(string phone, bool valid) => Assert.Equal(valid, Validators.IsValidPhone(phone));
}

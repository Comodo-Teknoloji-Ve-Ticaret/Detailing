using System.Net;
using System.Net.Http.Json;
using ComodoDetailing.Application;
using Microsoft.AspNetCore.Mvc.Testing;

namespace ComodoDetailing.Tests;

public class ApiTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    private static string NextWeekday()
    {
        var d = DateTime.Today.AddDays(2);
        while (d.DayOfWeek == DayOfWeek.Sunday) d = d.AddDays(1);
        return d.ToString("yyyy-MM-dd");
    }

    [Fact]
    public async Task Catalog_returns_segments_packages_addons()
    {
        var catalog = await _client.GetFromJsonAsync<CatalogDto>("/api/catalog");
        Assert.NotNull(catalog);
        Assert.Equal(5, catalog.Segments.Count);
        Assert.Contains(catalog.Packages, p => p.Category == "ppf");
    }

    [Fact]
    public async Task Quote_endpoint_calculates_total()
    {
        var res = await _client.PostAsJsonAsync("/api/quotes", new QuoteRequest("sedan", "ceramic-3", ["wheel-ceramic"]));
        var quote = await res.Content.ReadFromJsonAsync<QuoteDto>();
        Assert.Equal(31100m, quote!.Total);
    }

    [Fact]
    public async Task Appointment_flow_books_and_fills_slot()
    {
        var date = NextWeekday();
        CreateAppointmentRequest Req(string plate) => new("suv", "ppf-front", [], date, "15:00",
            "Ayşe Yılmaz", "0532 123 45 67", null, "Toyota RAV4", plate, null);

        var first = await _client.PostAsJsonAsync("/api/appointments", Req("07 abc 123"));
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        var created = await first.Content.ReadFromJsonAsync<AppointmentDto>();
        Assert.Equal("07 ABC 123", created!.Plate);
        Assert.Equal("Onay Bekliyor", created.Status);

        Assert.Equal(HttpStatusCode.Created, (await _client.PostAsJsonAsync("/api/appointments", Req("07 ABD 124"))).StatusCode);
        var third = await _client.PostAsJsonAsync("/api/appointments", Req("07 ABE 125"));
        Assert.Equal(HttpStatusCode.Conflict, third.StatusCode);

        var day = await _client.GetFromJsonAsync<DayAvailabilityDto>($"/api/availability?date={date}");
        Assert.False(day!.Slots.Single(s => s.Time == "15:00").Available);

        var found = await _client.GetFromJsonAsync<AppointmentDto>($"/api/appointments/{created.Code.ToLowerInvariant()}");
        Assert.Equal(created.Code, found!.Code);
    }

    [Fact]
    public async Task Invalid_phone_returns_400_problem()
    {
        var res = await _client.PostAsJsonAsync("/api/appointments", new CreateAppointmentRequest(
            "sedan", "ceramic-1", [], NextWeekday(), "10:00", "Ali", "123", null, "Egea", "07 ABC 123", null));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
        Assert.Contains("telefon", await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Unknown_code_returns_404()
    {
        var res = await _client.GetAsync("/api/appointments/CMD-YOKYOK");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }
}

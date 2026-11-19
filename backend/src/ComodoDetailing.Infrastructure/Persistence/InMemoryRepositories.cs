using ComodoDetailing.Application;
using ComodoDetailing.Domain;

namespace ComodoDetailing.Infrastructure.Persistence;

public sealed class InMemoryCatalogRepository : ICatalogRepository
{
    public Task<IReadOnlyList<VehicleSegment>> GetSegmentsAsync(CancellationToken ct) => Task.FromResult(CatalogSeed.Segments);
    public Task<IReadOnlyList<ServicePackage>> GetPackagesAsync(CancellationToken ct) => Task.FromResult(CatalogSeed.Packages);
    public Task<IReadOnlyList<AddOn>> GetAddOnsAsync(CancellationToken ct) => Task.FromResult(CatalogSeed.AddOns);
}

/// <summary>Singleton bellek içi randevu deposu. EF Core/SQL'e geçişte yalnızca bu sınıf değişir.</summary>
public sealed class InMemoryAppointmentRepository : IAppointmentRepository
{
    private readonly List<Appointment> _items = [];
    private readonly SemaphoreSlim _gate = new(1, 1);

    public async Task<IReadOnlyList<Appointment>> GetByDateAsync(DateOnly date, CancellationToken ct)
    {
        await _gate.WaitAsync(ct);
        try { return _items.Where(a => a.Date == date).ToList(); }
        finally { _gate.Release(); }
    }

    public async Task<Appointment?> GetByCodeAsync(string code, CancellationToken ct)
    {
        await _gate.WaitAsync(ct);
        try { return _items.FirstOrDefault(a => a.Code == code); }
        finally { _gate.Release(); }
    }

    public async Task<IReadOnlyList<Appointment>> GetAllAsync(CancellationToken ct)
    {
        await _gate.WaitAsync(ct);
        try { return _items.ToList(); }
        finally { _gate.Release(); }
    }

    public async Task AddAsync(Appointment appointment, Func<IReadOnlyList<Appointment>, Task> guard, CancellationToken ct)
    {
        await _gate.WaitAsync(ct);
        try
        {
            await guard(_items.Where(a => a.Date == appointment.Date).ToList());
            _items.Add(appointment);
        }
        finally { _gate.Release(); }
    }
}

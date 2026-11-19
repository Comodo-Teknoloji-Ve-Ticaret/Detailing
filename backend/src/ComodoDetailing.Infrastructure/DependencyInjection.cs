using System.Security.Cryptography;
using ComodoDetailing.Application;
using ComodoDetailing.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace ComodoDetailing.Infrastructure;

/// <summary>Atölye Türkiye saatine göre çalışır.</summary>
public sealed class IstanbulClock : IClock
{
    private static readonly TimeZoneInfo Zone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");
    public DateTime Now => TimeZoneInfo.ConvertTime(DateTime.UtcNow, Zone);
}

public sealed class RandomAppointmentCodeGenerator : IAppointmentCodeGenerator
{
    private const string Chars = "ABCDEFGHJKLMNPRSTUVYZ23456789";
    public string Next() => "CMD-" + RandomNumberGenerator.GetString(Chars, 6);
}

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<ICatalogRepository, InMemoryCatalogRepository>();
        services.AddSingleton<IAppointmentRepository, InMemoryAppointmentRepository>();
        services.AddSingleton<IClock, IstanbulClock>();
        services.AddSingleton<IAppointmentCodeGenerator, RandomAppointmentCodeGenerator>();
        return services;
    }
}

using Microsoft.Extensions.DependencyInjection;

namespace ComodoDetailing.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<CatalogService>();
        services.AddScoped<AppointmentService>();
        return services;
    }
}

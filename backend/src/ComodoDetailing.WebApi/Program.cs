using ComodoDetailing.Application;
using ComodoDetailing.Domain;
using ComodoDetailing.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication().AddInfrastructure();
builder.Services.AddProblemDetails();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:5173"])
     .AllowAnyHeader()
     .AllowAnyMethod()));

var app = builder.Build();

// Uygulama/domain hatalarını RFC 7807 ProblemDetails'e çevir
app.UseExceptionHandler(errorApp => errorApp.Run(async ctx =>
{
    var ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
    var (status, title) = ex switch
    {
        ValidationException v => (StatusCodes.Status400BadRequest, v.Message),
        DomainException d => (StatusCodes.Status409Conflict, d.Message),
        NotFoundException n => (StatusCodes.Status404NotFound, n.Message),
        _ => (StatusCodes.Status500InternalServerError, "Beklenmeyen bir hata oluştu."),
    };
    ctx.Response.StatusCode = status;
    await Results.Problem(title: title, statusCode: status).ExecuteAsync(ctx);
}));
app.UseCors();

var api = app.MapGroup("/api");

api.MapGet("/catalog", (CatalogService s, CancellationToken ct) => s.GetCatalogAsync(ct));

api.MapPost("/quotes", (QuoteRequest req, CatalogService s, CancellationToken ct) => s.CalculateQuoteAsync(req, ct));

api.MapGet("/availability", (string date, AppointmentService s, CancellationToken ct) => s.GetAvailabilityAsync(date, ct));

api.MapPost("/appointments", async (CreateAppointmentRequest req, AppointmentService s, CancellationToken ct) =>
{
    var created = await s.CreateAsync(req, ct);
    return Results.Created($"/api/appointments/{created.Code}", created);
});

api.MapGet("/appointments/{code}", (string code, AppointmentService s, CancellationToken ct) => s.GetByCodeAsync(code, ct));

api.MapGet("/appointments", (AppointmentService s, CancellationToken ct) => s.GetAllAsync(ct));

api.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

public partial class Program;

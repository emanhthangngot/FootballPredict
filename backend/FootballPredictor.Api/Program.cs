using FootballPredictor.Api.Infrastructure.PythonAiClient;
using FootballPredictor.Api.Modules.Predictions;
using FootballPredictor.Api.Security;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserAccessor, CurrentUserAccessor>();
builder.Services.AddScoped<IPythonAiClient, MockPythonAiClient>();
builder.Services.AddScoped<PredictionOrchestrator>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();

app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");
app.UseSwagger();
app.UseSwaggerUI();

var api = app.MapGroup("/api/v1");

api.MapPredictionEndpoints();

app.Run();

public partial class Program;

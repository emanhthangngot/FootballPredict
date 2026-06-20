using FootballPredictor.Mobile.Models;

namespace FootballPredictor.Mobile.Services;

internal sealed class BackendHealthClient(HttpClient httpClient) : IBackendHealthClient
{
    public async Task<HealthStatus> GetHealthAsync(CancellationToken cancellationToken = default)
    {
        var response = await httpClient.GetAsync("/health/ready", cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            return new HealthStatus("unavailable");
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        return new HealthStatus(string.IsNullOrWhiteSpace(body) ? "healthy" : body.Trim());
    }
}

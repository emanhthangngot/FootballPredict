using FootballPredictor.Mobile.Models;

namespace FootballPredictor.Mobile.Services;

public interface IBackendHealthClient
{
    Task<HealthStatus> GetHealthAsync(CancellationToken cancellationToken = default);
}

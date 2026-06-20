using FootballPredictor.Api.Modules.Predictions;

namespace FootballPredictor.Api.Infrastructure.PythonAiClient;

internal interface IPythonAiClient
{
    Task<AiPredictionResponse> PredictAsync(
        AiPredictionRequest request,
        CancellationToken cancellationToken = default);
}

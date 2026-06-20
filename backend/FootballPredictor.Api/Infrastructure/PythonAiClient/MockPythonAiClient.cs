using FootballPredictor.Api.Modules.Predictions;

namespace FootballPredictor.Api.Infrastructure.PythonAiClient;

internal sealed class MockPythonAiClient : IPythonAiClient
{
    public Task<AiPredictionResponse> PredictAsync(
        AiPredictionRequest request,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var response = new AiPredictionResponse(
            request.MatchId,
            request.FixtureVersion,
            request.FeatureMaterializationId,
            request.FeatureSnapshotHash,
            request.FeatureSnapshotTimestamp,
            ModelVersion: "mock-ensemble-v0",
            TrainingDataCutoffDate: new DateOnly(2026, 6, 1),
            HomeWinProbability: 0.46,
            DrawProbability: 0.27,
            AwayWinProbability: 0.27,
            ScoreMatrix: ScoreMatrix.Mock(),
            FeatureBreakdown: FeatureBreakdown.Mock(),
            InsightText: null);

        return Task.FromResult(response);
    }
}

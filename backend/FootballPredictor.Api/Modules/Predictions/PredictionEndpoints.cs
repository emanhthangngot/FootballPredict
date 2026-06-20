using FootballPredictor.Api.Infrastructure.PythonAiClient;

namespace FootballPredictor.Api.Modules.Predictions;

internal static class PredictionEndpoints
{
    public static RouteGroupBuilder MapPredictionEndpoints(this RouteGroupBuilder api)
    {
        api.MapGet("/matches/{matchId:long}/full", GetFullMatchAsync)
            .WithName("GetFullMatch")
            .WithSummary("Returns the full analytics view for a match.")
            .Produces<FullMatchResponse>()
            .ProducesProblem(StatusCodes.Status502BadGateway)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        return api;
    }

    private static Task<IResult> GetFullMatchAsync(
        long matchId,
        PredictionOrchestrator orchestrator,
        CancellationToken cancellationToken)
    {
        return orchestrator.GetFullMatchAsync(matchId, cancellationToken);
    }
}

internal sealed class PredictionOrchestrator(IPythonAiClient aiClient)
{
    public async Task<IResult> GetFullMatchAsync(long matchId, CancellationToken cancellationToken = default)
    {
        var fixture = new FixtureSummary(
            matchId,
            "fixture-2026-06-20T12:00:00Z",
            "Home FC",
            "Away FC",
            DateTimeOffset.Parse("2026-06-21T12:00:00Z"));

        var aiRequest = new AiPredictionRequest(
            matchId,
            fixture.FixtureVersion,
            "featmat-2026-06-20-1200",
            "sha256:mock-feature-snapshot",
            DateTimeOffset.Parse("2026-06-20T12:00:00Z"),
            "fullPrediction");

        var aiResponse = await aiClient.PredictAsync(aiRequest, cancellationToken);

        if (aiResponse.MatchId != matchId
            || aiResponse.FixtureVersion != fixture.FixtureVersion
            || aiResponse.FeatureMaterializationId != aiRequest.FeatureMaterializationId)
        {
            return Results.Problem(
                title: "Prediction is temporarily unavailable.",
                statusCode: StatusCodes.Status502BadGateway,
                extensions: new Dictionary<string, object?>
                {
                    ["code"] = "predictionContractMismatch"
                });
        }

        var scoreDistributionUnavailable = aiResponse.ScoreMatrix is null;
        var insightUnavailable = string.IsNullOrWhiteSpace(aiResponse.InsightText);
        var response = new FullMatchResponse(
            fixture,
            new PredictionSummary(
                aiResponse.HomeWinProbability,
                aiResponse.DrawProbability,
                aiResponse.AwayWinProbability,
                "medium",
                scoreDistributionUnavailable,
                insightUnavailable),
            new MarketComparison(
                HomeEdge: 0.041,
                DrawEdge: -0.012,
                AwayEdge: -0.029,
                EdgeReliable: true),
            [
                new("T-24h", 0.030, -0.010, -0.020, DateTimeOffset.Parse("2026-06-20T12:00:00Z")),
                new("T-3h", 0.041, -0.012, -0.029, DateTimeOffset.Parse("2026-06-21T09:00:00Z"))
            ],
            aiResponse.ScoreMatrix,
            scoreDistributionUnavailable
                ? []
                :
                [
                    new("0-1", 0.23),
                    new("2-3", 0.49),
                    new("4-5", 0.20),
                    new("6+", 0.08)
                ],
            scoreDistributionUnavailable ? null : new BttsSummary(0.54, "medium"),
            aiResponse.FeatureBreakdown,
            aiResponse.InsightText,
            insightUnavailable ? ["insightUnavailable"] : [],
            new PredictionMetadata(
                aiResponse.ModelVersion,
                aiResponse.FeatureMaterializationId,
                aiResponse.FeatureSnapshotHash,
                aiResponse.FeatureSnapshotTimestamp,
                aiResponse.TrainingDataCutoffDate,
                ServedAt: DateTimeOffset.UtcNow));

        return Results.Ok(response);
    }
}

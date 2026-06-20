namespace FootballPredictor.Api.Modules.Predictions;

internal sealed record FullMatchResponse(
    FixtureSummary Fixture,
    PredictionSummary Prediction,
    MarketComparison MarketComparison,
    IReadOnlyList<EdgeTimelinePoint> EdgeTimeline,
    ScoreMatrix? ScoreHeatmap,
    IReadOnlyList<TotalGoalsBucket> TotalGoalsDistribution,
    BttsSummary? Btts,
    FeatureBreakdown? FeatureBreakdown,
    string? AiExplanation,
    IReadOnlyList<string> Warnings,
    PredictionMetadata Metadata);

internal sealed record FixtureSummary(
    long MatchId,
    string FixtureVersion,
    string HomeTeam,
    string AwayTeam,
    DateTimeOffset KickoffTime);

internal sealed record PredictionSummary(
    double HomeWinProbability,
    double DrawProbability,
    double AwayWinProbability,
    string Confidence,
    bool ScoreDistributionUnavailable,
    bool InsightUnavailable);

internal sealed record EdgeTimelinePoint(
    string Checkpoint,
    double? HomeEdge,
    double? DrawEdge,
    double? AwayEdge,
    DateTimeOffset SnapshotAt);

internal sealed record ScoreMatrix(
    int MaxGoalsPerTeam,
    string TailHandling,
    IReadOnlyList<ScoreMatrixCell> Cells)
{
    public static ScoreMatrix Mock()
    {
        return new ScoreMatrix(
            MaxGoalsPerTeam: 2,
            TailHandling: "edgeBucket",
            Cells:
            [
                new(0, 0, 0.081),
                new(1, 0, 0.142),
                new(1, 1, 0.126),
                new(2, 1, 0.097),
                new(0, 1, 0.089)
            ]);
    }
}

internal sealed record ScoreMatrixCell(
    int HomeGoals,
    int AwayGoals,
    double Probability);

internal sealed record TotalGoalsBucket(
    string Label,
    double Probability);

internal sealed record BttsSummary(
    double Probability,
    string Confidence);

internal sealed record FeatureBreakdown(
    string Method,
    string ModelVersion,
    string Target,
    IReadOnlyList<FeatureContribution> TopFeatures,
    int MaxFeatures)
{
    public static FeatureBreakdown Mock()
    {
        return new FeatureBreakdown(
            Method: "shap",
            ModelVersion: "mock-ensemble-v0",
            Target: "homeWin",
            TopFeatures:
            [
                new("homeEloDiff", "Home Elo advantage", 72.4, 0.083, "increase", 1, "team_strength"),
                new("homeRecentXg", "Home recent xG", 1.62, 0.041, "increase", 2, "form")
            ],
            MaxFeatures: 8);
    }
}

internal sealed record FeatureContribution(
    string FeatureName,
    string DisplayName,
    double Value,
    double Impact,
    string Direction,
    int Rank,
    string Group);

internal sealed record MarketComparison(
    double? HomeEdge,
    double? DrawEdge,
    double? AwayEdge,
    bool EdgeReliable);

internal sealed record PredictionMetadata(
    string ModelVersion,
    string FeatureMaterializationId,
    string FeatureSnapshotHash,
    DateTimeOffset FeatureSnapshotTimestamp,
    DateOnly TrainingDataCutoffDate,
    DateTimeOffset ServedAt);

internal sealed record AiPredictionRequest(
    long MatchId,
    string FixtureVersion,
    string FeatureMaterializationId,
    string FeatureSnapshotHash,
    DateTimeOffset FeatureSnapshotTimestamp,
    string ModelTask);

internal sealed record AiPredictionResponse(
    long MatchId,
    string FixtureVersion,
    string FeatureMaterializationId,
    string FeatureSnapshotHash,
    DateTimeOffset FeatureSnapshotTimestamp,
    string ModelVersion,
    DateOnly TrainingDataCutoffDate,
    double HomeWinProbability,
    double DrawProbability,
    double AwayWinProbability,
    ScoreMatrix? ScoreMatrix,
    FeatureBreakdown? FeatureBreakdown,
    string? InsightText);

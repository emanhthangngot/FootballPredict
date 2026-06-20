from datetime import date

from app.schemas.prediction import (
    AiPredictionRequest,
    AiPredictionResponse,
    FeatureBreakdown,
    FeatureContribution,
    ScoreMatrix,
    ScoreMatrixCell,
)


def build_mock_prediction(request: AiPredictionRequest) -> AiPredictionResponse:
    return AiPredictionResponse(
        matchId=request.match_id,
        fixtureVersion=request.fixture_version,
        featureMaterializationId=request.feature_materialization_id,
        featureSnapshotHash=request.feature_snapshot_hash,
        featureSnapshotTimestamp=request.feature_snapshot_timestamp,
        modelVersion="mock-ensemble-v0",
        trainingDataCutoffDate=date(2026, 6, 1),
        homeWinProbability=0.46,
        drawProbability=0.27,
        awayWinProbability=0.27,
        scoreMatrix=ScoreMatrix(
            maxGoalsPerTeam=2,
            tailHandling="edgeBucket",
            cells=[
                ScoreMatrixCell(homeGoals=0, awayGoals=0, probability=0.081),
                ScoreMatrixCell(homeGoals=1, awayGoals=0, probability=0.142),
                ScoreMatrixCell(homeGoals=1, awayGoals=1, probability=0.126),
                ScoreMatrixCell(homeGoals=2, awayGoals=1, probability=0.097),
                ScoreMatrixCell(homeGoals=0, awayGoals=1, probability=0.089),
            ],
        ),
        featureBreakdown=FeatureBreakdown(
            method="shap",
            modelVersion="mock-ensemble-v0",
            target="homeWin",
            topFeatures=[
                FeatureContribution(
                    featureName="homeEloDiff",
                    displayName="Home Elo advantage",
                    value=72.4,
                    impact=0.083,
                    direction="increase",
                    rank=1,
                    group="team_strength",
                ),
                FeatureContribution(
                    featureName="homeRecentXg",
                    displayName="Home recent xG",
                    value=1.62,
                    impact=0.041,
                    direction="increase",
                    rank=2,
                    group="form",
                ),
            ],
            maxFeatures=8,
        ),
        insightText=None,
    )

from datetime import date, datetime

from pydantic import BaseModel, Field


class AiPredictionRequest(BaseModel):
    match_id: int = Field(alias="matchId")
    fixture_version: str = Field(alias="fixtureVersion")
    feature_materialization_id: str = Field(alias="featureMaterializationId")
    feature_snapshot_hash: str = Field(alias="featureSnapshotHash")
    feature_snapshot_timestamp: datetime = Field(alias="featureSnapshotTimestamp")
    model_task: str = Field(alias="modelTask")

    model_config = {"populate_by_name": True}


class ScoreMatrixCell(BaseModel):
    home_goals: int = Field(alias="homeGoals", ge=0)
    away_goals: int = Field(alias="awayGoals", ge=0)
    probability: float = Field(ge=0.0, le=1.0)

    model_config = {"populate_by_name": True}


class ScoreMatrix(BaseModel):
    max_goals_per_team: int = Field(alias="maxGoalsPerTeam", ge=1)
    tail_handling: str = Field(alias="tailHandling")
    cells: list[ScoreMatrixCell]

    model_config = {"populate_by_name": True}


class FeatureContribution(BaseModel):
    feature_name: str = Field(alias="featureName")
    display_name: str = Field(alias="displayName")
    value: float
    impact: float
    direction: str
    rank: int
    group: str

    model_config = {"populate_by_name": True}


class FeatureBreakdown(BaseModel):
    method: str
    model_version: str = Field(alias="modelVersion")
    target: str
    top_features: list[FeatureContribution] = Field(alias="topFeatures")
    max_features: int = Field(alias="maxFeatures")

    model_config = {"populate_by_name": True}


class AiPredictionResponse(BaseModel):
    match_id: int = Field(alias="matchId")
    fixture_version: str = Field(alias="fixtureVersion")
    feature_materialization_id: str = Field(alias="featureMaterializationId")
    feature_snapshot_hash: str = Field(alias="featureSnapshotHash")
    feature_snapshot_timestamp: datetime = Field(alias="featureSnapshotTimestamp")
    model_version: str = Field(alias="modelVersion")
    training_data_cutoff_date: date = Field(alias="trainingDataCutoffDate")
    home_win_probability: float = Field(alias="homeWinProbability", ge=0.0, le=1.0)
    draw_probability: float = Field(alias="drawProbability", ge=0.0, le=1.0)
    away_win_probability: float = Field(alias="awayWinProbability", ge=0.0, le=1.0)
    score_matrix: ScoreMatrix = Field(alias="scoreMatrix")
    feature_breakdown: FeatureBreakdown = Field(alias="featureBreakdown")
    insight_text: str | None = Field(alias="insightText")

    model_config = {"populate_by_name": True}

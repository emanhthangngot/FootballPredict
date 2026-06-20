from app.schemas.prediction import AiPredictionRequest
from app.services.mock_prediction_service import build_mock_prediction


def test_mock_prediction_preserves_provenance() -> None:
    request = AiPredictionRequest(
        matchId=123,
        fixtureVersion="fixture-2026-06-20T12:00:00Z",
        featureMaterializationId="featmat-2026-06-20-1200",
        featureSnapshotHash="sha256:test",
        featureSnapshotTimestamp="2026-06-20T12:00:00Z",
        modelTask="fullPrediction",
    )

    response = build_mock_prediction(request)

    assert response.match_id == 123
    assert response.fixture_version == request.fixture_version
    assert response.feature_materialization_id == request.feature_materialization_id
    assert response.feature_snapshot_hash == request.feature_snapshot_hash
    assert response.feature_snapshot_timestamp == request.feature_snapshot_timestamp
    assert response.score_matrix.cells
    assert response.feature_breakdown.top_features
    assert round(
        response.home_win_probability
        + response.draw_probability
        + response.away_win_probability,
        2,
    ) == 1.0

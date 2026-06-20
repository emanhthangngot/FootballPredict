from fastapi import APIRouter

from app.schemas.prediction import AiPredictionRequest, AiPredictionResponse
from app.services.mock_prediction_service import build_mock_prediction

router = APIRouter(prefix="/internal/v1", tags=["internal"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@router.post("/predict", response_model=AiPredictionResponse)
def predict(request: AiPredictionRequest) -> AiPredictionResponse:
    return build_mock_prediction(request)

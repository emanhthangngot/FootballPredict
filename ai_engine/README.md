# AI Engine

Internal FastAPI service for model inference, score distribution, SHAP, and RAG explanation.

Current foundation:

- Health endpoint: `/internal/v1/health`.
- Mock prediction endpoint: `/internal/v1/predict`.
- Pydantic schemas preserve prediction provenance fields.
- Mock prediction includes 1X2 probabilities, scoreMatrix, and SHAP-style feature breakdown.

Run locally after dependencies are installed:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

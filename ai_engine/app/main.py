from fastapi import FastAPI

from app.api.internal import router as internal_router


app = FastAPI(title="FootballPredict AI Engine", version="0.1.0")
app.include_router(internal_router)

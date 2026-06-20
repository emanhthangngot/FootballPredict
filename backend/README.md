# Backend

ASP.NET Core modular monolith for the public FootballPredict API.

Current foundation:

- `FootballPredictor.Api` targets `net8.0`.
- Health endpoints: `/health/live`, `/health/ready`.
- Mock analytics endpoint: `/api/v1/matches/{matchId}/full`.
- Swagger UI is enabled for local foundation work.
- `MockPythonAiClient` gives the backend the same boundary shape as the internal AI service.
- `CurrentUserAccessor` is the Supabase JWT role-extraction draft point.
- Module layout follows `docs/detail/04_BACKEND_ARCHITECTURE.md`.

Next backend slice:

1. Replace the mock AI client with an HTTP client against `ai_engine`.
2. Add real Supabase JWT validation.
3. Replace mock fixture/odds values with reads from Supabase and Redis.

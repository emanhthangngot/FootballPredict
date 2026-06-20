# FootballPredictor.Mobile

.NET MAUI mobile app placeholder following `docs/detail/07_CLIENT_UI_UX_ARCHITECTURE.md`.

Expected structure:

- `Views/User`: Home, fixtures, match detail, insight chat.
- `Views/Admin`: Admin quality, freshness, simulation, health.
- `ViewModels`: MVVM state and commands.
- `Services`: Typed API clients and local device services.
- `Models`: API DTOs and view models.
- `Components`: Reusable analytics UI components.
- `Resources`: Styles, images, fonts, and app assets.

Current shell:

- `AppShell` with user tabs for Home and Match Detail.
- `HomePage` shows backend readiness and featured match mock analytics.
- `BackendHealthClient` calls `/health/ready`.

Build once the .NET MAUI Android workload is available:

```bash
dotnet build frontend/FootballPredictor.Mobile/FootballPredictor.Mobile.csproj
```

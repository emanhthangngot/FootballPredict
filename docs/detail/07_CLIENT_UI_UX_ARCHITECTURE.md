# 07. CLIENT UI/UX ARCHITECTURE — .NET MAUI Mobile App

## 1. UI Reference

Reference mock:

```text
assets/mobile_ui_reference.png
```

The mobile app should develop from this visual direction.

## 2. Visual Direction

The UI should feel like a **dark sports analytics hub**, not a generic CRUD app.

Core style:

```text
dark background
rounded glass cards
blue accent
compact stats
team logo cards
bottom navigation
floating AI/action button
confidence badges
edge badges
```

Inspired layout from reference:

```text
Top status/header:
  FAN ZONE badge
  platform title
  Analytics Hub title

Account card:
  account type
  masked email / role

Featured match card:
  weekly highlight
  key match
  short model insight
  main prediction chip

Upcoming fixtures:
  horizontal/vertical cards
  league badge
  team logos
  prediction probabilities
  confidence indicator
  edge badge

Bottom nav:
  Trang chủ
  Lịch đấu
  Radar
  Trợ lý AI
```

## 3. Stack

```text
.NET MAUI
C#
MVVM
CommunityToolkit.Mvvm
Typed HttpClient or Refit
SecureStorage
SQLite optional local cache
Microcharts / LiveChartsCore
```

## 4. Folder

```text
frontend/
└── FootballPredictor.Mobile/
    ├── Views/
    │   ├── User/
    │   └── Admin/
    ├── ViewModels/
    ├── Services/
    ├── Models/
    ├── Components/
    └── Resources/
```

Although the folder is named `frontend`, it contains the mobile app, not a web frontend.

## 5. User Screens

| Screen | Purpose |
|---|---|
| HomePage | Analytics Hub, weekly highlight, Top Edges, upcoming fixtures |
| FixturesPage | Match list with filters |
| MatchDetailPage | Main analytics screen |
| InsightChatPage | Guided match AI chat |

## 6. Admin Screens

| Screen | Purpose |
|---|---|
| AdminQualityDashboardPage | Model quality metrics |
| AdminCalibrationPage | Calibration curves |
| AdminSnapshotQualityPage | Snapshot coverage |
| AdminFreshnessPage | Data freshness |
| AdminSimulationLabPage | Async simulation |
| AdminSystemHealthPage | Runtime health |

Admin screens should not appear as normal user bottom tabs. They are opened through Admin mode, role-based route, or hidden entry.

## 7. User Components

| Component | Purpose |
|---|---|
| `AnalyticsHeader` | Top platform header |
| `RoleBadge` | Fan Zone / Admin Zone |
| `FeaturedMatchCard` | Weekly key prediction |
| `FixtureCard` | Match card with logos, probabilities, edge |
| `ProbabilityBar` | 1X2 probabilities |
| `EdgeBadge` | Edge and edgeReliable |
| `ConfidenceBadge` | Model confidence state |
| `EdgeTimelineChart` | T-24h/T-3h/T-30m edge movement |
| `ScoreHeatmap` | Correct score matrix visualization |
| `TotalGoalsDistributionChart` | Total goals distribution |
| `FeatureBreakdownCard` | SHAP top features |
| `AiQuickReplyChips` | Suggested AI questions |

## 8. User Home Layout

Recommended layout:

```text
SafeArea
  ├── TopHeader
  │   ├── FAN ZONE badge
  │   ├── Analytics Hub title
  │   └── Profile / logout icon
  │
  ├── AccountSummaryCard
  │   ├── account role
  │   └── masked email
  │
  ├── FeaturedMatchCard
  │   ├── weekly highlight badge
  │   ├── match title
  │   ├── short insight sentence
  │   └── primary prediction chip
  │
  ├── UpcomingFixturesSection
  │   ├── section title
  │   ├── view all
  │   └── FixtureCard list
  │
  ├── TopEdgesSection
  │   └── sorted edge cards
  │
  └── BottomNavigation
```

## 9. Match Detail Layout

```text
Match Header
Prediction Panel
Market Comparison
Edge Timeline
Correct Score Heatmap
Total Goals Distribution
BTTS
Feature Breakdown
AI Explanation
AI Chat Entry
```

## 10. UI Rules

```text
If edgeReliable = false:
  dim edge
  show warning

If scoreDistributionUnavailable = true:
  hide scoreHeatmap
  hide totalGoalsDistribution
  hide BTTS

If insightUnavailable = true:
  show prediction but hide AI explanation panel

If market comparison unavailable:
  show model-only view
  do not fake edge
```

## 11. Guided AI Chat

AI chat should use quick replies first:

```text
Vì sao model nghiêng về chủ nhà?
Yếu tố nào ảnh hưởng mạnh nhất?
Market khác model ở đâu?
Snapshot gần nhất thay đổi gì?
Đội nào có form tốt hơn?
```

Free text is allowed, but backend must apply guardrails.

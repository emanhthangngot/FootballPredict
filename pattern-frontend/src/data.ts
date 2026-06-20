/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Team, Match, PredictionItem, ShapFactor } from "./types";

// Dynamic Poisson generator with Dixon-Coles correlation correction
// lambdaHome = expected goals of Home team
// lambdaAway = expected goals of Away team
// gridMax = size of matrix (typically 6 for 0 to 5 goals)
export function calculatePoissonMatrix(lambdaHome: number, lambdaAway: number, gridMax = 6): number[][] {
  const matrix: number[][] = [];
  const rho = -0.08; // Dixon-Coles correlation parameter

  // Helper for simple poisson probability
  const pmf = (lambda: number, k: number): number => {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  };

  const factorial = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  for (let h = 0; h < gridMax; h++) {
    matrix[h] = [];
    for (let a = 0; a < gridMax; a++) {
      const pBaseH = pmf(lambdaHome, h);
      const pBaseA = pmf(lambdaAway, a);
      let adjustment = 1;

      // Dixon Coles correction for low scorelines
      if (h === 0 && a === 0) adjustment = 1 - lambdaHome * lambdaAway * rho;
      else if (h === 0 && a === 1) adjustment = 1 + lambdaHome * rho;
      else if (h === 1 && a === 0) adjustment = 1 + lambdaAway * rho;
      else if (h === 1 && a === 1) adjustment = 1 - rho;

      matrix[h][a] = Math.max(0, pBaseH * pBaseA * adjustment);
    }
  }

  // Normalize so sum is exactly 1.0 (or very close)
  let totalSum = 0;
  for (let h = 0; h < gridMax; h++) {
    for (let a = 0; a < gridMax; a++) {
      totalSum += matrix[h][a];
    }
  }
  
  if (totalSum > 0) {
    for (let h = 0; h < gridMax; h++) {
      for (let a = 0; a < gridMax; a++) {
        matrix[h][a] = matrix[h][a] / totalSum;
      }
    }
  }

  return matrix;
}

// Convert score spreadsheet to probability outcomes (H, D, A)
export function getOutcomesFromPoisson(matrix: number[][]): { pHome: number; pDraw: number; pAway: number } {
  let pHome = 0;
  let pDraw = 0;
  let pAway = 0;
  const gridMax = matrix.length;

  for (let h = 0; h < gridMax; h++) {
    for (let a = 0; a < gridMax; a++) {
      if (h > a) pHome += matrix[h][a];
      else if (h === a) pDraw += matrix[h][a];
      else pAway += matrix[h][a];
    }
  }

  return { pHome, pDraw, pAway };
}

// Predict over/under 2.5 goals based on score distribution matrix
export function getOverUnderProbability(matrix: number[][], threshold = 2.5): number {
  let pUnder = 0;
  const gridMax = matrix.length;
  for (let h = 0; h < gridMax; h++) {
    for (let a = 0; a < gridMax; a++) {
      if (h + a < threshold) {
        pUnder += matrix[h][a];
      }
    }
  }
  return 1 - pUnder;
}

// Predict both teams to score based on matrix
export function getBTTSProbability(matrix: number[][]): number {
  let pBothScore = 0;
  const gridMax = matrix.length;
  for (let h = 1; h < gridMax; h++) {
    for (let a = 1; a < gridMax; a++) {
      pBothScore += matrix[h][a];
    }
  }
  return pBothScore;
}


// Teams list
export const teams: Record<string, Team> = {
  mancity: {
    id: "mancity",
    name: "Manchester City",
    shortName: "Man City",
    color: "#6CABDD",
    logoColor: "#6CABDD",
    elo: 1856,
    formPoints5: 2.4, // Average points per match in last 5
    formMatches: ["W", "W", "D", "W", "W"],
    xgAvg5: 2.12,
    squadValueEur: 1260000000,
    daysSinceLastMatch: 6,
    keyPlayerOut: false,
    sentiment: 0.75
  },
  arsenal: {
    id: "arsenal",
    name: "Arsenal",
    shortName: "Arsenal",
    color: "#EF2128",
    logoColor: "#EF2128",
    elo: 1812,
    formPoints5: 2.1,
    formMatches: ["W", "D", "W", "W", "L"],
    xgAvg5: 1.84,
    squadValueEur: 1120000000,
    daysSinceLastMatch: 5,
    keyPlayerOut: true, // e.g. Bukayo Saka
    sentiment: 0.45
  },
  liverpool: {
    id: "liverpool",
    name: "Liverpool",
    shortName: "Liverpool",
    color: "#E31B23",
    logoColor: "#E31B23",
    elo: 1834,
    formPoints5: 2.2,
    formMatches: ["W", "W", "W", "D", "W"],
    xgAvg5: 1.98,
    squadValueEur: 980000000,
    daysSinceLastMatch: 6,
    keyPlayerOut: false,
    sentiment: 0.8
  },
  chelsea: {
    id: "chelsea",
    name: "Chelsea",
    shortName: "Chelsea",
    color: "#034694",
    logoColor: "#034694",
    elo: 1742,
    formPoints5: 1.4,
    formMatches: ["L", "D", "W", "W", "D"],
    xgAvg5: 1.55,
    squadValueEur: 850000000,
    daysSinceLastMatch: 4,
    keyPlayerOut: false,
    sentiment: 0.1
  },
  wolves: {
    id: "wolves",
    name: "Wolverhampton Wanderers",
    shortName: "Wolves",
    color: "#FDB913",
    logoColor: "#231F20",
    elo: 1548,
    formPoints5: 0.8,
    formMatches: ["L", "L", "W", "L", "D"],
    xgAvg5: 0.95,
    squadValueEur: 320000000,
    daysSinceLastMatch: 7,
    keyPlayerOut: true,
    sentiment: -0.3
  },
  intermilan: {
    id: "intermilan",
    name: "Inter Milan",
    shortName: "Inter",
    color: "#001C3F",
    logoColor: "#005A9C",
    elo: 1785,
    formPoints5: 2.0,
    formMatches: ["W", "W", "L", "W", "D"],
    xgAvg5: 1.76,
    squadValueEur: 680000000,
    daysSinceLastMatch: 6,
    keyPlayerOut: false,
    sentiment: 0.65
  },
  manunited: {
    id: "manunited",
    name: "Manchester United",
    shortName: "Man Utd",
    color: "#DA020E",
    logoColor: "#FFE500",
    elo: 1690,
    formPoints5: 1.3,
    formMatches: ["W", "D", "L", "L", "W"],
    xgAvg5: 1.32,
    squadValueEur: 790000000,
    daysSinceLastMatch: 5,
    keyPlayerOut: false,
    sentiment: 0.05
  },
  tottenham: {
    id: "tottenham",
    name: "Tottenham Hotspur",
    shortName: "Spurs",
    color: "#132257",
    logoColor: "#132257",
    elo: 1715,
    formPoints5: 1.5,
    formMatches: ["W", "L", "L", "W", "W"],
    xgAvg5: 1.62,
    squadValueEur: 750000000,
    daysSinceLastMatch: 5,
    keyPlayerOut: false,
    sentiment: 0.25
  },
  realmadrid: {
    id: "realmadrid",
    name: "Real Madrid",
    shortName: "Real Madrid",
    color: "#F1C40F",
    logoColor: "#F1C40F",
    elo: 1892,
    formPoints5: 2.5,
    formMatches: ["W", "W", "W", "D", "W"],
    xgAvg5: 2.25,
    squadValueEur: 1340000000,
    daysSinceLastMatch: 6,
    keyPlayerOut: false,
    sentiment: 0.95
  },
  barcelona: {
    id: "barcelona",
    name: "FC Barcelona",
    shortName: "Barca",
    color: "#004D98",
    logoColor: "#ED2128",
    elo: 1818,
    formPoints5: 2.0,
    formMatches: ["W", "L", "W", "W", "D"],
    xgAvg5: 1.92,
    squadValueEur: 1050000000,
    daysSinceLastMatch: 5,
    keyPlayerOut: false,
    sentiment: 0.55
  }
};

// Fixtures matches database
export const matches: Match[] = [
  {
    id: "mancity_arsenal",
    date: "2026-06-20",
    time: "22:30",
    league: "Premier League",
    homeTeam: teams.mancity,
    awayTeam: teams.arsenal,
    confidence: "Cao",
    pHome: 0.45,
    pDraw: 0.28,
    pAway: 0.27,
    impliedHome: 0.42,
    impliedDraw: 0.29,
    impliedAway: 0.29,
    over25: 0.58,
    btts: 0.56,
    conformalSet: ["Thắng (Home)", "Hòa (Draw)"],
    confidenceLevel: 90,
    homeLambda: 1.85,
    awayLambda: 1.35
  },
  {
    id: "chelsea_wolves",
    date: "2026-06-21",
    time: "20:00",
    league: "Premier League",
    homeTeam: teams.chelsea,
    awayTeam: teams.wolves,
    confidence: "Trung bình",
    pHome: 0.58,
    pDraw: 0.24,
    pAway: 0.18,
    impliedHome: 0.52,
    impliedDraw: 0.26,
    impliedAway: 0.22,
    over25: 0.48,
    btts: 0.45,
    conformalSet: ["Thắng (Home)"],
    confidenceLevel: 90,
    homeLambda: 1.65,
    awayLambda: 0.85
  },
  {
    id: "realmadrid_barcelona",
    date: "2026-06-22",
    time: "02:00",
    league: "La Liga",
    homeTeam: teams.realmadrid,
    awayTeam: teams.barcelona,
    confidence: "Cao",
    pHome: 0.51,
    pDraw: 0.24,
    pAway: 0.25,
    impliedHome: 0.47,
    impliedDraw: 0.25,
    impliedAway: 0.28,
    over25: 0.65,
    btts: 0.62,
    conformalSet: ["Thắng (Home)", "Hòa (Draw)"],
    confidenceLevel: 90,
    homeLambda: 2.15,
    awayLambda: 1.45
  },
  {
    id: "manunited_tottenham",
    date: "2026-06-22",
    time: "23:00",
    league: "Premier League",
    homeTeam: teams.manunited,
    awayTeam: teams.tottenham,
    confidence: "Thấp",
    pHome: 0.38,
    pDraw: 0.27,
    pAway: 0.35,
    impliedHome: 0.40,
    impliedDraw: 0.28,
    impliedAway: 0.32,
    over25: 0.55,
    btts: 0.54,
    conformalSet: ["Thắng (Home)", "Hòa (Draw)", "Thua (Away)"],
    confidenceLevel: 90,
    homeLambda: 1.45,
    awayLambda: 1.40
  },
  {
    id: "liverpool_chelsea",
    date: "2026-06-24",
    time: "01:45",
    league: "Champions League",
    homeTeam: teams.liverpool,
    awayTeam: teams.chelsea,
    confidence: "Cao",
    pHome: 0.56,
    pDraw: 0.24,
    pAway: 0.20,
    impliedHome: 0.54,
    impliedDraw: 0.23,
    impliedAway: 0.23,
    over25: 0.61,
    btts: 0.58,
    conformalSet: ["Thắng (Home)", "Hòa (Draw)"],
    confidenceLevel: 90,
    homeLambda: 2.05,
    awayLambda: 1.15
  }
];

// Latest predictions list for home dashboard feed
export const predictionsFeed: PredictionItem[] = [
  {
    id: "feed_1",
    matchId: "liverpool_chelsea",
    title: "Liverpool Win",
    type: "result",
    detail: "Dựa trên hiệu suất 5 trận gần nhất",
    odds: 1.85,
    timeAgo: "vừa xong",
    confidence: "Cao"
  },
  {
    id: "feed_2",
    matchId: "chelsea_wolves",
    title: "Dưới 2.5 bàn",
    type: "total",
    detail: "Chelsea vs Wolves",
    odds: 2.10,
    timeAgo: "10 phút trước",
    confidence: "Rủi ro cao"
  },
  {
    id: "feed_3",
    matchId: "mancity_arsenal",
    title: "Inter Milan Win", // Keeping exact label from image: "Inter Milan Win" as mockup text
    type: "result",
    detail: "Chỉ số Elo vượt trội",
    odds: 1.42,
    timeAgo: "25 phút trước",
    confidence: "Cao"
  }
];

// Generates SHAP variables dynamically based on a match state
export function getShapFactors(match: Match): ShapFactor[] {
  const eloDiff = match.homeTeam.elo - match.awayTeam.elo;
  const formDiff = match.homeTeam.formPoints5 - match.awayTeam.formPoints5;
  const xgDiff = match.homeTeam.xgAvg5 - match.awayTeam.xgAvg5;
  const squadDiff = match.homeTeam.squadValueEur - match.awayTeam.squadValueEur;

  return [
    { name: "Chênh lệch Elo", value: Math.round(eloDiff * 0.08) },
    { name: "Hiệu suất 5 trận", value: Math.round(formDiff * 9) },
    { name: "Chỉ số bàn thắng xG", value: Math.round(xgDiff * 6) },
    { name: "Giá trị đội hình", value: Math.round(squadDiff / 100000000) },
    { name: "Lợi thế sân nhà", value: 12 },
    { name: "Chấn thương / Treo giò", value: match.homeTeam.keyPlayerOut ? -8 : match.awayTeam.keyPlayerOut ? 6 : 0 },
    { name: "Chỉ số cảm xúc (Sentiment)", value: Math.round((match.homeTeam.sentiment - match.awayTeam.sentiment) * 5) }
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
}

// Generates simulated backtest results
export interface BacktestResult {
  roi: number;
  totalBets: number;
  winRate: number;
  maxDrawdown: number;
  sharpe: number;
  data: { day: number; balance: number }[];
}

export function runBacktestSimulation(threshold: number, flatStake: number, strategy: "Flat" | "Kelly"): BacktestResult {
  const data: { day: number; balance: number }[] = [];
  let balance = 1000;
  let wins = 0;
  let total = 0;
  let maxDrawdown = 0;
  let peak = 1000;

  data.push({ day: 0, balance });

  const numGames = 60;
  for (let i = 1; i <= numGames; i++) {
    // randomized game with controlled probabilities
    const predictedProbability = 0.40 + Math.random() * 0.25;
    const impliedProbability = predictedProbability - (Math.random() * 0.15 - 0.04);
    const edge = predictedProbability - impliedProbability;

    if (edge >= threshold) {
      total++;
      const odds = 1 / impliedProbability;
      const won = Math.random() < predictedProbability;
      
      let stake = flatStake;
      if (strategy === "Kelly") {
        // Simple Kelly Criterion: stake fraction = (edge * odds) / (odds - 1)
        const kellyFraction = (edge * odds) / (odds - 1);
        stake = Math.min(Math.max(0.01, kellyFraction * 0.1), 0.1) * balance; // fractional Kelly scaled
      }

      if (won) {
        wins++;
        balance += stake * (odds - 1);
      } else {
        balance -= stake;
      }
    }

    if (balance > peak) peak = balance;
    const dd = (peak - balance) / peak;
    if (dd > maxDrawdown) maxDrawdown = dd;

    data.push({ day: i, balance: Math.round(balance * 100) / 100 });
  }

  const roi = total > 0 ? ((balance - 1000) / 1000) * 100 : 0;
  const winRate = total > 0 ? (wins / total) * 100 : 0;

  return {
    roi: Math.round(roi * 10) / 10,
    totalBets: total,
    winRate: Math.round(winRate * 10) / 10,
    maxDrawdown: Math.round(maxDrawdown * 100),
    sharpe: Math.round((roi / (maxDrawdown || 1)) * 10) / 10,
    data
  };
}

// Core RAG QA system mock engine for Chat box
export function getChatResponse(message: string): { response: string; matchId?: string; citations: string[] } {
  const q = message.toLowerCase();
  
  if (q.includes("mancity") || q.includes("man city") || q.includes("arsenal")) {
    return {
      response: `Dựa trên dữ liệu **PageRank** và **Elo hiện tại**, trận đại chiến giữa **Manchester City** (Elo: 1856) và **Arsenal** (Elo: 1812) thuộc vòng đấu tâm điểm:
- **Xác suất mô hình dự đoán:** Man City thắng 45%, Hòa 28%, Arsenal thắng 27%.
- **Edge phát hiện:** Mô hình đánh giá Man City cao hơn 3% so với tỷ lệ của các nhà cái (implied market odds: 42%).
- **Lưu ý chấn thương:** Arsenal thiếu Bukayo Saka ảnh hưởng trầm trọng đến xG tấn công bên cánh phải (giảm khoảng 0.35 xG kỳ vọng).`,
      matchId: "mancity_arsenal",
      citations: ["Chỉ số đối đầu H2H (2024-2026)", "Mô hình rating Elo nội bộ", "Báo cáo chấn thương Premier League 19/06"]
    };
  }

  if (q.includes("calibration") || q.includes("hiệu suất") || q.includes("log loss") || q.includes("độ tin cậy")) {
    return {
      response: `Mô hình **Gridiron v3-production** hiện tại ghi nhận dải hiệu suất cực kỳ ổn định trong 30 ngày qua:
- **Log Loss mô hình:** 0.612 (thấp hơn đáng kể so với Market Implied Log Loss là 0.631).
- **Mức độ Calibration:** Độ chính xác khớp hoàn hảo trong khoảng xác suất [40% - 60%], cho thấy dự báo của chúng tôi đủ tin cậy để khai thác **Edge** lâu dài.`,
      citations: ["Dữ liệu Calibration Gridiron v3", "Diebold-Mariano Significance Test (p-value = 0.041)"]
    };
  }

  if (q.includes("backtest") || q.includes("roi") || q.includes("chiến lược")) {
    return {
      response: `Hệ thống mô phỏng chiến lược cá cược bằng **Kelly Criterion** hoặc **Flat Stake** cho thấy:
- Đặt cược khi **Edge >= 3%** đạt tỉ suất sinh lời (ROI) trung bình **+14.5%** với mức Drawdown tối thiểu 18%.
- Điểm mấu chốt là kỷ luật phân bổ vốn, không nên vượt quá 2.5% tổng quỹ (flat stake) cho mỗi mã kèo để tránh rủi ro phá sản chuỗi thua dài.`,
      citations: ["Lịch sử mô phỏng Backtest 12 tháng qua", "Lý thuyết tỷ lệ Kelly sửa đổi"]
    };
  }

  // default response
  return {
    response: `Tôi đã nhận lệnh phân tích của bạn. Bạn có thể hỏi sâu hơn về:
1. Phân tích trận tâm điểm **Man City vs Arsenal** hôm nay.
2. Hiệu suất đo lường **Log Loss** và đồ thị **Calibration** của mô hình.
3. Hướng dẫn thiết lập chiến lược tối thiểu hóa rủi ro trong phần **Backtest**.`,
    citations: ["Cơ sở tri thức Gridiron Engine v3-production"]
  };
}

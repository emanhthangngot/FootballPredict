/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  logoColor: string;
  elo: number;
  formPoints5: number;
  formMatches: ("W" | "D" | "L")[];
  xgAvg5: number;
  squadValueEur: number;
  daysSinceLastMatch: number;
  keyPlayerOut: boolean;
  sentiment: number; // -1 to +1
}

export interface Match {
  id: string;
  date: string;
  time: string;
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  confidence: "Cao" | "Trung bình" | "Thấp";
  
  // Predict probabilities (1X2)
  pHome: number;
  pDraw: number;
  pAway: number;
  
  // Market Implied probabilities
  impliedHome: number;
  impliedDraw: number;
  impliedAway: number;
  
  // Other prediction targets
  over25: number; // probability of over 2.5 goals
  btts: number; // probability of both teams to score
  
  // Conformal prediction prediction set
  conformalSet: string[]; // e.g., ["Thắng (Home)", "Hòa (Draw)"]
  confidenceLevel: number; // e.g. 0.90
  
  // Dynamic Poisson outputs
  homeLambda: number;
  awayLambda: number;
}

export interface PredictionItem {
  id: string;
  matchId: string;
  title: string;
  type: "result" | "total" | "btts";
  detail: string;
  odds: number;
  timeAgo: string;
  confidence: "Cao" | "Trung bình" | "Rủi ro cao";
}

export interface ShapFactor {
  name: string;
  value: number; // positive or negative influence in %
}

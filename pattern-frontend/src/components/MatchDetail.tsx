/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Match, ShapFactor } from "../types";
import { TeamLogo } from "./TeamLogos";
import { LedProbabilityBar } from "./LedProbabilityBar";
import { calculatePoissonMatrix, getShapFactors } from "../data";
import { getFootballContextForMatch } from "../data/footballContext";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  CheckCircle, 
  BarChart3, 
  AlertCircle, 
  Quote, 
  RefreshCw, 
  Users, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Trophy, 
  AlertTriangle, 
  TrendingUp, 
  Check,
  Star
} from "lucide-react";

interface MatchDetailProps {
  match: Match;
  onBack: () => void;
  onAskAnalyst: (initialQuestion: string) => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export const MatchDetail: React.FC<MatchDetailProps> = ({
  match,
  onBack,
  onAskAnalyst,
  isSaved = false,
  onToggleSave,
}) => {
  const [activeTab, setActiveTab] = useState<"1x2" | "score" | "ou" | "btts">("1x2");
  
  // Calculate dynamic Poisson grid
  const scoreGrid = useMemo(() => {
    return calculatePoissonMatrix(match.homeLambda, match.awayLambda, 5); // 5x5 grid (0 to 4 goals)
  }, [match]);

  // Find most probable scoreline
  const mostProbableScore = useMemo(() => {
    let maxProb = 0;
    let homeScore = 0;
    let awayScore = 0;
    for (let h = 0; h < 5; h++) {
      for (let a = 0; a < 5; a++) {
        if (scoreGrid[h][a] > maxProb) {
          maxProb = scoreGrid[h][a];
          homeScore = h;
          awayScore = a;
        }
      }
    }
    return { h: homeScore, a: awayScore, prob: maxProb };
  }, [scoreGrid]);

  // Retrieve SHAP drivers
  const shapFactors = useMemo(() => {
    return getShapFactors(match);
  }, [match]);

  const footballContext = useMemo(() => {
    return getFootballContextForMatch(match.id);
  }, [match.id]);

  // Generate customized explanation sentence dynamically in Vietnamese
  const explanationText = useMemo(() => {
    const isHomeFavoured = match.pHome > match.pAway;
    const favTeam = isHomeFavoured ? match.homeTeam.shortName : match.awayTeam.shortName;
    const dogTeam = isHomeFavoured ? match.awayTeam.shortName : match.homeTeam.shortName;
    const favProb = Math.round((isHomeFavoured ? match.pHome : match.pAway) * 105); // adjusted scale
    const realFavProb = Math.min(95, Math.max(5, favProb));

    let text = `${favTeam} được mô hình dự phóng nắm bắt lợi thế cao hơn (${realFavProb}% khả năng mang về kết quả tích cực), dựa trên điểm tương quan ELO vĩ mô và phong độ ${match.homeTeam.formPoints5 > match.awayTeam.formPoints5 ? "nhỉnh hơn" : "ổn định"}. `;
    
    // Squad context integrations
    const homeLoss = footballContext.playerAvailability.home.impactLevel;
    const awayLoss = footballContext.playerAvailability.away.impactLevel;
    text += `Về mặt nhân sự, hệ thống ghi nhận tổn thất lực lượng ${homeLoss.toLowerCase()} đối với Man City và ${awayLoss.toLowerCase()} đối với Arsenal. `;
    
    // Competition & Motivation context
    text += `Trận đấu thuộc khuôn khổ ${footballContext.competition.type} với tầm quan trọng được đánh giá cực kỳ lớn (Động lực thi đấu: ${footballContext.importance.home.level}). `;
    
    // Goal outlook synthesis
    text += `Kỳ vọng diễn biến trận đấu hướng đến kịch bản: ${footballContext.goalOutlook.outlookLabel.toLowerCase()}, phản ánh sự tương đồng giữa lối chơi tiến công gần đây của hai câu lạc bộ. `;

    return text;
  }, [match, footballContext]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto pb-20">
      {/* Header section with back click button */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-850 bg-zinc-900 shadow-sm relative z-20">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center shadow-inner"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="text-xs font-sans font-black tracking-tighter text-blue-400 uppercase">
          PHÂN TÍCH CHUYÊN SÂU
        </span>
        {onToggleSave ? (
          <button
            onClick={onToggleSave}
            className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800 hover:text-white transition-all flex items-center justify-center shadow-inner ${
              isSaved ? "text-amber-500" : "text-zinc-550 hover:text-zinc-300"
            }`}
          >
            <Star size={16} fill={isSaved ? "currentColor" : "none"} />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Match hero showcase */}
      <div className="p-5 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-850 relative">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-zinc-900/90 px-3 py-1 rounded-full border border-zinc-850 text-[10px] font-mono tracking-widest text-zinc-400 capitalize whitespace-nowrap font-bold">
          {match.league}
        </div>

        <div className="flex justify-between items-center mt-6">
          {/* Home team */}
          <div className="flex flex-col items-center w-5/12 text-center">
            <div className="h-20 w-20 bg-zinc-900 p-3 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-md">
              <TeamLogo id={match.homeTeam.id} size={50} />
            </div>
            <h2 className="text-sm font-bold text-zinc-100 mt-3 truncate w-full">
              {match.homeTeam.name}
            </h2>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg mt-1 border border-zinc-800">
              ELO: {match.homeTeam.elo}
            </span>
          </div>

          {/* VS Divider */}
          <div className="w-2/12 flex flex-col items-center justify-center">
            <span className="text-xs font-sans font-black text-blue-400 tracking-wider py-1 px-2.5 rounded bg-zinc-950 border border-zinc-805 shadow-inner">
              VS
            </span>
            <span className="text-[10px] text-zinc-500 font-mono mt-2.5 flex items-center gap-1 font-bold">
              <Clock size={10} /> {match.time}
            </span>
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center w-5/12 text-center">
            <div className="h-20 w-20 bg-zinc-900 p-3 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-md">
              <TeamLogo id={match.awayTeam.id} size={50} />
            </div>
            <h2 className="text-sm font-bold text-zinc-100 mt-3 truncate w-full">
              {match.awayTeam.name}
            </h2>
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-lg mt-1 border border-zinc-800">
              ELO: {match.awayTeam.elo}
            </span>
          </div>
        </div>
      </div>

      {/* CORE Prediction Panel with segmented target Tabs */}
      <div className="p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-sm overflow-hidden">
          {/* Custom Tabs */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950 rounded-2xl mb-4 border border-zinc-850">
            {(["1x2", "score", "ou", "btts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 rounded-xl text-[10px] font-sans font-bold tracking-wider uppercase transition-all ${
                  activeTab === tab
                    ? "bg-zinc-800 text-blue-400 border border-zinc-700/50 shadow-inner"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab === "1x2" ? "Thắng 1X2" : tab === "score" ? "Tỷ số" : tab === "ou" ? "O/U 2.5" : "BTTS"}
              </button>
            ))}
          </div>

          {/* Active Tab Contents */}
          {activeTab === "1x2" && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <BarChart3 size={12} className="text-blue-400" /> Dự đoán kết quả (1X2 Prediction)
              </h4>

              {/* Predicted Outcome Card */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-3">
                <div className="text-left">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-black">Predicted Outcome / Dự đoán kết quả</span>
                  <span className="text-base font-sans font-black text-blue-400 uppercase tracking-tight block">
                    {match.homeTeam.name} Win
                  </span>
                </div>

                <div className="pt-2 border-t border-zinc-900 text-left">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block font-black">Confidence / Mức độ tin cậy</span>
                  <span className="text-xs font-sans font-extrabold text-zinc-300">
                    {Math.round(match.pHome * 100)}% · Rủi ro {match.pHome > 0.48 ? "Thấp (Low uncertainty)" : "Vừa (Medium uncertainty)"}
                  </span>
                </div>
              </div>

              {/* Outcome Distribution ranked rows */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-black">Outcome Distribution / Xác suất phân phối</span>
                
                <div className="space-y-2">
                  {[
                    { name: `${match.homeTeam.shortName} Win (Chủ nhà thắng)`, prob: match.pHome, color: "bg-blue-600 text-blue-400" },
                    { name: "Draw (Hòa)", prob: match.pDraw, color: "bg-zinc-600 text-zinc-400" },
                    { name: `${match.awayTeam.shortName} Win (Khách thắng)`, prob: match.pAway, color: "bg-rose-600 text-rose-400" }
                  ]
                  .sort((a, b) => b.prob - a.prob)
                  .map((row, idx) => (
                    <div key={idx} className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 flex flex-col gap-1.5 hover:border-zinc-700 transition-all">
                      <div className="flex justify-between items-center text-[11px] font-sans font-bold text-zinc-300">
                        <span className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${row.color.split(" ")[0]}`} />
                          {row.name}
                        </span>
                        <span className="font-mono text-sm text-zinc-100">{Math.round(row.prob * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden w-full">
                        <div className={`h-full rounded-full ${row.color.split(" ")[0]}`} style={{ width: `${row.prob * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800 text-xs text-left">
                {/* Confidence conformal set */}
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 shadow-inner">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block mb-1 uppercase">
                    CONFORMAL SET ({match.confidenceLevel}%)
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.conformalSet.map((outcome, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/15"
                      >
                        {outcome}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 shadow-inner">
                  <span className="text-[9px] font-mono font-bold text-zinc-400 block mb-1 uppercase">
                    EDGE VS NHÀ CÁI
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-300">
                      {Math.round((match.pHome - match.impliedHome) * 100) >= 0 ? "+" : ""}
                      {Math.round((match.pHome - match.impliedHome) * 100)}% Sân nhà
                    </span>
                    <span className="text-[9px] font-mono text-blue-500/80 font-bold bg-blue-500/5 px-1.5 py-0.5 rounded border border-blue-500/10 uppercase tracking-wider">
                      Optimal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "score" && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BarChart3 size={12} className="text-blue-400" /> Phân phối tỷ số Poisson (Dixon-Coles)
                </h4>
                <div className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/15">
                  Tỷ số khả dĩ nhất: {mostProbableScore.h} - {mostProbableScore.a} ({Math.round(mostProbableScore.prob * 100)}%)
                </div>
              </div>

              {/* Intensity Map Heatgrid */}
              <div className="overflow-x-auto min-w-full">
                <div className="grid grid-cols-6 gap-[2px] text-center min-w-[280px]">
                  {/* Legend Header */}
                  <div className="text-[9px] font-mono text-zinc-500 self-center uppercase py-1">H \ A</div>
                  {Array.from({ length: 5 }).map((_, colIdx) => (
                    <div key={colIdx} className="text-[10px] font-mono font-bold text-zinc-400 py-1">
                      {colIdx} Khách
                    </div>
                  ))}

                  {/* Matrix Rows */}
                  {Array.from({ length: 5 }).map((_, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                      {/* Row Label */}
                      <div className="text-[10px] font-mono font-bold text-zinc-400 self-center py-2">
                        {rowIdx} Nhà
                      </div>
                      
                      {/* Columns */}
                      {Array.from({ length: 5 }).map((_, colIdx) => {
                        const cellProb = scoreGrid[rowIdx][colIdx] || 0;
                        const isHighest = rowIdx === mostProbableScore.h && colIdx === mostProbableScore.a;
                        
                        // Scale color density based on cell probability
                        const opacity = Math.min(1, Math.max(0.05, cellProb * 6.5));
                        
                        return (
                          <div
                            key={colIdx}
                            className={`p-2 rounded-xl font-mono text-[10px] flex flex-col justify-center items-center relative aspect-square transition-all ${
                              isHighest 
                                ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-zinc-900 scale-[1.03] z-10" 
                                : ""
                            }`}
                            style={{
                              backgroundColor: `rgba(59, 130, 246, ${opacity * 0.95})`,
                              color: opacity > 0.4 ? "#ffffff" : "#d4d4d8"
                            }}
                          >
                            <span className="font-bold">{Math.round(cellProb * 100)}%</span>
                            <span className="text-[7.5px] opacity-75">{rowIdx}-{colIdx}</span>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "ou" && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <BarChart3 size={12} className="text-blue-400" /> Dự Đoán Tổng Số Bàn (Tài / Xỉu)
              </h4>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">TÀI (Over 2.5)</span>
                  <span className="text-2xl font-mono font-black text-blue-400">
                    {Math.round(match.over25 * 100)}%
                  </span>
                  <div className="w-16 h-1 bg-blue-500 rounded-full mt-2" style={{ width: `${match.over25 * 100}%` }} />
                </div>

                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">XỈU (Under 2.5)</span>
                  <span className="text-2xl font-mono font-black text-zinc-400">
                    {Math.round((1 - match.over25) * 100)}%
                  </span>
                  <div className="w-16 h-1 bg-zinc-650 rounded-full mt-2" style={{ width: `${(1 - match.over25) * 100}%` }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "btts" && (
            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <BarChart3 size={12} className="text-blue-400" /> Hai Đội Ghi Bàn (BTTS)
              </h4>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-zinc-950 border border-blue-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">CÓ (BTTS - Yes)</span>
                  <span className="text-2xl font-mono font-black text-blue-400">
                    {Math.round(match.btts * 100)}%
                  </span>
                  <div className="w-16 h-1 bg-blue-500 rounded-full mt-2" style={{ width: `${match.btts * 100}%` }} />
                </div>

                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-inner">
                  <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase block mb-1">KHÔNG (BTTS - No)</span>
                  <span className="text-2xl font-mono font-black text-zinc-400">
                    {Math.round((1 - match.btts) * 100)}%
                  </span>
                  <div className="w-16 h-1 bg-zinc-650 rounded-full mt-2" style={{ width: `${(1 - match.btts) * 100}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMPREHENSIVE PRE-MATCH FOOTBALL CONTEXT PANEL */}
      
      {/* 1. Team News & Player Availability Module */}
      <div className="p-4 pt-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <h4 className="text-xs font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users size={13} className="text-blue-400 animate-pulse" /> ĐỘI HÌNH & LỰC LƯỢNG KHẢ DĨ
            </h4>
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Team News</span>
          </div>

          {/* Availability Impact Severity Comparison */}
          <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850">
            <div className="text-center space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 block uppercase">{match.homeTeam.shortName}</span>
              <span className="text-[10px] font-mono font-bold text-blue-400">{footballContext.playerAvailability.home.impactLevel}</span>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-1.5 w-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${footballContext.playerAvailability.home.impactScore}%` }} />
              </div>
              <span className="text-[8.5px] text-zinc-500 block">Tác động nhân dụng: {footballContext.playerAvailability.home.impactScore}%</span>
            </div>

            <div className="text-center space-y-1 border-l border-zinc-800 pl-3">
              <span className="text-[9px] font-bold text-zinc-400 block uppercase">{match.awayTeam.shortName}</span>
              <span className="text-[10px] font-mono font-bold text-rose-400">{footballContext.playerAvailability.away.impactLevel}</span>
              <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden mt-1.5 w-full">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${footballContext.playerAvailability.away.impactScore}%` }} />
              </div>
              <span className="text-[8.5px] text-zinc-500 block">Tác động nhân dụng: {footballContext.playerAvailability.away.impactScore}%</span>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-left">
            {/* Squad availability list - Home */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">{match.homeTeam.name}</span>
              </div>
              <p className="text-[10px] text-zinc-400 italic font-medium leading-relaxed bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-850 mb-2">
                "{footballContext.playerAvailability.home.squadNote}"
              </p>

              {footballContext.playerAvailability.home.unavailable.length > 0 ? (
                <div className="space-y-1 pl-4">
                  <span className="text-[8px] font-mono text-rose-400 uppercase tracking-widest font-black block mb-0.5">VẮNG MẶT (UNAVAILABLE):</span>
                  {footballContext.playerAvailability.home.unavailable.map((player, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-sans font-bold text-zinc-300">
                      <span>• {player.name} <span className="text-zinc-500 font-normal">({player.reason.toLowerCase()})</span></span>
                      <span className="text-[8.5px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-1.5 py-0.5 rounded-md text-[8.5px]">
                        tác động {player.impact.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {footballContext.playerAvailability.home.doubtful.length > 0 ? (
                <div className="space-y-1 pl-4 pt-1">
                  <span className="text-[8px] font-mono text-amber-400 uppercase tracking-widest font-black block mb-0.5">BỎ NGỎ (DOUBTFUL):</span>
                  {footballContext.playerAvailability.home.doubtful.map((player, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-sans font-bold text-zinc-300">
                      <span>• {player.name} <span className="text-zinc-500 font-normal">({player.reason.toLowerCase()})</span></span>
                      <span className="text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-md text-[8.5px]">
                        tác động {player.impact.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Squad availability list - Away */}
            <div className="space-y-1.5 pt-1.5 border-t border-zinc-850">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">{match.awayTeam.name}</span>
              </div>
              <p className="text-[10px] text-zinc-400 italic font-medium leading-relaxed bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-zinc-850 mb-2">
                "{footballContext.playerAvailability.away.squadNote}"
              </p>

              {footballContext.playerAvailability.away.unavailable.length > 0 ? (
                <div className="space-y-1 pl-4">
                  <span className="text-[8px] font-mono text-rose-400 uppercase tracking-widest font-black block mb-0.5">VẮNG MẶT (UNAVAILABLE):</span>
                  {footballContext.playerAvailability.away.unavailable.map((player, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-sans font-bold text-zinc-300">
                      <span>• {player.name} <span className="text-zinc-500 font-normal">({player.reason.toLowerCase()})</span></span>
                      <span className="text-[8.5px] bg-rose-500/10 text-rose-400 border border-rose-500/25 px-1.5 py-0.5 rounded-md text-[8.5px]">
                        tác động {player.impact.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {footballContext.playerAvailability.away.doubtful.length > 0 ? (
                <div className="space-y-1 pl-4 pt-1">
                  <span className="text-[8px] font-mono text-amber-400 uppercase tracking-widest font-black block mb-0.5">BỎ NGỎ (DOUBTFUL):</span>
                  {footballContext.playerAvailability.away.doubtful.map((player, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[10px] font-sans font-bold text-zinc-300">
                      <span>• {player.name} <span className="text-zinc-500 font-normal">({player.reason.toLowerCase()})</span></span>
                      <span className="text-[8.5px] bg-amber-500/10 text-amber-400 border border-amber-500/25 px-1.5 py-0.5 rounded-md text-[8.5px]">
                        tác động {player.impact.toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Home vs Away Recent Form Split Module */}
      <div className="p-4 pt-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <h4 className="text-xs font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 size={13} className="text-blue-400" /> TƯƠNG QUAN PHONG ĐỘ (H/A SPLIT)
            </h4>
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Form Splits</span>
          </div>

          <p className="text-[10px] text-zinc-400 leading-relaxed font-sans text-left">
            Phân tích chi tiết tỉ lệ thắng/hoà/thua dựa trên <span className="text-blue-400 font-bold">20 trận đấu phân định</span> (Tương thích sân nhà của {match.homeTeam.shortName} và sân khách của {match.awayTeam.shortName}).
          </p>

          <div className="space-y-4 pt-2">
            {/* Split 1: 20 Matches overall */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-zinc-400 block uppercase text-left tracking-wider">A. Phong độ chung (20 trận gần đây nhất)</span>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Home team */}
                <div className="space-y-1.5 text-left bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-zinc-300">W/D/L:</span>
                    <span className="font-mono text-blue-400">{footballContext.formSplit.home.overall20.winRate}% / {footballContext.formSplit.home.overall20.drawRate}% / {footballContext.formSplit.home.overall20.lossRate}%</span>
                  </div>
                  <div className="flex h-1.5 bg-zinc-900 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${footballContext.formSplit.home.overall20.winRate}%` }} />
                    <div className="bg-zinc-650 h-full" style={{ width: `${footballContext.formSplit.home.overall20.drawRate}%` }} />
                    <div className="bg-rose-600 h-full" style={{ width: `${footballContext.formSplit.home.overall20.lossRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 pt-0.5">
                    <span>Bàn ghi: {footballContext.formSplit.home.overall20.avgScored}</span>
                    <span>Thủng: {footballContext.formSplit.home.overall20.avgConceded}</span>
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold">Giữ sạch lưới: {footballContext.formSplit.home.overall20.cleanSheets}%</div>
                </div>

                {/* Away team */}
                <div className="space-y-1.5 text-left bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-zinc-300">W/D/L:</span>
                    <span className="font-mono text-rose-400">{footballContext.formSplit.away.overall20.winRate}% / {footballContext.formSplit.away.overall20.drawRate}% / {footballContext.formSplit.away.overall20.lossRate}%</span>
                  </div>
                  <div className="flex h-1.5 bg-zinc-900 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${footballContext.formSplit.away.overall20.winRate}%` }} />
                    <div className="bg-zinc-650 h-full" style={{ width: `${footballContext.formSplit.away.overall20.drawRate}%` }} />
                    <div className="bg-rose-600 h-full" style={{ width: `${footballContext.formSplit.away.overall20.lossRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 pt-0.5">
                    <span>Bàn ghi: {footballContext.formSplit.away.overall20.avgScored}</span>
                    <span>Thủng: {footballContext.formSplit.away.overall20.avgConceded}</span>
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold">Giữ sạch lưới: {footballContext.formSplit.away.overall20.cleanSheets}%</div>
                </div>
              </div>
            </div>

            {/* Split 2: Home vs Away Split (IMPORTANT!) */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono font-bold text-blue-400 block uppercase text-left tracking-wider">B. Chia tách Sân Nhà vs Sân Khách (20 trận)</span>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Home stats for Home team */}
                <div className="space-y-1.5 text-left bg-blue-950/20 border border-blue-500/10 p-3 rounded-2xl">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-blue-300">Tại Sân Nhà:</span>
                    <span className="font-mono text-blue-400">{footballContext.formSplit.home.homeOrAway20.winRate}% / {footballContext.formSplit.home.homeOrAway20.drawRate}% / {footballContext.formSplit.home.homeOrAway20.lossRate}%</span>
                  </div>
                  <div className="flex h-1.5 bg-zinc-900 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${footballContext.formSplit.home.homeOrAway20.winRate}%` }} />
                    <div className="bg-zinc-650 h-full" style={{ width: `${footballContext.formSplit.home.homeOrAway20.drawRate}%` }} />
                    <div className="bg-rose-600 h-full" style={{ width: `${footballContext.formSplit.home.homeOrAway20.lossRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-400 pt-0.5">
                    <span>Ghi bàn: {footballContext.formSplit.home.homeOrAway20.avgScored}</span>
                    <span>Thủng: {footballContext.formSplit.home.homeOrAway20.avgConceded}</span>
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold">Sạch lưới sân nhà: {footballContext.formSplit.home.homeOrAway20.cleanSheets}%</div>
                </div>

                {/* Away stats for Away team */}
                <div className="space-y-1.5 text-left bg-zinc-950 p-3 rounded-2xl border border-zinc-850">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-bold text-amber-500">Tại Sân Khách:</span>
                    <span className="font-mono text-amber-500">{footballContext.formSplit.away.homeOrAway20.winRate}% / {footballContext.formSplit.away.homeOrAway20.drawRate}% / {footballContext.formSplit.away.homeOrAway20.lossRate}%</span>
                  </div>
                  <div className="flex h-1.5 bg-zinc-900 rounded overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${footballContext.formSplit.away.homeOrAway20.winRate}%` }} />
                    <div className="bg-zinc-650 h-full" style={{ width: `${footballContext.formSplit.away.homeOrAway20.drawRate}%` }} />
                    <div className="bg-rose-600 h-full" style={{ width: `${footballContext.formSplit.away.homeOrAway20.lossRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 pt-0.5">
                    <span>Ghi bàn: {footballContext.formSplit.away.homeOrAway20.avgScored}</span>
                    <span>Thủng: {footballContext.formSplit.away.homeOrAway20.avgConceded}</span>
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold">Sạch lưới sân khách: {footballContext.formSplit.away.homeOrAway20.cleanSheets}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Competition Context & Thể thức thi đấu */}
      <div className="p-4 pt-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <h4 className="text-xs font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Trophy size={13} className="text-blue-400" /> BỐI CẢNH GIẢI ĐẤU & THỂ THỨC CARREER
            </h4>
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Rules</span>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 space-y-3 text-xs text-left">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="text-[9.5px] text-zinc-500 block uppercase font-mono tracking-wider">HẠNG MỤC:</span>
                <span className="text-zinc-200 font-sans font-bold">{footballContext.competition.type}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 block uppercase font-mono tracking-wider">ĐỊA ĐIỂM SÂN:</span>
                <span className="text-zinc-200 font-sans font-bold">{footballContext.competition.isNeutralVenue ? "Sân trung lập" : `Sân nhà ${match.homeTeam.shortName}`}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 block uppercase font-mono tracking-wider">ĐỘNG LỰC TRẬN ĐẤU:</span>
                <span className="text-blue-400 font-sans font-extrabold uppercase bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 w-fit text-[9px]">
                  {footballContext.competition.motivationScore}
                </span>
              </div>
              <div>
                <span className="text-[9.5px] text-zinc-500 block uppercase font-mono tracking-wider">RỦI RO XOAY TUA:</span>
                <span className="text-rose-400 font-sans font-extrabold uppercase bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 w-fit text-[9px]">
                  {footballContext.competition.rotationRiskScore}
                </span>
              </div>
            </div>

            {/* Special Knockout attributes if applicable */}
            {footballContext.competition.isKnockout && (
              <div className="pt-2 border-t border-zinc-900 flex items-center gap-2">
                <ShieldAlert size={12} className="text-red-400" />
                <span className="text-[10px] font-bold text-red-400">
                  Thể thức loại trực tiếp (Knockout) • Cúp Lượt {footballContext.competition.isTwoLeggedTie ? "về" : "đơn"} (Lượt đi: {footballContext.competition.aggregateScore || "0-0"})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Match Importance & Motivation Score */}
      <div className="p-4 pt-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <h4 className="text-xs font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Flame size={13} className="text-blue-400" /> ĐỘNG LỰC THI ĐẤU & ĐIỂM QUAN TRỌNG
            </h4>
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Motivation</span>
          </div>

          <div className="space-y-3 text-xs text-left">
            {/* Home motivation */}
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-white uppercase">{match.homeTeam.name}</span>
                <span className="text-[9px] text-blue-400 font-black bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20 uppercase tracking-wider">
                  QUAN TRỌNG: {footballContext.importance.home.level}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed pt-1">
                {footballContext.importance.home.reason}
              </p>
            </div>

            {/* Away motivation */}
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-white uppercase">{match.awayTeam.name}</span>
                <span className="text-[9px] text-amber-400 font-black bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 uppercase tracking-wider">
                  QUAN TRỌNG: {footballContext.importance.away.level}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed pt-1">
                {footballContext.importance.away.reason}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Goal Expectation (High scoring / Clean outlook) */}
      <div className="p-4 pt-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3.5">
          <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
            <h4 className="text-xs font-sans font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <Zap size={13} className="text-blue-400 animate-pulse" /> DIỄN BIẾN SỐ BÀN THẮNG KỲ VỌNG
            </h4>
            <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-widest">Goal Outlook</span>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-850 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wide block">Đánh giá chung:</span>
              <span className="text-[10px] text-white font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-[9px]">
                {footballContext.goalOutlook.outlookLabel}
              </span>
            </div>

            <div className="space-y-1.5 pt-1.5 border-t border-zinc-900 text-[10px] text-zinc-400">
              <span className="text-[8.5px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">CƠ SỞ DỮ LIỆU PHÂN TÍCH:</span>
              {footballContext.goalOutlook.reasons.map((reason, idx) => (
                <div key={idx} className="flex gap-2 items-start font-medium leading-relaxed">
                  <Check size={11} className="text-blue-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Waterfall Chart panel */}
      <div className="p-4 pt-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
               Tác động biến phân tích (SHAP values)
            </h4>
            <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">MỨC ĐÓNG GÓP %</span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
            Đồ thị thể hiện lực kéo của các tham số chính kéo đẩy điểm xác suất thắng của đội chủ nhà lên hoặc xuống so với xác suất gốc.
          </p>

          {/* Custom Horizontal Bar representation */}
          <div className="space-y-3.5">
            {shapFactors.map((factor, idx) => {
              const isPositive = factor.value >= 0;
              const absVal = Math.abs(factor.value);
              const maxVal = 25; // max limit for scaling width percentage
              const widthPct = Math.min(100, (absVal / maxVal) * 100);

              return (
                <div key={idx} className="flex items-center justify-between text-xs text-left">
                  {/* Name */}
                  <span className="w-4/12 text-zinc-300 font-mono text-[11px] truncate">{factor.name}</span>

                  {/* Dual anchor bar visualizer */}
                  <div className="w-6/12 h-6 bg-zinc-950 rounded-lg relative overflow-hidden flex items-center px-1">
                    {isPositive ? (
                      <div className="ml-1/2 flex items-center w-full justify-start translate-x-[45px]">
                        <div 
                          className="h-3.5 bg-blue-500 rounded-lg shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-700 delay-100" 
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    ) : (
                      <div className="mr-1/2 flex items-center w-full justify-end -translate-x-[45px]">
                        <div 
                          className="h-3.5 bg-rose-500 rounded-lg shadow-[0_0_8px_rgba(244,63,94,0.3)] transition-all duration-700 delay-100" 
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    )}
                    {/* Midline anchor indicator */}
                    <div className="absolute left-[45px] top-0 bottom-0 w-[1.5px] bg-zinc-800" />
                  </div>

                  {/* Signed Impact Tag */}
                  <span className={`w-2/12 text-right font-mono text-xs font-bold ${isPositive ? "text-blue-400" : "text-rose-400"}`}>
                    {isPositive ? "+" : "-"}
                    {absVal}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Synthesized Vietnamese overview card */}
      <div className="p-4 pt-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 relative overflow-hidden shadow-sm">
          <div className="absolute -top-3 -right-3 w-16 h-16 bg-blue-600/5 rounded-full blur-xl" />
          
          <h4 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
            <Quote size={13} /> Phân tích ngôn ngữ tự nhiên
          </h4>

          <div className="text-xs text-zinc-300 leading-relaxed space-y-2 text-left">
            <p>{explanationText}</p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex gap-1.5 text-[9px] font-mono text-zinc-500">
               Nguồn: <span className="underline">Dữ liệu Elo v3</span>, <span className="underline">xG StatsBomb</span>
            </div>
            
            <button 
              onClick={() => onAskAnalyst(`So sánh chấn thương và tác động Elo của trận ${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`)}
              className="text-[10px] font-mono text-blue-400 font-bold bg-blue-500/10 px-2.5 py-1.5 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center gap-1"
            >
              Hỏi sâu trận này →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

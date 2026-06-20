/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { TrendingUp, Award, Shield } from "lucide-react";

interface LedProbabilityBarProps {
  pHome: number; // 0.0 to 1.0
  pDraw: number;
  pAway: number;
  homeName?: string;
  awayName?: string;
  height?: number;
  animate?: boolean;
}

export const LedProbabilityBar: React.FC<LedProbabilityBarProps> = ({
  pHome,
  pDraw,
  pAway,
  homeName,
  awayName,
  animate = true,
}) => {
  const [fillPercent, setFillPercent] = useState(animate ? 0 : 1);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setFillPercent(1);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [animate, pHome, pDraw, pAway]);

  const total = pHome + pDraw + pAway || 1;
  const rawHome = (pHome / total) * 100;
  const rawDraw = (pDraw / total) * 100;
  const rawAway = (pAway / total) * 100;

  const hName = homeName || "Chủ";
  const aName = awayName || "Khách";

  // Determine the primary predicted outcome
  const maxProb = Math.max(pHome, pDraw, pAway);
  const isHomeMax = maxProb === pHome;
  const isDrawMax = maxProb === pDraw;
  const isAwayMax = maxProb === pAway;

  // Render text and colors of the primary prediction
  let predictionTitle = "";
  let predictionColorClass = "";
  let predictionIcon = <TrendingUp size={12} />;

  if (isHomeMax) {
    predictionTitle = `${hName} Thắng`;
    predictionColorClass = "text-blue-400 bg-blue-500/10 border-blue-500/20";
    predictionIcon = <Award size={12} className="text-blue-400" />;
  } else if (isAwayMax) {
    predictionTitle = `${aName} Thắng`;
    predictionColorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    predictionIcon = <Award size={12} className="text-amber-400" />;
  } else {
    predictionTitle = "Hai đội Hòa";
    predictionColorClass = "text-zinc-300 bg-zinc-800/40 border-zinc-750";
    predictionIcon = <Shield size={12} className="text-zinc-400" />;
  }

  return (
    <div className="w-full space-y-2.5 font-sans relative z-10">
      {/* Primary Prediction Accent Bar */}
      <div className={`flex items-center justify-between p-2 rounded-2xl border ${predictionColorClass} transition-all duration-500`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {predictionIcon}
          <div className="flex flex-col text-left min-w-0">
            <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold leading-none">Dự báo chính</span>
            <span className="text-[11px] font-extrabold tracking-tight mt-0.5 truncate">{predictionTitle}</span>
          </div>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold leading-none">Khả năng</span>
          <span className="text-xs font-mono font-black mt-0.5">
            {Math.round(maxProb * 100)}%
          </span>
        </div>
      </div>

      {/* Outcome Probability Cards Grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* Home option card */}
        <div 
          className={`px-2 py-1.5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center ${
            isHomeMax 
              ? "bg-blue-600/10 border-blue-500/25 shadow-[0_2px_12px_rgba(59,130,246,0.08)]" 
              : "bg-zinc-950/40 border-zinc-900/60"
          }`}
        >
          <span className={`text-[9px] font-bold tracking-wider uppercase mb-0.5 truncate max-w-full ${
            isHomeMax ? "text-blue-400 font-black" : "text-zinc-500"
          }`}>
            {hName}
          </span>
          <span className={`font-mono text-xs font-black tracking-tight ${
            isHomeMax ? "text-blue-400" : "text-zinc-300"
          }`}>
            {Math.round(rawHome * fillPercent)}%
          </span>
        </div>

        {/* Draw option card */}
        <div 
          className={`px-2 py-1.5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center ${
            isDrawMax 
              ? "bg-zinc-800/60 border-zinc-700/80 shadow-[0_2px_12px_rgba(255,255,255,0.03)]" 
              : "bg-zinc-950/40 border-zinc-900/60"
          }`}
        >
          <span className={`text-[9px] font-bold tracking-wider uppercase mb-0.5 truncate max-w-full ${
            isDrawMax ? "text-zinc-200 font-black" : "text-zinc-500"
          }`}>
            Hòa
          </span>
          <span className={`font-mono text-xs font-black tracking-tight ${
            isDrawMax ? "text-zinc-100" : "text-zinc-400"
          }`}>
            {Math.round(rawDraw * fillPercent)}%
          </span>
        </div>

        {/* Away option card */}
        <div 
          className={`px-2 py-1.5 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center ${
            isAwayMax 
              ? "bg-amber-600/10 border-amber-500/25 shadow-[0_2px_12px_rgba(245,158,11,0.08)]" 
              : "bg-zinc-950/40 border-zinc-900/60"
          }`}
        >
          <span className={`text-[9px] font-bold tracking-wider uppercase mb-0.5 truncate max-w-full ${
            isAwayMax ? "text-amber-400 font-black" : "text-zinc-500"
          }`}>
            {aName}
          </span>
          <span className={`font-mono text-xs font-black tracking-tight ${
            isAwayMax ? "text-amber-400" : "text-zinc-300"
          }`}>
            {Math.round(rawAway * fillPercent)}%
          </span>
        </div>
      </div>
    </div>
  );
};

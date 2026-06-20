/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PredictionItem } from "../types";
import { Activity, Clock, Heart, Award, Cpu, TrendingUp } from "lucide-react";

interface LatestPredictionsProps {
  predictions: PredictionItem[];
  onSelectPrediction: (predictionId: string) => void;
}

export const LatestPredictions: React.FC<LatestPredictionsProps> = ({
  predictions,
  onSelectPrediction,
}) => {
  const [items, setItems] = useState<PredictionItem[]>(predictions);
  const [loading, setLoading] = useState(false);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      // Add fake next predictions
      const additional: PredictionItem[] = [
        {
          id: `feed_${items.length + 1}`,
          matchId: "manunited_tottenham",
          title: "Tottenham +0.25 AH",
          type: "result",
          detail: "Dựa trên chênh lệch thể lực thi đấu",
          odds: 1.76,
          timeAgo: "45 phút trước",
          confidence: "Trung bình"
        },
        {
          id: `feed_${items.length + 2}`,
          matchId: "realmadrid_barcelona",
          title: "Real Madrid Thắng",
          type: "result",
          detail: "El Clasico: Lợi thế sân nhà Santiago Bernabeu",
          odds: 2.02,
          timeAgo: "1 giờ trước",
          confidence: "Cao"
        }
      ];
      setItems((prev) => [...prev, ...additional]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="py-2 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans font-black tracking-tighter text-white text-base uppercase">
          Dự đoán mới nhất
        </h3>
        <span className="flex items-center gap-1.5 text-[9px] font-mono text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1.5 rounded-full border border-blue-500/20 animate-pulse font-bold">
          <Activity size={10} /> MÔ HÌNH CHẠY LIVE
        </span>
      </div>

      <div className="space-y-3.5">
        {items.map((pred) => {
          // Select custom side border colored indicator
          const isResult = pred.type === "result";
          const isTotal = pred.type === "total";

          // Icon and bg glow selector
          let iconEl = <Award className="w-5 h-5 text-blue-400" />;
          let iconBg = "bg-blue-500/10 border-blue-500/20";
          let borderGlow = "border-l-blue-500";

          if (isTotal) {
            iconEl = <TrendingUp className="w-5 h-5 text-rose-400" />;
            iconBg = "bg-rose-500/10 border-rose-500/20";
            borderGlow = "border-l-rose-500";
          } else if (pred.odds < 1.5) {
            iconEl = <Cpu className="w-5 h-5 text-amber-400" />;
            iconBg = "bg-amber-500/10 border-amber-500/20";
            borderGlow = "border-l-amber-500";
          }

          return (
            <div
              key={pred.id}
              onClick={() => onSelectPrediction(pred.matchId)}
              className={`flex items-center justify-between bg-zinc-900 border-y border-r border-zinc-800 border-l-[3.5px] ${borderGlow} hover:border-zinc-700 hover:bg-zinc-850 transition-all duration-200 rounded-3xl p-4.5 cursor-pointer shadow-md`}
            >
              {/* Left Wing Info */}
              <div className="flex items-center gap-3 w-8/12">
                {/* Visual Icon Badge */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${iconBg}`}>
                  {iconEl}
                </div>

                {/* Match title and specs */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <h4 className="text-sm font-bold text-zinc-100 truncate leading-tight">
                      {pred.title}
                    </h4>
                    <span className="text-[9px] text-zinc-505 font-mono flex-shrink-0">
                      • {pred.timeAgo}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate leading-relaxed">
                    {pred.detail}
                  </p>
                </div>
              </div>

              {/* Right Wing: Odds tag */}
              <div className="flex flex-col items-end justify-center w-4/12">
                <div className="bg-zinc-950 border border-zinc-805 rounded-2xl px-3 py-1.5 flex flex-col items-center">
                  <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono mb-px font-bold">
                     ODDS
                  </span>
                  <span className="text-sm font-mono font-black text-blue-400">
                    x{pred.odds.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button matching exact image layout */}
      <div className="mt-5">
        <button
          onClick={loadMore}
          disabled={loading}
          className="w-full bg-zinc-900 hover:bg-zinc-850 active:bg-zinc-900 text-zinc-400 hover:text-blue-400 border border-zinc-800 hover:border-zinc-700 py-3.5 px-4 rounded-2xl text-xs font-mono font-bold tracking-wider uppercase transition-all duration-200 shadow-sm"
        >
          {loading ? "ĐANG TẢI DỮ LIỆU..." : "TẢI THÊM KẾT QUẢ"}
        </button>
      </div>
    </div>
  );
};

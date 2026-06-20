/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Match } from "../types";
import { TeamLogo } from "./TeamLogos";
import { LedProbabilityBar } from "./LedProbabilityBar";

interface UpcomingFixturesProps {
  fixtures: Match[];
  onSelectMatch: (match: Match) => void;
}

export const UpcomingFixtures: React.FC<UpcomingFixturesProps> = ({
  fixtures,
  onSelectMatch,
}) => {
  return (
    <div className="py-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-sans font-black tracking-tighter text-white text-base uppercase">
          Trận đấu sắp tới
        </h3>
        <button 
          onClick={() => {
            // Can trigger a view change or action
          }}
          className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 hover:text-blue-450 transition-colors uppercase"
        >
          Xem tất cả
        </button>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory -mx-1 px-1">
        {fixtures.map((fixture) => {
          const edge = fixture.pHome - fixture.impliedHome;
          const edgePercent = Math.round(edge * 100);
          
          return (
            <div
              key={fixture.id}
              onClick={() => onSelectMatch(fixture)}
              className="flex-shrink-0 w-[290px] bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 rounded-3xl p-4.5 cursor-pointer snap-start relative overflow-hidden group shadow-lg"
            >
              {/* Subtle shining effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/0 via-blue-500/0 to-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300" />

              {/* Header inside Card */}
              <div className="flex justify-between items-center mb-3 relative z-10">
                <span className="text-[10px] font-bold tracking-widest text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded-lg border border-zinc-850 uppercase">
                  {fixture.league}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${
                    fixture.confidence === "Cao" 
                      ? "bg-blue-500 animate-pulse" 
                      : fixture.confidence === "Trung bình"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`} />
                  <span className="text-[10px] font-sans font-extrabold text-zinc-300 uppercase tracking-wide not-italic">
                    Độ tin cậy: {fixture.confidence}
                  </span>
                </div>
              </div>

              {/* Team matchup with clear vector logos */}
              <div className="flex justify-between items-center my-4 relative z-10 px-2">
                <div className="flex flex-col items-center w-5/12 text-center">
                  <div className="h-16 w-16 bg-zinc-950 p-2 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <TeamLogo id={fixture.homeTeam.id} size={38} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 mt-2 truncate w-full">
                    {fixture.homeTeam.shortName}
                  </span>
                </div>

                <div className="w-2/12 text-center flex flex-col justify-center items-center">
                  <span className="text-xs font-mono text-slate-500 font-bold bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                    VS
                  </span>
                </div>

                <div className="flex flex-col items-center w-5/12 text-center">
                  <div className="h-16 w-16 bg-zinc-950 p-2 rounded-2xl flex items-center justify-center border border-zinc-800 shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <TeamLogo id={fixture.awayTeam.id} size={38} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 mt-2 truncate w-full">
                    {fixture.awayTeam.shortName}
                  </span>
                </div>
              </div>

              {/* Dynamic segmented LED probability bar */}
              <div className="my-2 relative z-10">
                <LedProbabilityBar 
                  pHome={fixture.pHome} 
                  pDraw={fixture.pDraw} 
                  pAway={fixture.pAway} 
                  homeName={fixture.homeTeam.shortName}
                  awayName={fixture.awayTeam.shortName}
                />
              </div>

              {/* Foot information: Edge Indicator */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800 relative z-10 text-[11px] font-mono">
                <span className="text-zinc-500 text-[10px]">Trận lúc: {fixture.time}</span>
                {edgePercent > 0 ? (
                  <span className="text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg">
                    EDGE: +{edgePercent}%
                  </span>
                ) : (
                  <span className="text-zinc-500">Khớp giá trị sàn</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

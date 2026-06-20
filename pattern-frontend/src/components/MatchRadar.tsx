import React from "react";
import { Match } from "../types";
import { TeamLogo } from "./TeamLogos";
import { Star, Bell, ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles, MessageSquare, ChevronRight } from "lucide-react";

interface MatchRadarProps {
  savedMatches: Match[];
  onRemoveMatch: (id: string) => void;
  onSelectMatch: (match: Match) => void;
  onAskAI: (promptText: string) => void;
  allMatches: Match[];
  onAddMatch: (id: string) => void;
}

export const MatchRadar: React.FC<MatchRadarProps> = ({
  savedMatches,
  onRemoveMatch,
  onSelectMatch,
  onAskAI,
  allMatches,
  onAddMatch
}) => {
  // Built-in prediction change telemetry for mock data
  const radarMetadata: Record<string, {
    changeLabel: string;
    isIncrease: boolean;
    reasons: string[];
  }> = {
    mancity_arsenal: {
      changeLabel: "Độ tự tin tăng từ 41% lên 45%",
      isIncrease: true,
      reasons: [
        "Phong độ sân nhà của Man City được cải thiện (W/D/L: 80% / 15% / 5%)",
        "Arsenal ghi nhận chấn thương/bỏ ngỏ của một số trụ cột (Bukayo Saka)",
        "Tín hiệu thị trường từ nhà cái lệch +3.2% so với điểm Elo thực tế",
        "Động lực thi đấu cả hai cực kỳ cao (Tranh ngôi vô địch vĩ mô)"
      ]
    },
    realmadrid_barcelona: {
      changeLabel: "Độ tự tin giảm từ 53% xuống 51%",
      isIncrease: false,
      reasons: [
        "Sự gắn kết phòng ngự của Barca cải thiện rõ rệt trong 3 trận gần đây",
        "Áp lực xoay tua đội hình của Real Madrid trước đấu trường Champions League",
        "Xu hướng dòng tiền giao dịch dịch chuyển nhẹ về tỷ số Hòa"
      ]
    },
    chelsea_wolves: {
      changeLabel: "Độ tự tin tăng từ 55% lên 58%",
      isIncrease: true,
      reasons: [
        "Tiền đạo chủ lực Wolves chấn thương cơ khép (Tác động Vắng mặt Rất lớn)",
        "Chelsea ổn định hàng thủ tốt tại Stamford Bridge",
        "Biên an toàn Edge mô hình so với sàn giao dịch mở rộng lên +6.0%"
      ]
    },
    manunited_tottenham: {
      changeLabel: "Độ tự tin giảm từ 40% xuống 38%",
      isIncrease: false,
      reasons: [
        "Biến động chiến thuật tuyến giữa của Tottenham khó đoán định",
        "Lịch sử đối đầu trực diện ghi nhận kết quả bất phân thắng bại và rung lắc mạnh",
        "Kỳ vọng xG xấp xỉ ngang nhau (1.45 vs 1.40)"
      ]
    },
    liverpool_chelsea: {
      changeLabel: "Độ tự tin tăng từ 52% lên 56%",
      isIncrease: true,
      reasons: [
        "Liverpool đạt hiệu suất xG sân nhà cực đại (2.05 bàn/trận)",
        "Chelsea phải đá sân khách sau chuỗi trận mật độ dày đặc (4 ngày nghỉ)",
        "Chỉ số tình cảm truyền thông của Liverpool đạt mức xuất sắc (0.80)"
      ]
    }
  };

  const getMetadata = (id: string) => {
    return radarMetadata[id] || {
      changeLabel: "Độ tự tin ổn định giữ nguyên",
      isIncrease: true,
      reasons: [
        "Phong độ chung duy trì ổn định",
        "Không ghi nhận chấn thương nhân sự tác động nặng",
        "Tương hợp điểm Elo không xuất hiện biến cố đột biến"
      ]
    };
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto pb-24 p-4 text-left">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h2 className="text-base font-black tracking-tighter text-white uppercase">Radar Trận Đấu</h2>
          <p className="text-[11px] text-zinc-500 font-sans font-bold uppercase tracking-wider">Theo dõi & Giám sát dự liệu biến động</p>
        </div>
        <div className="flex -space-x-1.5 overflow-hidden">
          <span className="inline-block h-6 w-6 rounded-full ring-2 ring-black bg-zinc-800 flex items-center justify-center text-[9px] font-bold text-blue-400">
            {savedMatches.length}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-zinc-400 leading-relaxed font-medium mb-4">
        Lưu và giám sát các trận cầu tâm điểm của riêng bạn. Hệ thống tự động cảnh báo khi có sự thay đổi về tương quan ELO, tổn hại đội hình chấn thương, hoặc xu hướng thị trường trước giờ bóng lăn.
      </p>

      {/* Primary Saved Matches list */}
      <div className="space-y-4">
        {savedMatches.length > 0 ? (
          savedMatches.map((match) => {
            const meta = getMetadata(match.id);
            const isHomeFavoured = match.pHome > match.pAway;
            const favTeam = isHomeFavoured ? match.homeTeam.shortName : match.awayTeam.shortName;
            const prob = Math.round(Math.max(match.pHome, match.pAway) * 100);

            return (
              <div 
                key={match.id}
                className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-5 relative overflow-hidden transition-all hover:border-zinc-700"
              >
                {/* Visual badge top right */}
                <button 
                  onClick={() => onRemoveMatch(match.id)}
                  className="absolute top-4 right-4 text-amber-500 hover:text-zinc-500 transition-colors bg-zinc-950 p-2 rounded-xl border border-zinc-850"
                  title="Bỏ theo dõi"
                >
                  <Star size={13} fill="currentColor" />
                </button>

                {/* Match header information */}
                <div className="pr-8 mb-3.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-mono font-bold uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">
                      {match.league}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500">Giờ G: Hôm nay, {match.time}</span>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs font-extrabold text-zinc-100">{match.homeTeam.shortName}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">vs</span>
                    <span className="text-xs font-extrabold text-zinc-100">{match.awayTeam.shortName}</span>
                  </div>
                </div>

                {/* Prediction snapshot Grid */}
                <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 mb-3.5 text-xs">
                  <div>
                    <span className="text-[9.5px] font-mono text-zinc-500 block uppercase font-bold tracking-wide">Dự đoán hiện tại</span>
                    <span className="text-zinc-200 font-bold block mt-0.5">
                      {favTeam} Thắng
                    </span>
                    <span className="text-[10px] text-zinc-500 font-sans block">{prob}% · Lợi thế {match.confidence.toLowerCase()}</span>
                  </div>

                  <div className="border-l border-zinc-850 pl-3">
                    <span className="text-[9.5px] font-mono text-zinc-500 block uppercase font-bold tracking-wide">Biến động (24h)</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      {meta.isIncrease ? (
                        <ArrowUpRight size={13} className="text-emerald-400 shrink-0" />
                      ) : (
                        <ArrowDownRight size={13} className="text-rose-400 shrink-0" />
                      )}
                      <span className={`font-bold ${meta.isIncrease ? "text-emerald-400" : "text-rose-400"}`}>
                        {meta.isIncrease ? "Tăng thêm" : "Sụt giảm"}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block font-mono font-medium">{meta.changeLabel}</span>
                  </div>
                </div>

                {/* Main Reasons details */}
                <div className="space-y-2 text-xs bg-zinc-950/40 p-3.5 rounded-2xl border border-zinc-900 mb-4">
                  <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Lý do chính (Key Factors):</span>
                  <div className="space-y-1.5 pl-1.5 text-[10.5px] text-zinc-300 font-medium">
                    {meta.reasons.map((reason, index) => (
                      <div key={index} className="flex gap-2 items-start leading-relaxed text-zinc-400">
                        <span className="text-blue-500 mt-0.5 shrink-0 font-bold">•</span>
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action panel triggers */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => onSelectMatch(match)}
                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:text-white text-zinc-300 text-[10px] font-mono font-black py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                  >
                    Xem Chi Tiết <ChevronRight size={11} className="text-blue-400" />
                  </button>

                  <button 
                    onClick={() => onAskAI(`Giải thích chi tiết vì sao dự đoán trận ${match.homeTeam.shortName} vs ${match.awayTeam.shortName} ngày hôm nay lại biến động?`)}
                    className="bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-[10px] font-mono font-black py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1 uppercase tracking-wider"
                  >
                    <MessageSquare size={11} className="text-blue-400" /> Hỏi Trợ Lý AI
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-zinc-500 bg-zinc-900/40 border border-zinc-900 rounded-3xl backdrop-blur-sm">
            <Bell size={24} className="mx-auto text-zinc-650 mb-2.5 animate-bounce" />
            <p className="text-xs font-bold text-zinc-400 uppercase">Radar trống</p>
            <p className="text-[10px] text-zinc-500 mt-1">Sử dụng nút sao (Star) trong tab Lịch Đấu hoặc chi tiết trận đấu để đưa vào Radar Watchlist.</p>
          </div>
        )}
      </div>

      {/* Suggested Matches to track section */}
      {savedMatches.length < allMatches.length && (
        <div className="mt-6 space-y-3">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Gợi ý theo dõi thêm:</span>
          
          <div className="space-y-2">
            {allMatches
              .filter(m => !savedMatches.some(s => s.id === m.id))
              .slice(0, 2)
              .map(match => (
                <div 
                  key={match.id}
                  className="bg-zinc-905 border border-zinc-900 px-4 py-3 rounded-2xl flex justify-between items-center hover:border-zinc-800 transition-all cursor-pointer"
                  onClick={() => onSelectMatch(match)}
                >
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase">{match.league}</span>
                    <span className="text-xs font-bold text-zinc-200">{match.homeTeam.shortName} vs {match.awayTeam.shortName}</span>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddMatch(match.id);
                    }}
                    className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/30 text-blue-400 px-3 py-1.5 rounded-xl text-[9px] font-sans font-bold uppercase transition-all flex items-center gap-1"
                  >
                    <Star size={10} className="text-blue-400" /> Theo dõi
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

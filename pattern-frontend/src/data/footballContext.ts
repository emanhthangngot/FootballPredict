/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PlayerAvailability {
  name: string;
  reason: string; // "Chấn thương" | "Treo giò" | "Bỏ ngỏ" | "Mới trở lại"
  impact: "Cao" | "Rất cao" | "Trung bình" | "Thấp";
  impactScore: number; // 1-10 scale
}

export interface TeamAvailabilityData {
  unavailable: PlayerAvailability[];
  doubtful: PlayerAvailability[];
  returned: PlayerAvailability[];
  impactScore: number; // 1-100 indicating loss severity
  impactLevel: "Nghiêm trọng (High)" | "Trung bình (Medium)" | "Nhẹ (Low)" | "Không đáng kể";
  squadNote: string;
}

export interface FormStats {
  winRate: number;
  drawRate: number;
  lossRate: number;
  avgScored: number;
  avgConceded: number;
  cleanSheets: number; // %
}

export interface TeamFormSplit {
  overall20: FormStats;
  homeOrAway20: FormStats; // home stats for Home team, away stats for Away team
  league20: FormStats;
}

export interface CompetitionContext {
  type: string; // "Domestic League" | "Domestic Cup" | "European Cup" | "Friendly"
  isKnockout: boolean;
  isGroupStage: boolean;
  isTwoLeggedTie: boolean;
  isSecondLeg: boolean;
  aggregateScore?: string;
  isNeutralVenue: boolean;
  rotationRiskScore: "Thấp" | "Trung bình" | "Cao";
  motivationScore: "Thấp" | "Trung bình" | "Cao" | "Rất cao";
}

export interface TeamImportance {
  level: "Rất cao" | "Cao" | "Trung bình" | "Thấp";
  reason: string;
}

export interface MatchImportance {
  home: TeamImportance;
  away: TeamImportance;
}

export interface GoalOutlook {
  outlookLabel: string; // e.g. "Tiềm năng bùng nổ bàn thắng" | "Trận cầu chặt chẽ, ít bàn thắng"
  outlookLevel: "Thấp" | "Trung bình" | "Cao" | "Rất cao";
  reasons: string[];
}

export interface MatchFootballContext {
  playerAvailability: {
    home: TeamAvailabilityData;
    away: TeamAvailabilityData;
  };
  formSplit: {
    home: TeamFormSplit;
    away: TeamFormSplit;
  };
  competition: CompetitionContext;
  importance: MatchImportance;
  goalOutlook: GoalOutlook;
}

// Pre-seeded analytical contextual database matching matches
export const matchFootballContextMap: Record<string, MatchFootballContext> = {
  mancity_arsenal: {
    playerAvailability: {
      home: {
        unavailable: [
          { name: "Kevin De Bruyne", reason: "Chấn thương đùi", impact: "Cao", impactScore: 8.5 },
          { name: "Rodri", reason: "Treo giò (Thẻ đỏ)", impact: "Rất cao", impactScore: 9.8 }
        ],
        doubtful: [
          { name: "Phil Foden", reason: "Quá tải cơ đùi", impact: "Trung bình", impactScore: 7.2 }
        ],
        returned: [
          { name: "John Stones", reason: "Bình phục chấn thương cơ", impact: "Trung bình", impactScore: 6.8 }
        ],
        impactScore: 72,
        impactLevel: "Trung bình (Medium)",
        squadNote: "Tuyến giữa Man City sụt giảm nghiêm trọng quyền kiểm soát bóng khi thiếu vắng Rodri và nhạc trưởng De Bruyne."
      },
      away: {
        unavailable: [
          { name: "Martin Ødegaard", reason: "Chấn thương cổ chân", impact: "Rất cao", impactScore: 9.2 }
        ],
        doubtful: [
          { name: "Bukayo Saka", reason: "Căng cơ sau loạt trận quốc tế", impact: "Cao", impactScore: 8.8 }
        ],
        returned: [
          { name: "Jurrien Timber", reason: "Bình phục thể lực", impact: "Thấp", impactScore: 4.5 }
        ],
        impactScore: 68,
        impactLevel: "Nghiêm trọng (High)",
        squadNote: "Arsenal có thể thiếu vắng 2 nhân sự tấn công quan trọng nhất, gây rủi ro lớn cho khâu chuyển đổi trạng thái."
      }
    },
    formSplit: {
      home: {
        overall20: { winRate: 70, drawRate: 20, lossRate: 10, avgScored: 2.3, avgConceded: 0.9, cleanSheets: 45 },
        homeOrAway20: { winRate: 85, drawRate: 10, lossRate: 5, avgScored: 2.7, avgConceded: 0.7, cleanSheets: 55 },
        league20: { winRate: 75, drawRate: 20, lossRate: 5, avgScored: 2.4, avgConceded: 0.8, cleanSheets: 50 }
      },
      away: {
        overall20: { winRate: 65, drawRate: 20, lossRate: 15, avgScored: 1.9, avgConceded: 1.0, cleanSheets: 40 },
        homeOrAway20: { winRate: 55, drawRate: 25, lossRate: 20, avgScored: 1.8, avgConceded: 1.1, cleanSheets: 35 },
        league20: { winRate: 70, drawRate: 15, lossRate: 15, avgScored: 2.0, avgConceded: 0.9, cleanSheets: 45 }
      }
    },
    competition: {
      type: "Ngoại Hạng Anh (League)",
      isKnockout: false,
      isGroupStage: false,
      isTwoLeggedTie: false,
      isSecondLeg: false,
      isNeutralVenue: false,
      rotationRiskScore: "Thấp",
      motivationScore: "Cao"
    },
    importance: {
      home: {
        level: "Rất cao",
        reason: "Cuộc chiến vương quyền trực tiếp với Arsenal để bảo vệ ngôi vương, lợi thế sân nhà buộc phải thắng."
      },
      away: {
        level: "Rất cao",
        reason: "Tìm kiếm điểm số quyết định trên sân đại kình địch để duy trì khoảng cách trong cuộc đua vô địch."
      }
    },
    goalOutlook: {
      outlookLabel: "Tiềm năng bùng nổ bàn thắng trung bình",
      outlookLevel: "Trung bình",
      reasons: [
        "Cả hai đội đều sở hữu xG trung bình trên 1.8 bàn mỗi trận.",
        "Arsenal thiếu vắng cặp tiền vệ kiến thiết cốt lõi có thể gia tăng sai số phòng ngự.",
        "Man City trên sân Etihad ghi trung bình 2.7 bàn thắng/trận nhưng thiếu Rodri dọn dẹp từ xa."
      ]
    }
  },
  chelsea_wolves: {
    playerAvailability: {
      home: {
        unavailable: [
          { name: "Reece James", reason: "Chấn thương gân kheo", impact: "Trung bình", impactScore: 6.5 }
        ],
        doubtful: [],
        returned: [],
        impactScore: 25,
        impactLevel: "Nhẹ (Low)",
        squadNote: "Chelsea có lực lượng gần như đầy đủ nhất, chiều sâu đội hình dồi dào."
      },
      away: {
        unavailable: [
          { name: "Hwang Hee-chan", reason: "Chấn thương dây chằng", impact: "Cao", impactScore: 8.0 }
        ],
        doubtful: [
          { name: "Matheus Cunha", reason: "Đau gót achilles", impact: "Cao", impactScore: 7.8 }
        ],
        returned: [],
        impactScore: 62,
        impactLevel: "Nghiêm trọng (High)",
        squadNote: "Wolves mất cặp song sát quan trọng nhất trên hàng công, ảnh hưởng lớn đến tỷ lệ chuyển hóa cơ hội."
      }
    },
    formSplit: {
      home: {
        overall20: { winRate: 50, drawRate: 25, lossRate: 25, avgScored: 1.7, avgConceded: 1.3, cleanSheets: 30 },
        homeOrAway20: { winRate: 60, drawRate: 20, lossRate: 20, avgScored: 2.0, avgConceded: 1.1, cleanSheets: 40 },
        league20: { winRate: 48, drawRate: 26, lossRate: 26, avgScored: 1.6, avgConceded: 1.4, cleanSheets: 28 }
      },
      away: {
        overall20: { winRate: 30, drawRate: 20, lossRate: 50, avgScored: 1.1, avgConceded: 1.8, cleanSheets: 15 },
        homeOrAway20: { winRate: 20, drawRate: 20, lossRate: 60, avgScored: 0.9, avgConceded: 2.1, cleanSheets: 10 },
        league20: { winRate: 28, drawRate: 22, lossRate: 50, avgScored: 1.0, avgConceded: 1.9, cleanSheets: 15 }
      }
    },
    competition: {
      type: "Ngoại Hạng Anh (League)",
      isKnockout: false,
      isGroupStage: false,
      isTwoLeggedTie: false,
      isSecondLeg: false,
      isNeutralVenue: false,
      rotationRiskScore: "Thấp",
      motivationScore: "Trung bình"
    },
    importance: {
      home: {
        level: "Cao",
        reason: "Cố gắng bứt tốc vào nhóm tranh vé dự Europa League sau chuỗi trận khởi đầu chệch choạc."
      },
      away: {
        level: "Rất cao",
        reason: "Sát cánh bên rìa vực thẳm rớt hạng, mỗi điểm số lúc này đều mang tính sống còn."
      }
    },
    goalOutlook: {
      outlookLabel: "Trận đấu chặt chẽ, tối thiểu bàn thắng",
      outlookLevel: "Thấp",
      reasons: [
        "Hàng công Wolves sứt mẻ lực lượng nặng nề sẽ chủ động chơi lùi sâu phòng thủ đổ bê tông.",
        "Chelsea gặp khó trước các đối thủ chơi khối đội hình thấp chịu trận."
      ]
    }
  },
  realmadrid_barcelona: {
    playerAvailability: {
      home: {
        unavailable: [
          { name: "David Alaba", reason: "Chấn thương đầu gối dài hạn", impact: "Trung bình", impactScore: 6.0 }
        ],
        doubtful: [],
        returned: [
          { name: "Jude Bellingham", reason: "Hồi phục vết đau vai", impact: "Cao", impactScore: 9.0 }
        ],
        impactScore: 18,
        impactLevel: "Nhẹ (Low)",
        squadNote: "Real có điểm tựa vững chắc khi Bellingham và Vinicius Jr sung mãn thể lực cao độ nhất."
      },
      away: {
        unavailable: [
          { name: "Gavi", reason: "Treo giò tích lũy thẻ phạt", impact: "Cao", impactScore: 8.2 },
          { name: "Frenkie de Jong", reason: "Chấn thương cơ khép", impact: "Cao", impactScore: 8.5 }
        ],
        doubtful: [],
        returned: [],
        impactScore: 58,
        impactLevel: "Trung bình (Medium)",
        squadNote: "Khu trung tuyến Barca thiếu chất thép và tính kiểm soát mượt mà từ bộ đôi tiền vệ thủ lĩnh."
      }
    },
    formSplit: {
      home: {
        overall20: { winRate: 75, drawRate: 15, lossRate: 10, avgScored: 2.5, avgConceded: 0.9, cleanSheets: 50 },
        homeOrAway20: { winRate: 88, drawRate: 8, lossRate: 4, avgScored: 2.9, avgConceded: 0.6, cleanSheets: 60 },
        league20: { winRate: 78, drawRate: 14, lossRate: 8, avgScored: 2.6, avgConceded: 0.8, cleanSheets: 55 }
      },
      away: {
        overall20: { winRate: 70, drawRate: 15, lossRate: 15, avgScored: 2.2, avgConceded: 1.1, cleanSheets: 40 },
        homeOrAway20: { winRate: 65, drawRate: 15, lossRate: 20, avgScored: 2.1, avgConceded: 1.2, cleanSheets: 30 },
        league20: { winRate: 72, drawRate: 12, lossRate: 16, avgScored: 2.3, avgConceded: 1.0, cleanSheets: 42 }
      }
    },
    competition: {
      type: "La Liga (Siêu Kinh Điển)",
      isKnockout: false,
      isGroupStage: false,
      isTwoLeggedTie: false,
      isSecondLeg: false,
      isNeutralVenue: false,
      rotationRiskScore: "Thấp",
      motivationScore: "Rất cao"
    },
    importance: {
      home: {
        level: "Rất cao",
        reason: "Trận Siêu kinh điển danh giá, chiến thắng sẽ dập tắt hoàn toàn hy vọng bám đuổi của đối thủ truyền kiếp."
      },
      away: {
        level: "Rất cao",
        reason: "Trận đấu buộc phải thắng nếu muốn giữ hy vọng mong manh lật đổ Real Madrid trên bảng xếp hạng."
      }
    },
    goalOutlook: {
      outlookLabel: "Bùng nổ tấn công rực lửa",
      outlookLevel: "Rất cao",
      reasons: [
        "Hai hàng công ghi tổng cộng trung bình hơn 5.0 bàn mỗi trận đấu.",
        "Trận Siêu Kinh Điển không bao giờ thiếu đi triết lý bóng đá duy mỹ tiến công."
      ]
    }
  }
};

// Global fallback generator to guarantee robust data rendering for other matches
export function getFootballContextForMatch(matchId: string): MatchFootballContext {
  if (matchFootballContextMap[matchId]) {
    return matchFootballContextMap[matchId];
  }

  // Generative semantic fallback
  return {
    playerAvailability: {
      home: {
        unavailable: [
          { name: "Trung vệ trụ cột", reason: "Chấn thương cơ đùi", impact: "Trung bình", impactScore: 6.5 }
        ],
        doubtful: [],
        returned: [],
        impactScore: 24,
        impactLevel: "Nhẹ (Low)",
        squadNote: "Đội chủ nhà có một sự vắng mặt nhỏ nơi hàng thủ."
      },
      away: {
        unavailable: [
          { name: "Tiền đạo trung tâm", reason: "Tích lũy đủ thẻ vàng", impact: "Cao", impactScore: 7.5 }
        ],
        doubtful: [],
        returned: [],
        impactScore: 40,
        impactLevel: "Trung bình (Medium)",
        squadNote: "Đội khách vắng mặt cầu thủ săn bàn chính, đòi hỏi chiến thuật xoay tua linh hoạt."
      }
    },
    formSplit: {
      home: {
        overall20: { winRate: 55, drawRate: 25, lossRate: 20, avgScored: 1.6, avgConceded: 1.1, cleanSheets: 35 },
        homeOrAway20: { winRate: 65, drawRate: 20, lossRate: 15, avgScored: 1.9, avgConceded: 0.9, cleanSheets: 45 },
        league20: { winRate: 50, drawRate: 30, lossRate: 20, avgScored: 1.5, avgConceded: 1.2, cleanSheets: 30 }
      },
      away: {
        overall20: { winRate: 45, drawRate: 30, lossRate: 25, avgScored: 1.3, avgConceded: 1.2, cleanSheets: 30 },
        homeOrAway20: { winRate: 35, drawRate: 35, lossRate: 30, avgScored: 1.1, avgConceded: 1.4, cleanSheets: 25 },
        league20: { winRate: 40, drawRate: 30, lossRate: 30, avgScored: 1.2, avgConceded: 1.3, cleanSheets: 28 }
      }
    },
    competition: {
      type: "Champions League (Châu Âu)",
      isKnockout: true,
      isGroupStage: false,
      isTwoLeggedTie: true,
      isSecondLeg: true,
      aggregateScore: "2 - 1",
      isNeutralVenue: false,
      rotationRiskScore: "Trung bình",
      motivationScore: "Cao"
    },
    importance: {
      home: {
        level: "Cao",
        reason: "Lợi thế dẫn trước lượt đi đòi hỏi tính toán tối mật để bảo vệ tỷ số an toàn."
      },
      away: {
        level: "Rất cao",
        reason: "Tình thế lội ngược dòng yêu cầu đội khách dâng cao đội hình tấn công toàn diện."
      }
    },
    goalOutlook: {
      outlookLabel: "Cân bằng chiến thuật giằng co",
      outlookLevel: "Trung bình",
      reasons: [
        "Tính chất lượt về loại trực tiếp khiến hai đội triển khai thận trọng ban đầu.",
        "Thiếu vắng trung phong đội khách ảnh hưởng hiệu suất chuyển hóa của đội cửa dưới."
      ]
    }
  };
}

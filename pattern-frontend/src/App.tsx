/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { matches, predictionsFeed, teams } from "./data";
import { Match } from "./types";
import { TeamLogo } from "./components/TeamLogos";
import { UpcomingFixtures } from "./components/UpcomingFixtures";
import { LatestPredictions } from "./components/LatestPredictions";
import { MatchDetail } from "./components/MatchDetail";
import { MatchRadar } from "./components/MatchRadar";
import { AIAnalyst } from "./components/AIAnalyst";
import { AdminLab } from "./components/AdminLab";

// Icon imports
import {
  Menu,
  User,
  Home,
  Calendar,
  Sparkles,
  ShieldAlert,
  Search,
  ChevronRight,
  TrendingUp,
  Activity,
  Plus,
  Signal,
  Wifi,
  Battery,
  Star,
  Zap,
  Lock,
  LogOut,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  ShieldCheck
} from "lucide-react";

interface UserProfile {
  email: string;
  role: "user" | "admin";
  displayName: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<"home" | "fixtures" | "radar" | "ai-analyst">("home");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("All");

  // Login form inputs
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // User personal Watchlist state
  const [savedMatchIds, setSavedMatchIds] = useState<string[]>(["mancity_arsenal", "realmadrid_barcelona"]);

  const handleToggleSave = (id: string) => {
    if (savedMatchIds.includes(id)) {
      setSavedMatchIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSavedMatchIds((prev) => [...prev, id]);
    }
  };

  useEffect(() => {
    // Clock helper for high-fidelity phone status bar
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours().toString().padStart(2, "0");
      let minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter fixtures list
  const filteredMatches = matches.filter((match) => {
    const matchesQuery = 
      match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.league.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLeague = leagueFilter === "All" || match.league === leagueFilter;

    return matchesQuery && matchesLeague;
  });

  // Action helper when user requests on-site prompt chat redirection
  const handleAskAnalystTransition = (promptText: string) => {
    setIsAdminMode(false);
    setCurrentTab("ai-analyst");
    setSelectedMatch(null);
    // Wait for view transition
    setTimeout(() => {
      const inputEl = document.querySelector('input[placeholder*="Hỏi"]') as HTMLInputElement;
      if (inputEl) {
        inputEl.value = promptText;
        const btn = inputEl.nextElementSibling as HTMLButtonElement;
        if (btn) btn.click();
      }
    }, 150);
  };

  // Custom Authentication handler
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError("");

    if (!emailInput.trim() || !passwordInput.trim()) {
      setLoginError("Vui lòng điền đầy đủ Email và Mật khẩu.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const emailLower = emailInput.trim().toLowerCase();
      const pwd = passwordInput.trim();

      if (emailLower === "admin@gridiron.com" && pwd === "admin123") {
        setCurrentUser({
          email: "admin@gridiron.com",
          role: "admin",
          displayName: "Gridiron Admin"
        });
        setIsAdminMode(true); // Default admins to Model Lab
        setLoginError("");
        setEmailInput("");
        setPasswordInput("");
      } else if (emailLower === "user@gridiron.com" && pwd === "user123") {
        setCurrentUser({
          email: "user@gridiron.com",
          role: "user",
          displayName: "Standard Fan"
        });
        setIsAdminMode(false); // Users are strictly locked in normal app
        setLoginError("");
        setEmailInput("");
        setPasswordInput("");
      } else {
        setLoginError("Tài khoản hoặc mật khẩu không đúng. Vui lòng thử lại!");
      }
      setIsLoading(false);
    }, 500);
  };

  // Fast shortcut logins to help user test both accounts smoothly
  const handleQuickLogin = (role: "user" | "admin") => {
    setLoginError("");
    if (role === "admin") {
      setEmailInput("admin@gridiron.com");
      setPasswordInput("admin123");
    } else {
      setEmailInput("user@gridiron.com");
      setPasswordInput("user123");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdminMode(false);
    setSelectedMatch(null);
    setCurrentTab("home");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex justify-center items-center py-6 px-4 font-sans select-none overflow-x-hidden relative">
      {/* BACKGROUND GLOW DECORATIONS (BENTO BLUR ACCENTS) */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-blue-600 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-rose-600 rounded-full blur-[140px]" />
      </div>

      {/* HIGH FIDELITY SMARTPHONE SHELL BENTO LAYOUT */}
      <div className="relative w-full max-w-[415px] h-[860px] bg-black rounded-[60px] border-[12px] border-zinc-900 shadow-2xl overflow-hidden flex flex-col focus-within:ring-2 focus-within:ring-blue-500/30 transition-shadow">
        
        {/* PHYSICAL SENSORS: Dynamic Island Notch decoration */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[110px] h-[24px] bg-zinc-900 rounded-full z-[100] flex justify-around items-center px-4 border border-zinc-800 shadow-inner">
          <div className="w-[8px] h-[8px] bg-zinc-950 rounded-full border border-zinc-800 shadow-inner" />
          <div className="w-[5px] h-[5px] bg-zinc-950 rounded-full shadow-[0_0_2px_#3b82f6]" />
        </div>

        {/* PHONE EMBEDDED REALTIME STATUS BAR */}
        <div className="bg-black h-11 pt-3.5 px-7 flex justify-between items-center text-[10px] text-zinc-400 font-mono font-bold z-[80] select-none">
          <span>{currentTime || "22:18"}</span>
          <div className="flex items-center gap-1.5">
            <Signal size={12} className="text-zinc-400" />
            <Wifi size={12} className="text-zinc-400" />
            <Battery size={13} className="text-blue-500" />
          </div>
        </div>

        {/* INNER SCREEN CONTAINER CONTAINER */}
        <div className="flex-1 overflow-y-auto bg-zinc-950 flex flex-col relative scrollbar-none">
          
          {currentUser === null ? (
            /* ==================== SCREEN 1: PORTAL LOGIN VIEW ==================== */
            <div className="flex-1 flex flex-col justify-between px-6 py-8 relative overflow-y-auto scrollbar-none text-left">
              <div className="space-y-6 pt-6">
                <div className="text-center space-y-1">
                  <span className="text-blue-500 font-mono text-[9px] font-bold tracking-widest uppercase block animate-pulse">
                    GRIDIRON COGNITIVE ENGINE
                  </span>
                  <h2 className="text-2xl font-black tracking-tighter text-white uppercase">ĐĂNG NHẬP</h2>
                  <p className="text-[11px] text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
                    Truy cập hệ thống dự đoán và giám sát chỉ số bóng đá Bayesian v3.
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-mono font-black uppercase tracking-wider text-zinc-400 block pl-1">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl pl-10 pr-4 py-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9.5px] font-mono font-black uppercase tracking-wider text-zinc-400 block">
                        Mật khẩu bảo mật
                      </label>
                    </div>
                    <div className="relative">
                      <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl pl-10 pr-11 py-3 text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-[10.5px] text-rose-400 leading-relaxed font-semibold">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 disabled:opacity-50 text-white font-sans font-extrabold uppercase py-3 px-4 rounded-2xl transition-all shadow-md shadow-blue-500/15 flex items-center justify-center gap-2 mt-2 text-xs"
                  >
                    {isLoading ? "Đang xác thực..." : "Đăng Nhập"}
                  </button>
                </form>

                {/* Account role shortcut selection card for tests */}
                <div className="bg-zinc-900 border border-zinc-850 rounded-3xl p-4.5 space-y-3">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block pl-0.5">
                    Tài khoản demo kiểm thử (Quick-Login):
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("user")}
                      className={`p-3 rounded-2xl border transition-all text-left space-y-1.5 cursor-pointer ${
                        emailInput === "user@gridiron.com"
                          ? "bg-blue-500/10 border-blue-500/40"
                          : "bg-zinc-950 border-zinc-850 hover:border-zinc-750"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <UserCheck size={12} className="text-zinc-400" />
                        <span className="text-[10.5px] font-extrabold text-zinc-100 uppercase">Khán Giả</span>
                      </div>
                      <div className="text-[9.5px] font-mono text-zinc-500 space-y-0.5 leading-none">
                        <div>User Account</div>
                        <div className="truncate text-zinc-400">user@gridiron.com</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin("admin")}
                      className={`p-3 rounded-2xl border transition-all text-left space-y-1.5 cursor-pointer ${
                        emailInput === "admin@gridiron.com"
                          ? "bg-amber-500/10 border-amber-500/40"
                          : "bg-zinc-950 border-zinc-850 hover:border-zinc-750"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-amber-500" />
                        <span className="text-[10.5px] font-extrabold text-zinc-100 uppercase">Quản Trị</span>
                      </div>
                      <div className="text-[9.5px] font-mono text-zinc-500 space-y-0.5 leading-none">
                        <div>Admin MLOps</div>
                        <div className="truncate text-amber-500">admin@gridiron.com</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-zinc-900">
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                  Gridiron Systems © 2026. All rights secured.
                </span>
              </div>
            </div>
          ) : (
            /* ==================== SCREEN 2: AUTHENTICATED SYSTEM VIEW ==================== */
            <div className="flex-1 flex flex-col">
              
              {/* SCREEN CONDITIONAL HEADER VIEW */}
              {!selectedMatch ? (
                <div className="bg-zinc-950/95 backdrop-blur-md pb-4 sticky top-0 z-50 border-b border-zinc-900 space-y-3.5">
                  <div className="px-6 pt-4 flex justify-between items-center">
                    {currentUser.role === "admin" ? (
                      <button
                        onClick={() => setIsAdminMode(!isAdminMode)}
                        className={`p-2 rounded-xl border transition-all active:scale-95 ${
                          isAdminMode 
                            ? "bg-amber-950/40 text-amber-500 border-amber-900/40" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                        title="Chuyển đổi giao diện"
                      >
                        <Menu size={16} />
                      </button>
                    ) : (
                      <span className="text-zinc-650 font-mono text-[9px] font-bold border border-zinc-900 px-2 py-1 rounded-xl">
                        🔒 FAN ZONE
                      </span>
                    )}
                    
                    <div className="flex flex-col items-center">
                      <span className="text-zinc-500 text-[9px] font-bold tracking-widest uppercase">Gridiron Platform</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <h1 className="text-base font-black tracking-tighter text-white uppercase">
                          {isAdminMode ? "MLOPS LAB" : "ANALYTICS HUB"}
                        </h1>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-ping" />
                      </div>
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="h-9 w-9 rounded-full bg-zinc-900 border border-zinc-800 hover:border-red-500/30 text-zinc-400 hover:text-red-400 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                      title="Đăng xuất / Logout"
                    >
                      <LogOut size={14} />
                    </button>
                  </div>

                  {/* DUAL MODE ACCORDION SWITCH - ONLY visible to logged-in administrator accounts! */}
                  {currentUser.role === "admin" && (
                    <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 p-1 rounded-2xl mx-5">
                      <button
                        onClick={() => setIsAdminMode(false)}
                        className={`flex-1 text-[10px] font-sans font-bold uppercase transition-all py-1.5 rounded-xl text-center cursor-pointer ${
                          !isAdminMode 
                            ? "bg-blue-600 text-white shadow font-extrabold"
                            : "text-zinc-500 hover:text-zinc-350"
                        }`}
                      >
                        User App
                      </button>
                      <button
                        onClick={() => setIsAdminMode(true)}
                        className={`flex-1 text-[10px] font-sans font-bold uppercase transition-all py-1.5 rounded-xl text-center cursor-pointer ${
                          isAdminMode 
                            ? "bg-amber-600/90 text-white shadow font-extrabold"
                            : "text-zinc-500 hover:text-zinc-350"
                        }`}
                      >
                        Admin / Model Lab
                      </button>
                    </div>
                  )}

                  {/* Standard fan segment profile banner header for regular user accounts! */}
                  {currentUser.role === "user" && (
                    <div className="mx-5 bg-zinc-900/60 border border-zinc-900 p-2.5 rounded-2xl flex items-center justify-between text-xs text-left">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded bg-blue-500/10 flex items-center justify-center font-mono text-[10px] text-blue-400 font-bold">
                          U
                        </div>
                        <span className="text-[11px] font-semibold text-zinc-300">Tài khoản: <strong className="text-zinc-100">{currentUser.displayName}</strong></span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 font-bold">Lốc: {currentUser.email}</span>
                    </div>
                  )}
                </div>
              ) : null}

              {/* SECONDARY SCREEN SWAPPING LOGIC */}
              {selectedMatch ? (
                <MatchDetail 
                  match={selectedMatch} 
                  onBack={() => setSelectedMatch(null)}
                  onAskAnalyst={handleAskAnalystTransition}
                  isSaved={savedMatchIds.includes(selectedMatch.id)}
                  onToggleSave={() => handleToggleSave(selectedMatch.id)}
                />
              ) : isAdminMode && currentUser.role === "admin" ? (
                /* ==================== ADMIN / MODEL LAB WORKSPACE ==================== */
                <AdminLab />
              ) : (
                /* ==================== USER APP CHANNELS ==================== */
                <div className="flex-1 flex flex-col">
                  
                  {/* TAB 1: TRANG CHỦ (HOME DASHBOARD VIEW) */}
                  {currentTab === "home" && (
                    <div className="p-4 space-y-4 flex-1">
                      
                      {/* IN-DEPTH ANALYSIS CARD (PHÂN TÍCH CHUYÊN SÂU HERO BENTO STYLE) */}
                      <div 
                        onClick={() => {
                          const spotlight = matches.find(m => m.id === "mancity_arsenal");
                          if (spotlight) setSelectedMatch(spotlight);
                        }}
                        className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-zinc-750 rounded-3xl p-5 cursor-pointer relative overflow-hidden group transition-all duration-300 shadow-lg text-left"
                      >
                        {/* Glowing mesh background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                        
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-blue-600 text-white text-[9px] px-2.5 py-1 rounded-full font-bold animate-pulse tracking-wider uppercase">
                            TÂM ĐIỂM TUẦN
                          </span>
                          <span className="text-zinc-500 text-[10px] font-sans font-bold uppercase tracking-wider not-italic">
                            DỰ BÁO CHỦ CHỐT
                          </span>
                        </div>

                        <h2 className="text-base font-black tracking-tighter text-white leading-tight mt-1 group-hover:text-blue-400 transition-colors uppercase">
                          Man City vs Arsenal
                        </h2>
                        
                        <p className="text-[11px] text-zinc-400 mt-1.5 mb-4 leading-relaxed font-sans font-medium">
                          Cuộc đối đầu vĩ mô kịch tính được mổ xẻ thông qua dữ liệu đối đầu lịch sử, tương quan thể lực, sức mạnh tấn công & chấn thương lực lượng mới nhất.
                        </p>

                        <div className="flex items-center gap-1.5 text-[9.5px] font-sans font-bold text-zinc-300 bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 w-fit uppercase tracking-wide">
                          <TrendingUp size={11} className="text-blue-400" /> Dự báo: Man City giành quyền kiểm soát (45%)
                        </div>
                      </div>

                      {/* UPCOMING SLIDER CAROUSEL SECTION */}
                      <UpcomingFixtures 
                        fixtures={matches} 
                        onSelectMatch={(match) => setSelectedMatch(match)} blockTitle="Lịch thi đấu trực tiếp"
                      />

                      {/* FEED LATEST PREDICTIONS SECTION */}
                      <LatestPredictions 
                        predictions={predictionsFeed} 
                        onSelectPrediction={(matchId) => {
                          const matchItem = matches.find(m => m.id === matchId);
                          if (matchItem) setSelectedMatch(matchItem);
                        }} 
                      />
                    </div>
                  )}

                  {/* TAB 2: LỊCH THI ĐẤU (FIXTURES EXPLORER GRID) */}
                  {currentTab === "fixtures" && (
                    <div className="p-4 flex-1 space-y-4">
                      <div className="text-left">
                        <h2 className="text-base font-black tracking-tighter text-white uppercase">Lịch thi đấu & Nhận định</h2>
                        <p className="text-[11px] text-zinc-450 font-medium font-mono uppercase tracking-wider">Toàn bộ trận đấu phân loại theo giải và độ tin tưởng</p>
                      </div>

                      {/* Search and Filters box */}
                      <div className="space-y-3.5">
                        <div className="relative">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm đội tuyển hoặc giải đấu..."
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-10 pr-4 py-3 text-xs text-zinc-200 placeholder-zinc-550 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                          {["All", "Premier League", "La Liga", "Champions League"].map((lg) => (
                            <button
                              key={lg}
                              onClick={() => setLeagueFilter(lg)}
                              className={`text-[9px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all border shrink-0 ${
                                leagueFilter === lg
                                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/10"
                                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                              }`}
                            >
                              {lg === "All" ? "TẤT CẢ" : lg}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fixtures Feed list */}
                      <div className="space-y-3">
                        {filteredMatches.length > 0 ? (
                          filteredMatches.map((match) => {
                            const isHomeFavoured = match.pHome > match.pAway;
                            const forecastOutcome = isHomeFavoured ? `${match.homeTeam.shortName} Thắng` : `${match.awayTeam.shortName} Thắng`;
                            const isSaved = savedMatchIds.includes(match.id);
                            
                            return (
                              <div
                                key={match.id}
                                onClick={() => setSelectedMatch(match)}
                                className="bg-zinc-900 border border-zinc-800 hover:border-blue-500/30 p-4 rounded-3xl cursor-pointer transition-all flex justify-between items-center group relative overflow-hidden"
                              >
                                <div className="space-y-2 w-8/12 text-left">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] font-mono font-bold uppercase text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                                      {match.league}
                                    </span>
                                    {match.confidence === "Cao" && (
                                      <span className="text-[8px] font-sans font-bold uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                        Tin cậy cao
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <TeamLogo id={match.homeTeam.id} size={18} />
                                    <span className="text-xs font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">{match.homeTeam.shortName}</span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <TeamLogo id={match.awayTeam.id} size={18} />
                                    <span className="text-xs font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">{match.awayTeam.shortName}</span>
                                  </div>
                                </div>

                                {/* Right predictive outputs compact without betting dominance */}
                                <div className="w-4/12 flex flex-col items-end text-right justify-between h-14">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleSave(match.id);
                                    }}
                                    className={`text-[10px] p-1.5 rounded-lg border transition-all ${
                                      isSaved 
                                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500" 
                                        : "bg-zinc-950 border-zinc-850 text-zinc-550 hover:text-zinc-300"
                                    }`}
                                  >
                                    <Star size={11} fill={isSaved ? "currentColor" : "none"} />
                                  </button>

                                  <span className="text-[9.5px] font-sans font-bold text-zinc-400 bg-zinc-950 border border-zinc-850 px-2 py-1 rounded-xl flex items-center gap-1 group-hover:border-zinc-700 transition-colors">
                                    Chi tiết <ChevronRight size={10} />
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-zinc-550 bg-zinc-900/40 border border-zinc-900 rounded-3xl">
                            Không tìm thấy trận đấu nào thỏa mãn bộ lọc.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: WATCHLIST RADAR */}
                  {currentTab === "radar" && (
                    <MatchRadar 
                      savedMatches={matches.filter(m => savedMatchIds.includes(m.id))}
                      onRemoveMatch={(id) => handleToggleSave(id)}
                      onSelectMatch={(match) => setSelectedMatch(match)}
                      onAskAI={handleAskAnalystTransition}
                      allMatches={matches}
                      onAddMatch={(id) => handleToggleSave(id)}
                    />
                  )}

                  {/* TAB 4: AI ANALYST (RAG CHATBOT) */}
                  {currentTab === "ai-analyst" && (
                    <AIAnalyst />
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* PHYSICAL FLOATING ACTION BUTTON */}
        {!selectedMatch && !isAdminMode && currentUser !== null && (
          <button
            onClick={() => handleAskAnalystTransition("Thời tiết và chấn thương Man City ảnh hưởng thế nào đến lợi thế ELO?")}
            className="absolute bottom-[92px] right-6 h-14 w-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center transition-all duration-200 shadow-xl shadow-blue-500/20 active:scale-95 border-2 border-zinc-950 hover:rotate-90 z-[95]"
            title="Hỏi AI nhanh"
          >
            <Plus size={24} strokeWidth={2.5} className="text-black animate-pulse" />
          </button>
        )}

        {/* HIGHLY COMPACT NATIVE PHONE SYSTEM BOTTOM TAB BAR */}
        {currentUser !== null && (
          <div className="bg-zinc-950 border-t border-zinc-900 h-[76px] pb-5 px-4 flex justify-around items-center text-zinc-400 z-[90] relative select-none">
            {isAdminMode ? (
              /* Special lock bar or return control when in Admin Mode to avoid multi-hierarchy tabs overflow */
              <div className="w-full flex justify-between items-center px-4">
                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-widest flex items-center gap-1.5 pl-2">
                  <Lock size={12} /> SECURED LAB SESSION
                </span>

                <button
                  onClick={() => setIsAdminMode(false)}
                  className="bg-amber-600/10 hover:bg-amber-600/20 text-amber-500 border border-amber-500/25 text-[10px] font-sans font-extrabold uppercase py-2 px-4 rounded-xl transition-all"
                >
                  Trở về User App
                </button>
              </div>
            ) : (
              <>
                {/* Active Navigation nodes for User App */}
                <button
                  onClick={() => {
                    setCurrentTab("home");
                    setSelectedMatch(null);
                  }}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    currentTab === "home" ? "text-blue-500 scale-105 font-bold" : "text-zinc-550 hover:text-zinc-350"
                  }`}
                >
                  <Home size={17} fill={currentTab === "home" ? "currentColor" : "none"} />
                  <span className="text-[9px] font-sans font-bold">Trang chủ</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("fixtures");
                    setSelectedMatch(null);
                  }}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    currentTab === "fixtures" ? "text-blue-500 scale-105 font-bold" : "text-zinc-550 hover:text-zinc-350"
                  }`}
                >
                  <Calendar size={17} />
                  <span className="text-[9px] font-sans font-bold">Lịch đấu</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("radar");
                    setSelectedMatch(null);
                  }}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    currentTab === "radar" ? "text-blue-500 scale-105 font-bold" : "text-zinc-550 hover:text-zinc-350"
                  }`}
                >
                  <Activity size={17} />
                  <span className="text-[9px] font-sans font-bold">Radar</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("ai-analyst");
                    setSelectedMatch(null);
                  }}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    currentTab === "ai-analyst" ? "text-blue-500 scale-105 font-bold" : "text-zinc-550 hover:text-zinc-350"
                  }`}
                >
                  <Sparkles size={17} />
                  <span className="text-[9px] font-sans font-bold">Trợ lý AI</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* iOS style home indicator bar */}
        <div className="absolute bottom-1 bg-zinc-850 w-1/3 h-1 rounded-full left-1/2 -translate-x-1/2 z-[100]" />
      </div>

      {/* Branding Outside the Frame */}
      <div className="absolute right-12 bottom-12 text-right hidden xl:block pointer-events-none select-none">
        <h2 className="text-3xl font-black tracking-tighter text-zinc-900 leading-none">GRIDIRON</h2>
        <h3 className="text-[10px] font-mono tracking-widest text-zinc-750 uppercase mt-1 font-black">Bayesian Predictive Engine</h3>
        <div className="mt-3 flex gap-2.5 justify-end">
          <div className="w-5 h-0.5 bg-blue-600"></div>
          <div className="w-5 h-0.5 bg-amber-500"></div>
          <div className="w-5 h-0.5 bg-zinc-800"></div>
        </div>
      </div>

    </div>
  );
}

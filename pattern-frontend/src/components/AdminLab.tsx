import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { runBacktestSimulation } from "../data";
import { 
  Terminal, 
  Settings, 
  Database, 
  Play, 
  Award, 
  AlertTriangle, 
  Cpu, 
  Layers, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  FileCode, 
  CheckCircle, 
  Server, 
  RefreshCw, 
  Clock, 
  Sliders 
} from "lucide-react";

export const AdminLab: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    "overview" | "performance" | "calibration" | "backtest" | "pipeline" | "features" | "registry" | "monitoring" | "settings"
  >("overview");

  // Mock Admin telemetry stats
  const [activeModel, setActiveModel] = useState("v3-production");
  const [edgeThreshold, setEdgeThreshold] = useState<number>(3); // 3%
  const [flatStake, setFlatStake] = useState<number>(50); // $50 default flat
  const [strategy, setStrategy] = useState<"Flat" | "Kelly">("Flat");
  const [triggerCount, setTriggerCount] = useState<number>(0);

  const simulation = useMemo(() => {
    return runBacktestSimulation(edgeThreshold / 100, flatStake, strategy);
  }, [edgeThreshold, flatStake, strategy, triggerCount]);

  const handleRunBacktest = () => {
    setTriggerCount((prev) => prev + 1);
  };

  // Performance stats
  const calibrationData = [
    { name: "0-20%", predictedHome: 0.10, observedHome: 0.08, predictedDraw: 0.12, observedDraw: 0.14, predictedAway: 0.08, observedAway: 0.06 },
    { name: "20-40%", predictedHome: 0.30, observedHome: 0.31, predictedDraw: 0.28, observedDraw: 0.26, predictedAway: 0.32, observedAway: 0.34 },
    { name: "40-60%", predictedHome: 0.50, observedHome: 0.52, predictedDraw: 0.48, observedDraw: 0.45, predictedAway: 0.52, observedAway: 0.54 },
    { name: "60-80%", predictedHome: 0.70, observedHome: 0.68, predictedDraw: 0.69, observedDraw: 0.71, predictedAway: 0.71, observedAway: 0.69 },
    { name: "80-100%", predictedHome: 0.90, observedHome: 0.92, predictedDraw: 0.88, observedDraw: 0.86, predictedAway: 0.91, observedAway: 0.93 }
  ];

  const historicalLossData = [
    { week: "W1", model: 0.645, market: 0.658 },
    { week: "W2", model: 0.632, market: 0.649 },
    { week: "W3", model: 0.621, market: 0.638 },
    { week: "W4", model: 0.615, market: 0.634 },
    { week: "W5", model: 0.612, market: 0.631 }
  ];

  const featureImportance = [
    { name: "Elo Difference", imp: 38 },
    { name: "EMA Form Diff (xG)", imp: 24 },
    { name: "Home Advantage", imp: 18 },
    { name: "Availability Impact", imp: 12 },
    { name: "Days Off Rest", imp: 8 }
  ];

  const dagStatuses = [
    { name: "sportsmonk_api_ingest", status: "success", time: "01:00 AM" },
    { name: "gold_aggregates_materialize", status: "success", time: "01:15 AM" },
    { name: "feast_feature_offline_sync", status: "success", time: "01:30 AM" },
    { name: "model_prediction_inference", status: "success", time: "02:00 AM" }
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto pb-24 p-4 text-left">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-black tracking-tighter text-amber-500 uppercase flex items-center gap-1.5">
            <Cpu size={16} /> ADMIN / MODEL LAB
          </h2>
          <p className="text-[11px] text-zinc-500 font-mono tracking-wider">WORKSPACE ĐIỀU HÀNH ENGINE & MLOPS CONTROL</p>
        </div>
        <span className="text-[8.5px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full uppercase font-black">
          v3-production
        </span>
      </div>

      {/* Admin sub-menu grids */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-900 rounded-3xl mb-4 border border-zinc-850">
        {[
          { id: "overview", label: "Tổng Quan" },
          { id: "performance", label: "Hiệu Suất" },
          { id: "calibration", label: "Calib" },
          { id: "backtest", label: "Simulate" },
          { id: "pipeline", label: "Pipelines" },
          { id: "features", label: "Feast" },
          { id: "registry", label: "MLflow" },
          { id: "monitoring", label: "Sức Khỏe" },
          { id: "settings", label: "Cài Đặt" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`py-1.5 rounded-xl text-[9px] font-sans font-bold uppercase transition-all whitespace-nowrap overflow-hidden text-center truncate ${
              activeAdminTab === tab.id
                ? "bg-amber-600 text-white shadow-inner font-extrabold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== 1. OVERVIEW TAB ==================== */}
      {activeAdminTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-3.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Trạng thái Production (Serving)</span>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 space-y-0.5">
                <span className="text-zinc-500 text-[9px] font-mono block">MODEL VERSION</span>
                <span className="text-zinc-100 font-bold block">v3-production (Bayesian DC)</span>
              </div>
              
              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 space-y-0.5">
                <span className="text-zinc-500 text-[9px] font-mono block">LAST RETRAINED</span>
                <span className="text-zinc-100 font-bold block">16 hours ago (Daily Cron)</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 space-y-0.5">
                <span className="text-zinc-500 text-[9px] font-mono block">API LATENCY</span>
                <span className="text-emerald-400 font-bold block">18ms (p95 percentile)</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-850 space-y-0.5">
                <span className="text-zinc-500 text-[9px] font-mono block">DRIFT STATUS</span>
                <span className="text-emerald-400 font-bold block">NO DRIFT DETECTED</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-2.5 text-xs text-left">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Active Ingestion Feeds</span>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                <span className="font-mono text-[10px] text-zinc-300">Sportsmonk API Source</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-black">Live</span>
              </div>

              <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                <span className="font-mono text-[10px] text-zinc-300">Market Odds Ingestor</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-black">Connected</span>
              </div>

              <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                <span className="font-mono text-[10px] text-zinc-300">Sentiment Scraper Node</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-black">Nominal</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 2. PERFORMANCE TAB ==================== */}
      {activeAdminTab === "performance" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-zinc-900 border border-zinc-850 p-3.5 rounded-2xl text-left">
              <span className="text-[8px] font-mono text-zinc-500 uppercase block font-black">LOG LOSS MODEL</span>
              <span className="text-base font-extrabold text-blue-400 block mt-0.5">0.612</span>
              <span className="text-[9px] text-emerald-400 font-bold">↓ 3.2% (Độ lệch tối thiểu)</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-3.5 rounded-2xl text-left">
              <span className="text-[8px] font-mono text-zinc-500 uppercase block font-black">ACCURACY (1X2)</span>
              <span className="text-base font-extrabold text-blue-400 block mt-0.5">54.2%</span>
              <span className="text-[9px] text-emerald-400 font-bold">↑ 1.4% (vs Sàn bình thường)</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-3.5 rounded-2xl text-left">
              <span className="text-[8px] font-mono text-zinc-500 uppercase block font-black">BRIER SCORE</span>
              <span className="text-base font-extrabold text-zinc-300 block mt-0.5">0.198</span>
              <span className="text-[9px] text-zinc-500">Sai số quân phương chuẩn</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-3.5 rounded-2xl text-left">
              <span className="text-[8px] font-mono text-zinc-500 uppercase block font-black">LOG LOSS MARKET</span>
              <span className="text-base font-extrabold text-zinc-400 block mt-0.5">0.631</span>
              <span className="text-[9px] text-blue-400 font-bold">Biên độ Edge: +0.019</span>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-sm text-left">
            <span className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-widest font-black block mb-3">Lịch Sử Log Loss Từng Tuần (Rolling vs Nhà Cái)</span>
            
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalLossData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="week" stroke="#52525b" fontSize={8} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={8} domain={[0.59, 0.67]} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                  <Line name="Gridiron Model" type="monotone" dataKey="model" stroke="#f59e0b" strokeWidth={2} />
                  <Line name="Sàn Giao Dịch" type="monotone" dataKey="market" stroke="#71717a" strokeWidth={1.5} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 3. CALIBRATION TAB ==================== */}
      {activeAdminTab === "calibration" && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 shadow-sm text-left">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block mb-1">Đường Độ Khớp Xác Suất (Reliability Curve)</span>
            <p className="text-[9.5px] text-zinc-500 leading-relaxed mb-4">
              Biểu đồ trực quan hóa tần suất thực tế xảy ra (Trục Y) versus xác suất mô hình gán nhãn (Trục X). Khoảng lệch so với đường 45 độ nét đứt thể hiện Sai Số Hiệu Chuẩn (Calibration Error).
            </p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={calibrationData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={8} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={8} domain={[0, 1]} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                  <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: "8px", top: -14 }} />
                  
                  <Line 
                    name="Lý tưởng" 
                    type="linear" 
                    data={[
                      { name: "0-20%", predictedHome: 0.1, observedHome: 0.1 },
                      { name: "20-40%", predictedHome: 0.3, observedHome: 0.3 },
                      { name: "40-60%", predictedHome: 0.5, observedHome: 0.5 },
                      { name: "60-80%", predictedHome: 0.7, observedHome: 0.7 },
                      { name: "80-100%", predictedHome: 0.9, observedHome: 0.9 }
                    ]}
                    dataKey="observedHome" 
                    stroke="#52525b" 
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    dot={false}
                  />

                  <Line name="Sân nhà (Home)" type="monotone" dataKey="observedHome" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2.5 }} />
                  <Line name="Sân khách (Away)" type="monotone" dataKey="observedAway" stroke="#ef4444" strokeWidth={2} dot={{ r: 2.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-850 text-[10px] space-y-1">
              <span className="text-zinc-400 font-bold block uppercase font-mono">Chỉ Số Sai Số Hiệu Chuẩn (ECE):</span>
              <div className="flex justify-between font-mono">
                <span className="text-zinc-500">Expected Calibration Error (Home):</span>
                <span className="text-blue-400 font-bold">0.015 (Rất thấp)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-zinc-500">Expected Calibration Error (Away):</span>
                <span className="text-rose-400 font-bold">0.021 (Rất thấp)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. BACKTEST SIMULATION (= SIMULATOR) ==================== */}
      {activeAdminTab === "backtest" && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-4 text-left">
            <div>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Giả lập Quyết định Thống kê (Historical Decision Evaluation)</span>
              <p className="text-[9.5px] text-zinc-500 leading-relaxed mt-1">
                Sử dụng dữ liệu lịch sử đối chiếu để chạy thử nghiệm chiến lược phân khai và kiểm định chất lượng mô hình.
              </p>
            </div>

            {/* Edge and strategy selectors */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-zinc-400 font-bold">Ngưỡng biên an toàn (Edge Threshold)</span>
                  <span className="text-amber-500 font-mono font-black font-extrabold">&#62;= {edgeThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={edgeThreshold}
                  onChange={(e) => setEdgeThreshold(Number(e.target.value))}
                  className="w-full h-1 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[8.5px] font-mono text-zinc-500 block uppercase mb-1">Phương pháp phân bổ</span>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value as any)}
                    className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 text-[10.5px] font-sans font-bold p-2 rounded-xl focus:outline-none"
                  >
                    <option value="Flat">Phân bổ Đều (Flat)</option>
                    <option value="Kelly">Dynamic Kelly</option>
                  </select>
                </div>

                <div>
                  <span className="text-[8.5px] font-mono text-zinc-500 block uppercase mb-1">Giá trị Đơn vị (Unit)</span>
                  <input
                    type="number"
                    value={flatStake}
                    onChange={(e) => setFlatStake(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-850 text-zinc-300 text-[10.5px] font-sans font-bold p-2 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleRunBacktest}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-sans font-extrabold uppercase py-3 px-4 rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/10 active:scale-95"
              >
                <Play size={11} fill="currentColor" /> Chạy Giả Lập Sai Số Tổng Thể
              </button>
            </div>
          </div>

          {/* Stats simulation */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-2xl">
              <span className="text-[8px] font-mono text-zinc-500 block mb-0.5">TỶ SUẤT ROI</span>
              <span className="text-xs font-sans font-extrabold text-blue-400">{simulation.roi}%</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-2xl">
              <span className="text-[8px] font-mono text-zinc-500 block mb-0.5">SỐ LỆNH VÀO</span>
              <span className="text-xs font-sans font-extrabold text-white">{simulation.totalBets} trận</span>
            </div>

            <div className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-2xl">
              <span className="text-[8px] font-mono text-zinc-500 block mb-0.5">MAX DRAWDOWN</span>
              <span className="text-xs font-sans font-extrabold text-rose-500">-{simulation.maxDrawdown}%</span>
            </div>
          </div>

          {/* Area Chart balance */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 text-left">
            <span className="text-[9.5px] font-mono text-zinc-400 uppercase tracking-widest font-black block mb-2">Đường Cong Tăng Trưởng Tài Khoản Giả Định ($)</span>
            
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulation.data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="day" stroke="#52525b" fontSize={8} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={8} domain={["auto", "auto"]} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }} />
                  <Area type="monotone" dataKey="balance" stroke="#d97706" fill="#d97706" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-amber-950/10 border border-amber-900/35 p-3 rounded-2xl text-left flex gap-2">
            <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono font-bold text-amber-500 uppercase">Cảnh Báo Kiểm Thử MLOps</span>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Giả lập đầu tư dựa hoàn toàn trên backtest dữ liệu tuần tích lũy học thuật. Nghiêm cấm khuyến khích cá cược bằng tiền thật trên bất kỳ nền tảng nào.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. DATA PIPELINES TAB ==================== */}
      {activeAdminTab === "pipeline" && (
        <div className="space-y-4 text-left">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Airflow DAGs Orchestration</span>
              <span className="text-[8.5px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle size={10} /> ALL GREEN
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {dagStatuses.map((dag, i) => (
                <div key={i} className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={12} className="text-zinc-500" />
                    <span className="font-mono text-[10.5px] text-zinc-300 font-bold">{dag.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-zinc-500 font-mono">{dag.time}</span>
                    <span className="text-[8.5px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded uppercase font-black">
                      {dag.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-3 text-xs">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Great Expectations Report</span>
            
            <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-zinc-500">Assigned Ingestion Checks:</span>
                <span className="text-zinc-300 font-bold">28 checks passed</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-zinc-500">Missing Feature Rate:</span>
                <span className="text-emerald-400 font-bold">0.00%</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-zinc-500">Bronze-Silver Freshness:</span>
                <span className="text-emerald-400 font-bold">&#60; 12m delay</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 6. FEATURE STORE ==================== */}
      {activeAdminTab === "features" && (
        <div className="space-y-4 text-left">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-3.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Feast Feature Importance (Global SHAP)</span>
            
            <div className="space-y-2 text-xs">
              {featureImportance.map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10.5px] font-medium text-zinc-300">
                    <span>{feat.name}</span>
                    <span className="font-mono text-amber-500 font-bold">{feat.imp}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${feat.imp}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-2 text-xs">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Materialization Sync Logs</span>
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-zinc-500">Online Store Sync:</span>
                <span className="text-emerald-400 font-bold">SUCCESS (Redis)</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-zinc-500">Feature Count:</span>
                <span className="text-zinc-300 font-bold">142 structured pillars</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 7. MODEL REGISTRY ==================== */}
      {activeAdminTab === "registry" && (
        <div className="space-y-4 text-left">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-3.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">MLflow Model Registry Table</span>
            
            <div className="space-y-2.5 text-xs">
              <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-200">v3-production</span>
                  <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9.5px] font-mono text-zinc-500">
                  <span>Log Loss: 0.612</span>
                  <span>Accuracy: 54.2%</span>
                </div>
              </div>

              <div className="bg-zinc-950 p-3.5 rounded-2xl border border-zinc-850 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-200">v3-challenger</span>
                  <span className="text-[9px] font-black uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Staging</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[9.5px] font-mono text-zinc-500">
                  <span>Log Loss: 0.608</span>
                  <span>Accuracy: 54.9%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-3xl text-xs space-y-2">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-black">Promotion Decision Decision-tree</span>
            <p className="text-[10px] text-zinc-500">Challenger model v3 đang vượt trội hơn Production về mặt thử nghiệm độ chuẩn xác (+0.7%) nhưng đang trải qua holdout calibration test trước khi chính thức đưa vào deployment.</p>
          </div>
        </div>
      )}

      {/* ==================== 8. SYSTEM HEALTH / MONITORING ==================== */}
      {activeAdminTab === "monitoring" && (
        <div className="space-y-4 text-left">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-3.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Prometheus System Logs</span>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-0.5">
                <span className="text-[8px] font-mono text-zinc-500 block uppercase font-bold">RAG Retrieval Latency</span>
                <span className="text-zinc-150 font-bold block">45ms</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-0.5">
                <span className="text-[8px] font-mono text-zinc-500 block uppercase font-bold">LLM Failure Rate</span>
                <span className="text-emerald-400 font-bold block">0.05% (Nominal)</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-0.5">
                <span className="text-[8px] font-mono text-zinc-500 block uppercase font-bold">Qdrant status</span>
                <span className="text-emerald-400 font-bold block">Connected</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-850 space-y-0.5">
                <span className="text-[8px] font-mono text-zinc-500 block uppercase font-bold">Redis Cache CPU</span>
                <span className="text-zinc-150 font-bold block">3.4% usage</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 9. SETTINGS TAB ==================== */}
      {activeAdminTab === "settings" && (
        <div className="space-y-4 text-left">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-3.5">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black block">Credential Credentials Status</span>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                <span className="font-mono text-[9px] text-zinc-500 select-all">GEMINI_API_KEY</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">Stored (.env)</span>
              </div>

              <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                <span className="font-mono text-[9px] text-zinc-500 select-all">FEAST_REDIS_CONN</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase">Verified</span>
              </div>

              <div className="flex justify-between items-center bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                <span className="font-mono text-[9px] text-zinc-500 select-all">API_RATE_LIMIT</span>
                <span className="text-[10px] text-zinc-300 font-bold font-mono">10,000 req/min</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

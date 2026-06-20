import React, { useState, useRef, useEffect } from "react";
import { getChatResponse } from "../data";
import { Sparkles, BookOpen, CornerDownRight, Send, MessageSquare, ShieldCheck, Play, HelpCircle } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
  citations?: string[];
}

export const AIAnalyst: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Xin chào! Tôi là Trợ Lý Phân Tích Bóng Đá AI (AI Analyst). Tôi được tối ưu hóa để truy hồi và tổng hợp dữ liệu vĩ mô (Elo, xG, thông tin chấn thương & bối cảnh giải đấu) từ Gridiron Core DB. Hãy hỏi tôi về bất kỳ khía cạnh phân tích nào!",
      citations: ["Hồ sơ huấn luyện mô hình Gridiron v3-production"]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested pre-built analytical questions from the prompt guidelines!
  const suggestions = [
    "Vì sao mô hình đánh giá cao Man City?",
    "Arsenal vắng những ai trận này?",
    "Phong độ sân nhà gần đây của Man City tốt thế nào?",
    "Xoay tua nhân sự ở cúp quốc gia có nghiêm trọng không?",
    "So sánh phong độ gần đây của hai đội",
    "Giải thích trận đấu bằng ngôn từ đơn giản"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { sender: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    setTimeout(() => {
      const qa = getChatResponse(text);
      const botMsg: Message = {
        sender: "bot",
        text: qa.response,
        citations: qa.citations
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 pb-24 p-4 text-left">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-base font-black tracking-tighter text-white uppercase flex items-center gap-1.5">
            <Sparkles size={16} className="text-blue-400 animate-pulse" /> Trợ Lý AI Analyst
          </h2>
          <p className="text-[11px] text-zinc-500 font-mono tracking-wider">HỎI ĐÁP BÓNG ĐÁ - TRUY XUẤT CƠ SỞ TRI THỨC VĨ MÔ</p>
        </div>
        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck size={10} /> RAG READY
        </span>
      </div>

      <p className="text-[10px] text-zinc-400 font-sans tracking-wide leading-relaxed mb-4">
        Đặt câu hỏi tự nhiên về tương quan phong độ, chấn thương lực lượng, bối cảnh chiến thuật, hoặc lý do mô hình thay đổi nhận định. Hệ thống sẽ trích xuất thông tin khớp nhất từ RAG và trích dẫn bằng chứng.
      </p>

      {/* Messages Feed panel */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 rounded-3xl bg-zinc-900 p-4 border border-zinc-850 max-h-[50vh] scrollbar-none shadow-sm flex flex-col">
        {messages.map((msg, i) => {
          const isUser = msg.sender === "user";
          return (
            <div
              key={i}
              className={`flex flex-col ${isUser ? "items-end text-right" : "items-start text-left"}`}
            >
              <div
                className={`max-w-[85%] text-xs leading-relaxed p-3.5 rounded-2xl ${
                  isUser
                    ? "bg-zinc-800 text-zinc-100 rounded-tr-none border border-zinc-700/50"
                    : "bg-transparent text-zinc-200 border-l-[3px] border-l-blue-500 pl-3 py-1.5"
                }`}
              >
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                
                {/* Embedded references */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-zinc-800/60 flex flex-col gap-1">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1 font-bold">
                      <BookOpen size={9} /> Bằng chứng nguồn (Citations):
                    </span>
                    {msg.citations.map((cite, idx) => (
                      <span key={idx} className="text-[9px] font-mono text-zinc-400 flex items-center gap-1">
                        <CornerDownRight size={8} className="text-blue-400" /> {cite}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips panel */}
      <div className="mb-3.5">
        <span className="text-[8.5px] font-mono text-zinc-500 mb-2 block uppercase tracking-widest font-black leading-none">Gợi ý truy vấn chuyên sâu:</span>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none whitespace-nowrap">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sug)}
              className="text-[10px] bg-zinc-900 border border-zinc-850 hover:border-zinc-700 hover:text-white text-zinc-400 py-2 px-3.5 rounded-full transition-all shrink-0 font-medium"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
          placeholder="Hỏi về Elo đối đầu, chấn thương, xG, tỷ số..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-4 pr-12 py-3.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-inner"
        />
        <button
          onClick={() => handleSend(inputValue)}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white flex items-center justify-center transition-all shadow-md"
        >
          <Send size={13} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

"use client";

import { RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

const CARDS = [
  {
    id: "cathay",
    name: "國泰 CUBE",
    shortName: "CUBE",
    color: "#00693e",
    gradient: "from-emerald-800 to-emerald-600",
    currentPlan: "樂饗購",
    canSwitchToday: false,
    switchNote: "今日已切換",
    monthlyUsed: 4200,
    monthlyCap: null,
    rate: "3.0%",
    level: "L2",
    plans: ["玩數位", "樂饗購", "趣旅行", "集精選", "慶生月"],
  },
  {
    id: "taishin",
    name: "台新 Richart",
    shortName: "Richart",
    color: "#c41230",
    gradient: "from-red-800 to-red-600",
    currentPlan: "Pay 著刷（台新 Pay）",
    canSwitchToday: true,
    switchNote: null,
    monthlyUsed: 8900,
    monthlyCap: null,
    rate: "3.8%",
    level: "L2",
    plans: ["台新 Pay", "LINE Pay", "生活", "百貨", "餐飲", "網購", "旅遊"],
  },
  {
    id: "esun",
    name: "玉山 Unicard",
    shortName: "Unicard",
    color: "#d4860a",
    gradient: "from-amber-700 to-amber-500",
    currentPlan: "UP 選",
    canSwitchToday: null,
    switchNote: "選定 UP 選後本月無法切換",
    monthlyUsed: 1800,
    monthlyCap: 5000,
    rate: "4.5%",
    level: "UP選",
    plans: ["簡單選", "任意選", "UP 選"],
  },
  {
    id: "sinopac",
    name: "永豐大戶",
    shortName: "DAWHO",
    color: "#005baa",
    gradient: "from-blue-900 to-blue-700",
    currentPlan: "全通路（自動）",
    canSwitchToday: null,
    switchNote: "無需切換",
    monthlyUsed: 400,
    monthlyCap: 1000,
    rate: "5.0%",
    level: "大戶Plus",
    plans: null,
  },
  {
    id: "ctbc",
    name: "中信華航",
    shortName: "華航卡",
    color: "#b91c1c",
    gradient: "from-red-900 to-red-700",
    currentPlan: "里程累積",
    canSwitchToday: null,
    switchNote: "里程制，不適用切換",
    monthlyUsed: 320,
    monthlyCap: null,
    rate: "≈0.3哩/元",
    level: "璀璨無限",
    plans: null,
  },
];

function CapBar({ used, cap }: { used: number; cap: number }) {
  const pct = Math.min((used / cap) * 100, 100);
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-400" : "bg-emerald-500";
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-white/70 mb-1.5">
        <span>月回饋已用</span>
        <span>
          {used.toLocaleString()} / {cap.toLocaleString()} 元
        </span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function CardsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">我的信用卡</h1>
        <p className="text-sm text-gray-400 mt-0.5">3 月份回饋追蹤</p>
      </div>

      {/* Cards list */}
      <div className="px-5 space-y-4 pb-4">
        {CARDS.map((card) => (
          <div
            key={card.id}
            className={`rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-md`}
          >
            {/* Card header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold opacity-60 tracking-widest uppercase mb-1">
                  {card.level}
                </div>
                <div className="text-lg font-bold">{card.name}</div>
                <div className="text-sm opacity-75 mt-0.5">{card.currentPlan}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{card.rate}</div>
                <div className="text-xs opacity-60 mt-0.5">最高回饋</div>
              </div>
            </div>

            {/* Cap bar (if has monthly cap) */}
            {card.monthlyCap && (
              <CapBar used={card.monthlyUsed} cap={card.monthlyCap} />
            )}

            {/* Divider */}
            <div className="h-px bg-white/15 my-3.5" />

            {/* Switch section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {card.canSwitchToday === true && (
                  <CheckCircle2 size={14} className="text-green-300" />
                )}
                {card.canSwitchToday === false && (
                  <AlertTriangle size={14} className="text-amber-300" />
                )}
                <span className="text-xs opacity-70">
                  {card.switchNote ?? "可切換"}
                </span>
              </div>
              {card.plans && (
                <button className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition px-3 py-1.5 rounded-lg text-xs font-medium active:scale-95">
                  <RefreshCw size={12} />
                  切換方案
                </button>
              )}
            </div>

            {/* Monthly accumulation (no cap) */}
            {!card.monthlyCap && card.monthlyUsed > 0 && (
              <div className="flex items-center justify-between mt-2 bg-white/10 rounded-lg px-3 py-2">
                <span className="text-xs opacity-70">本月累積回饋</span>
                <span className="text-sm font-bold">
                  +{card.monthlyUsed.toLocaleString()}
                  {card.id === "ctbc" ? " 哩" : " 元"}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

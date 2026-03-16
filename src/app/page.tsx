"use client";

import { useState } from "react";
import { TrendingUp, AlertCircle, Zap, ChevronDown } from "lucide-react";

// ── 類別定義（含關鍵字用於未來自動判斷）─────────────────────────────────────
export const CATEGORIES = [
  {
    id: "dining",
    label: "餐飲",
    keywords: ["餐廳", "美食", "鼎泰豐", "麥當勞", "肯德基", "摩斯", "foodpanda", "ubereats", "uber eats", "外送"],
  },
  {
    id: "shopping",
    label: "網購",
    keywords: ["momo", "shopee", "蝦皮", "pchome", "amazon", "yahoo購物", "博客來", "eslite"],
  },
  {
    id: "department",
    label: "百貨",
    keywords: ["sogo", "新光三越", "微風", "101", "統一時代", "漢神", "遠百", "大葉高島屋", "uniqlo", "zara"],
  },
  {
    id: "supermarket",
    label: "超市賣場",
    keywords: ["全聯", "家樂福", "好市多", "costco", "大潤發", "楓康", "頂好", "wellcome"],
  },
  {
    id: "convenience",
    label: "超商",
    keywords: ["7-11", "seven", "全家", "family mart", "萊爾富", "ok mart", "hilife"],
  },
  {
    id: "gas",
    label: "加油",
    keywords: ["中油", "台塑", "全國加油", "cpc", "加油站"],
  },
  {
    id: "transport",
    label: "交通",
    keywords: ["uber", "台灣高鐵", "thsr", "台鐵", "捷運", "mrt", "公車", "計程車", "taxi", "gogoro", "youbike"],
  },
  {
    id: "parking",
    label: "停車",
    keywords: ["停車場", "utaggo", "停車費", "iparking", "upark", "車麻吉"],
  },
  {
    id: "ev",
    label: "充電",
    keywords: ["u-power", "evoasis", "evalue", "tail", "icharging", "ev充電", "電動車充電"],
  },
  {
    id: "digital",
    label: "數位/訂閱",
    keywords: ["spotify", "netflix", "apple", "youtube", "line pay", "line points", "chatgpt", "openai", "claude", "adobe", "microsoft"],
  },
  {
    id: "travel",
    label: "旅遊",
    keywords: ["booking.com", "agoda", "airbnb", "kkday", "klook", "hotels.com", "expedia", "skyscanner"],
  },
  {
    id: "overseas",
    label: "海外消費",
    keywords: ["海外", "foreign", "境外", "國外"],
  },
  {
    id: "insurance",
    label: "保費",
    keywords: ["人壽", "產險", "保費", "南山", "國泰人壽", "富邦人壽", "新光人壽"],
  },
  {
    id: "other",
    label: "一般消費",
    keywords: [],
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

// ── Mock 回饋資料 ────────────────────────────────────────────────────────────
const MOCK_RESULTS = [
  {
    cardName: "台新 Richart",
    cardColor: "#c41230",
    plan: "Pay 著刷（台新 Pay）",
    rate: 3.8,
    remainCap: null,
    note: null,
  },
  {
    cardName: "國泰 CUBE",
    cardColor: "#00693e",
    plan: "樂饗購",
    rate: 3.0,
    remainCap: null,
    note: "今日已選方案",
  },
  {
    cardName: "玉山 Unicard",
    cardColor: "#d4860a",
    plan: "UP 選",
    rate: 4.5,
    remainCap: 3200,
    note: "月上限剩 3,200 點",
  },
  {
    cardName: "永豐大戶",
    cardColor: "#005baa",
    plan: "全通路（大戶 Plus）",
    rate: 5.0,
    remainCap: 800,
    note: "月上限剩 800 元",
  },
  {
    cardName: "中信華航",
    cardColor: "#b91c1c",
    plan: "一般消費",
    rate: 1.0,
    remainCap: null,
    note: "≈ 0.3 哩/元（里程優先）",
  },
];

// ── 主頁 ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<CategoryId>("dining");
  const [showResults, setShowResults] = useState(false);
  const [showAllCats, setShowAllCats] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const selectedCat = CATEGORIES.find((c) => c.id === categoryId)!;

  // 顯示前 6 個類別，其餘收合
  const visibleCats = showAllCats ? CATEGORIES : CATEGORIES.slice(0, 6);

  const results = MOCK_RESULTS.map((r) => ({
    ...r,
    reward: Math.floor((numAmount * r.rate) / 100),
  })).sort((a, b) => {
    const aExceeds = a.remainCap !== null && a.reward > a.remainCap;
    const bExceeds = b.remainCap !== null && b.reward > b.remainCap;
    if (aExceeds && !bExceeds) return 1;
    if (!aExceeds && bExceeds) return -1;
    return b.reward - a.reward;
  });

  const best = results[0];

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap size={14} className="text-blue-600" fill="currentColor" />
          <span className="text-[11px] font-bold text-blue-600 tracking-widest uppercase">
            Smart Pick
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">刷哪張？</h1>
      </div>

      {/* ── Input Card ── */}
      <div className="mx-5 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        {/* Amount */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            消費金額
          </label>
          <div className="flex items-baseline mt-1.5 gap-2">
            <span className="text-xl font-light text-gray-300">NT$</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setShowResults(false);
              }}
              className="flex-1 min-w-0 text-4xl font-bold text-gray-900 bg-transparent outline-none placeholder:text-gray-200"
            />
          </div>
          <div className="h-px bg-gray-100 mt-3" />
        </div>

        {/* Category chips */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
            消費類別
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {visibleCats.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setCategoryId(cat.id);
                  setShowResults(false);
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
                  categoryId === cat.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 active:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={() => setShowAllCats((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-400 border border-dashed border-gray-200"
            >
              <ChevronDown
                size={13}
                className={`transition-transform ${showAllCats ? "rotate-180" : ""}`}
              />
              {showAllCats ? "收合" : "更多"}
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setShowResults(true)}
          disabled={!amount || numAmount <= 0}
          className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed active:bg-blue-700 active:scale-[0.98] transition-all duration-150 text-sm"
        >
          查詢最佳刷法
        </button>
      </div>

      {/* ── Results ── */}
      {showResults && numAmount > 0 ? (
        <div className="mx-5 mt-4 space-y-2.5 pb-4">
          {/* Best card banner */}
          <div
            className="rounded-2xl p-5 text-white"
            style={{
              background: `linear-gradient(135deg, ${best.cardColor}bb, ${best.cardColor})`,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <TrendingUp size={12} />
                  <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">
                    最佳選擇
                  </span>
                </div>
                <div className="text-xl font-bold truncate">{best.cardName}</div>
                <div className="text-sm opacity-75 mt-0.5 truncate">{best.plan}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-4xl font-bold">+{best.reward}</div>
                <div className="text-xs opacity-70 mt-0.5">{best.rate}% 回饋</div>
              </div>
            </div>
          </div>

          {/* Other cards */}
          {results.slice(1).map((r) => {
            const exceedsCap = r.remainCap !== null && r.reward > r.remainCap;
            return (
              <div
                key={r.cardName}
                className={`bg-white rounded-xl border p-4 flex items-center justify-between gap-3 ${
                  exceedsCap ? "border-amber-200" : "border-gray-100"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-1 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: r.cardColor }}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">
                      {r.cardName}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{r.plan}</div>
                    {r.note && (
                      <div
                        className={`flex items-center gap-1 mt-1 text-xs ${
                          exceedsCap ? "text-amber-500" : "text-gray-400"
                        }`}
                      >
                        {exceedsCap && <AlertCircle size={10} />}
                        {r.note}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`font-bold ${exceedsCap ? "text-amber-500" : "text-gray-900"}`}>
                    +{r.reward}
                  </div>
                  <div className="text-xs text-gray-400">{r.rate}%</div>
                </div>
              </div>
            );
          })}

          {/* Log button */}
          <button className="w-full py-3 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl text-sm font-medium active:border-blue-300 active:text-blue-500 transition-all duration-150">
            + 記錄這筆消費
          </button>
        </div>
      ) : (
        !showResults && (
          <div className="mx-5 mt-10 text-center">
            <div className="text-5xl mb-3">💳</div>
            <p className="text-gray-300 text-sm">輸入金額後查看各卡回饋比較</p>
          </div>
        )
      )}
    </div>
  );
}

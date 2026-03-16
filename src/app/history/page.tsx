"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";

const MOCK_HISTORY = [
  {
    id: 1,
    date: "2026-03-16",
    merchant: "鼎泰豐",
    category: "餐飲",
    amount: 1200,
    card: "台新 Richart",
    cardColor: "#c41230",
    plan: "Pay 著刷",
    reward: 45,
    rewardType: "點",
  },
  {
    id: 2,
    date: "2026-03-15",
    merchant: "Amazon",
    category: "網購",
    amount: 3500,
    card: "玉山 Unicard",
    cardColor: "#d4860a",
    plan: "UP 選",
    reward: 157,
    rewardType: "點",
  },
  {
    id: 3,
    date: "2026-03-15",
    merchant: "全家便利商店",
    category: "一般消費",
    amount: 285,
    card: "國泰 CUBE",
    cardColor: "#00693e",
    plan: "樂饗購",
    reward: 8,
    rewardType: "點",
  },
  {
    id: 4,
    date: "2026-03-14",
    merchant: "停車場",
    category: "交通停車",
    amount: 150,
    card: "永豐大戶",
    cardColor: "#005baa",
    plan: "大戶Plus",
    reward: 7,
    rewardType: "元",
  },
  {
    id: 5,
    date: "2026-03-12",
    merchant: "UNIQLO",
    category: "百貨",
    amount: 2800,
    card: "台新 Richart",
    cardColor: "#c41230",
    plan: "百貨",
    reward: 92,
    rewardType: "點",
  },
  {
    id: 6,
    date: "2026-03-10",
    merchant: "Spotify",
    category: "數位/串流",
    amount: 179,
    card: "國泰 CUBE",
    cardColor: "#00693e",
    plan: "玩數位",
    reward: 5,
    rewardType: "點",
  },
  {
    id: 7,
    date: "2026-03-08",
    merchant: "日本航空",
    category: "海外消費",
    amount: 12000,
    card: "中信華航",
    cardColor: "#b91c1c",
    plan: "里程累積",
    reward: 666,
    rewardType: "哩",
  },
];

function groupByDate(items: typeof MOCK_HISTORY) {
  return items.reduce(
    (acc, item) => {
      const key = item.date;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, typeof MOCK_HISTORY>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "今天";
  if (d.toDateString() === yesterday.toDateString()) return "昨天";
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_HISTORY.filter(
    (h) =>
      h.merchant.includes(search) ||
      h.category.includes(search) ||
      h.card.includes(search)
  );

  const grouped = groupByDate(filtered);
  const dates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  const totalReward = MOCK_HISTORY.filter((h) => h.rewardType !== "哩").reduce(
    (s, h) => s + h.reward,
    0
  );
  const totalMiles = MOCK_HISTORY.filter((h) => h.rewardType === "哩").reduce(
    (s, h) => s + h.reward,
    0
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">消費歷史</h1>
            <p className="text-sm text-gray-400 mt-0.5">3 月份</p>
          </div>
          <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm active:scale-95 transition">
            <Plus size={20} />
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex gap-2 mt-4">
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex-1 text-center">
            <div className="text-xs text-gray-400 mb-0.5">本月回饋</div>
            <div className="font-bold text-gray-900">+{totalReward} 元</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex-1 text-center">
            <div className="text-xs text-gray-400 mb-0.5">累積哩程</div>
            <div className="font-bold text-gray-900">+{totalMiles} 哩</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex-1 text-center">
            <div className="text-xs text-gray-400 mb-0.5">筆數</div>
            <div className="font-bold text-gray-900">{MOCK_HISTORY.length} 筆</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2.5">
          <Search size={16} className="text-gray-300 flex-shrink-0" />
          <input
            type="text"
            placeholder="搜尋商家、類別、卡片…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-300"
          />
          <Filter size={16} className="text-gray-300 flex-shrink-0" />
        </div>
      </div>

      {/* Grouped list */}
      <div className="px-5 space-y-5 pb-4">
        {dates.map((date) => (
          <div key={date}>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {formatDate(date)}
            </div>
            <div className="space-y-2">
              {grouped[date].map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
                >
                  {/* Card color dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.cardColor }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm truncate">
                        {item.merchant}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {item.card} · {item.plan}
                    </div>
                  </div>

                  {/* Amount + reward */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold text-gray-900">
                      NT${item.amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-emerald-600 font-medium mt-0.5">
                      +{item.reward} {item.rewardType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

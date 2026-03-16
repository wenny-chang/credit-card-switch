"use client";

import { ChevronRight, Info } from "lucide-react";

const CARD_SETTINGS = [
  {
    id: "cathay",
    name: "國泰 CUBE",
    color: "#00693e",
    settings: [
      { label: "等級", value: "Level 2（帳戶扣繳）", editable: true },
      { label: "今日方案", value: "樂饗購", editable: true },
      { label: "一般回饋率", value: "0.3%", editable: false },
    ],
  },
  {
    id: "taishin",
    name: "台新 Richart",
    color: "#c41230",
    settings: [
      { label: "等級", value: "Level 2（帳戶扣繳）", editable: true },
      { label: "今日方案", value: "Pay 著刷（台新 Pay）", editable: true },
      { label: "一般回饋率", value: "0.3%", editable: false },
    ],
  },
  {
    id: "esun",
    name: "玉山 Unicard",
    color: "#d4860a",
    settings: [
      { label: "3 月方案", value: "UP 選", editable: true },
      { label: "本月上限", value: "5,000 點", editable: false },
      { label: "UP選訂閱", value: "免費（上月刷卡 ≥ 3 萬）", editable: false },
    ],
  },
  {
    id: "sinopac",
    name: "永豐大戶",
    color: "#005baa",
    settings: [
      { label: "等級", value: "大戶 Plus（資產 ≥ 100 萬）", editable: true },
      { label: "月回饋上限", value: "NT$1,000", editable: false },
      { label: "悠遊卡加值", value: "5%（上限 NT$500/月）", editable: false },
    ],
  },
  {
    id: "ctbc",
    name: "中信華航",
    color: "#b91c1c",
    settings: [
      { label: "卡等", value: "璀璨無限", editable: true },
      { label: "里程換算", value: "1 哩 = NT$0.55", editable: true },
      { label: "國內消費", value: "18 元 = 1 哩", editable: false },
      { label: "海外/指定", value: "9 元 = 1 哩（2倍）", editable: false },
    ],
  },
];

const APP_SETTINGS = [
  { label: "每月自動重置日", value: "每月 1 日", editable: true },
  { label: "資料備份", value: "匯出 JSON", editable: true },
  { label: "清除所有資料", value: "", editable: true, danger: true },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-400 mt-0.5">卡片等級與回饋參數</p>
      </div>

      <div className="px-5 space-y-6 pb-4">
        {/* Card settings */}
        {CARD_SETTINGS.map((card) => (
          <div key={card.id}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: card.color }}
              />
              <span className="text-sm font-semibold text-gray-700">
                {card.name}
              </span>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {card.settings.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex items-center justify-between px-4 py-3.5 ${
                    i < card.settings.length - 1
                      ? "border-b border-gray-50"
                      : ""
                  } ${s.editable ? "cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition" : ""}`}
                >
                  <span className="text-sm text-gray-600">{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900">
                      {s.value}
                    </span>
                    {s.editable && (
                      <ChevronRight size={14} className="text-gray-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* App settings */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2">應用程式</div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {APP_SETTINGS.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition ${
                  i < APP_SETTINGS.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <span
                  className={`text-sm ${
                    s.danger ? "text-red-500" : "text-gray-600"
                  }`}
                >
                  {s.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {s.value && (
                    <span className="text-sm font-medium text-gray-900">
                      {s.value}
                    </span>
                  )}
                  <ChevronRight
                    size={14}
                    className={s.danger ? "text-red-300" : "text-gray-300"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="flex gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
          <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600 leading-relaxed">
            所有資料僅儲存在您的裝置上，不會上傳至任何伺服器。
          </p>
        </div>
      </div>
    </div>
  );
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { RefreshCw, AlertTriangle, CheckCircle2, X, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useAppStore } from '@/store/useAppStore'
import { getTransactionsByMonth } from '@/lib/db'
import type { CardId, CathayPlan, TaishinPlan, EsunPlan, Transaction } from '@/types'

// ── 靜態常數 ─────────────────────────────────────────────────

const CATHAY_PLANS: CathayPlan[] = ['玩數位', '樂饗購', '趣旅行', '集精選', '慶生月']
const TAISHIN_PLANS: TaishinPlan[] = ['台新Pay', 'LINE Pay', '生活', '百貨', '餐飲', '網購', '旅遊']
const ESUN_PLANS: EsunPlan[] = ['簡單選', '任意選', 'UP選']

const CARD_NAMES: Record<CardId, string> = {
  cathay: '國泰 CUBE',
  taishin: '台新 Richart',
  esun: '玉山 Unicard',
  sinopac: '永豐大戶',
  ctbc: '中信華航',
}

// 各卡漸層：from → to（bg-gradient-to-br）— 參考官方卡面設計
// light 系列（白卡）: 淡底 + 品牌色漸層，搭配深色文字
// dark  系列（黑卡）: 深底漸層，搭配白色文字
const CARD_GRADIENTS: Record<CardId, string> = {
  cathay:  'from-white to-emerald-50 border border-emerald-100',  // CUBE 白卡：白 → 淡翠綠
  taishin: 'from-zinc-950 to-neutral-900',                        // 黑狗卡 黑卡：近黑 → 深灰
  esun:    'from-white to-violet-50 border border-violet-100',    // Unicard 白卡：白 → 淡紫
  sinopac: 'from-zinc-950 to-zinc-700',                           // 永豐：近黑 → 深灰（大戶黑卡）
  ctbc:    'from-blue-950 to-sky-500',                            // 中信：深海軍藍 → 天藍（華航品牌色）
}

// ── 結帳日工具 ────────────────────────────────────────────────

function daysUntilStatement(statementDay: number): number {
  const today = new Date()
  const todayDate = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  let diff = statementDay - todayDate
  if (diff < 0) diff += daysInMonth
  return diff
}

function StatementChip({ day, light }: { day: number; light?: boolean }) {
  const days = daysUntilStatement(day)
  if (days === 0) {
    return (
      <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
        今日結帳
      </span>
    )
  }
  if (days <= 3) {
    return (
      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
        {days} 天後結帳
      </span>
    )
  }
  return (
    <span className={`text-xs ${light ? 'text-gray-400' : 'text-white/60'}`}>
      結帳 {day} 日
    </span>
  )
}

// ── 月份工具 ─────────────────────────────────────────────────

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

function monthLabel(): string {
  const d = new Date()
  return `${d.getMonth() + 1} 月份`
}

// ── 月累積計算 ────────────────────────────────────────────────

interface CardTotals {
  cash: number
  miles: number
}

function computeTotals(txs: Transaction[]): Record<string, CardTotals> {
  const totals: Record<string, CardTotals> = {}
  for (const tx of txs) {
    if (!totals[tx.cardId]) totals[tx.cardId] = { cash: 0, miles: 0 }
    if (tx.rewardType === '哩') {
      totals[tx.cardId].miles += tx.reward
    } else {
      totals[tx.cardId].cash += tx.reward
    }
  }
  return totals
}

// ── 月上限進度條 ─────────────────────────────────────────────

function CapBar({ used, cap, light }: { used: number; cap: number; light?: boolean }) {
  const pct = Math.min((used / cap) * 100, 100)
  const color = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="mt-3">
      <div className={`flex justify-between text-xs mb-1.5 ${light ? 'text-gray-400' : 'text-white/70'}`}>
        <span>月回饋已用</span>
        <span>
          {used.toLocaleString()} / {cap.toLocaleString()} 元
        </span>
      </div>
      <div className={`h-1.5 rounded-full overflow-hidden ${light ? 'bg-gray-200' : 'bg-white/20'}`}>
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── 切換方案 Bottom Sheet ────────────────────────────────────

interface PlanSheetProps {
  cardName: string
  currentPlan: string
  plans: string[]
  locked?: boolean
  lockNote?: string
  onSelect: (plan: string) => void
  onClose: () => void
}

function PlanSheet({
  cardName,
  currentPlan,
  plans,
  locked,
  lockNote,
  onSelect,
  onClose,
}: PlanSheetProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-t-3xl shadow-2xl">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <div>
            <div className="text-base font-bold text-gray-900">切換方案</div>
            <div className="text-xs text-gray-400 mt-0.5">{cardName}</div>
          </div>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 cursor-pointer"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-3 pb-24">
          {locked && lockNote && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 text-xs text-amber-600 mb-3">
              {lockNote}
            </div>
          )}
          <div className="space-y-2">
            {plans.map((plan) => {
              const isCurrent = plan === currentPlan
              const isDisabled = locked && !isCurrent
              return (
                <button
                  key={plan}
                  onClick={() => {
                    if (!isDisabled) {
                      onSelect(plan)
                      onClose()
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all min-h-[52px] ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white cursor-default'
                      : isDisabled
                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border-gray-100 text-gray-700 active:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <span className="font-medium">{plan}</span>
                  {isCurrent && <CheckCircle2 size={16} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 主頁面 ───────────────────────────────────────────────────

export default function CardsPage() {
  const {
    settings,
    settingsLoaded,
    currentPlan,
    planLoaded,
    loadSettings,
    loadCurrentPlan,
    updateCathayPlan,
    updateTaishinPlan,
    updateEsunPlan,
  } = useAppStore()

  const [cardTotals, setCardTotals] = useState<Record<string, CardTotals>>({})
  const [switchingCard, setSwitchingCard] = useState<CardId | null>(null)

  const loadTotals = useCallback(async () => {
    const txs = await getTransactionsByMonth(currentMonth())
    setCardTotals(computeTotals(txs))
  }, [])

  useEffect(() => {
    loadSettings()
    loadCurrentPlan()
    loadTotals()
  }, [loadSettings, loadCurrentPlan, loadTotals])

  if (!settingsLoaded || !planLoaded || !currentPlan) {
    return (
      <div className="flex items-center justify-center pt-32">
        <div className="text-gray-300 text-sm">載入中…</div>
      </div>
    )
  }

  const disabled = settings.disabledCards ?? []
  const esunLocked = currentPlan.esunUpSwitch
  const sinopacCap = 1000
  const esunCap = currentPlan.esunPlan === 'UP選' ? 5000 : 1000

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">我的信用卡</h1>
        <p className="text-sm text-gray-400 mt-0.5">{monthLabel()}回饋追蹤</p>
        <div className="flex gap-2 mt-3">
          <Link
            href="/cards/plans"
            className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full"
          >
            方案對照表 <ChevronRight size={12} />
          </Link>
          <Link
            href="/cards/perks"
            className="flex items-center gap-1 text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1.5 rounded-full"
          >
            卡片權益 <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      <div className="px-5 space-y-4 pb-4">

        {/* 國泰 CUBE — 白卡 */}
        {!disabled.includes('cathay') && (
          <div className={`rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS.cathay} p-5 shadow-md`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold text-emerald-600/70 tracking-widest uppercase mb-1">
                  {settings.cathayLevel}
                </div>
                <div className="text-lg font-bold text-gray-900">{CARD_NAMES.cathay}</div>
                <div className="text-sm text-gray-500 mt-0.5">{currentPlan.cathayPlan}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">本月累積</div>
                <div className="text-2xl font-bold text-gray-900">
                  +{(cardTotals.cathay?.cash ?? 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">元</div>
              </div>
            </div>
            <div className="h-px bg-gray-200 my-3.5" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">每月可切換</span>
                {settings.statementDays?.cathay && (
                  <StatementChip day={settings.statementDays.cathay} light />
                )}
              </div>
              <button
                onClick={() => setSwitchingCard('cathay')}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition px-3.5 py-2.5 rounded-lg text-xs font-medium active:scale-95 cursor-pointer min-h-[36px]"
              >
                <RefreshCw size={12} />
                切換方案
              </button>
            </div>
          </div>
        )}

        {/* 台新 Richart — 黑狗卡 黑卡 */}
        {!disabled.includes('taishin') && (
          <div className={`rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS.taishin} p-5 text-white shadow-md`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold opacity-60 tracking-widest uppercase mb-1">
                  {settings.taishinLevel}
                </div>
                <div className="text-lg font-bold">{CARD_NAMES.taishin}</div>
                <div className="text-sm opacity-75 mt-0.5">{currentPlan.taishinPlan}</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-60 mb-1">本月累積</div>
                <div className="text-2xl font-bold">
                  +{(cardTotals.taishin?.cash ?? 0).toLocaleString()}
                </div>
                <div className="text-xs opacity-60">元</div>
              </div>
            </div>
            <div className="h-px bg-white/15 my-3.5" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-70">每月可切換</span>
                {settings.statementDays?.taishin && (
                  <StatementChip day={settings.statementDays.taishin} />
                )}
              </div>
              <button
                onClick={() => setSwitchingCard('taishin')}
                className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition px-3.5 py-2.5 rounded-lg text-xs font-medium active:scale-95 cursor-pointer min-h-[36px]"
              >
                <RefreshCw size={12} />
                切換方案
              </button>
            </div>
          </div>
        )}

        {/* 玉山 Unicard — 白卡 */}
        {!disabled.includes('esun') && (
          <div className={`rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS.esun} p-5 shadow-md`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold text-violet-600/70 tracking-widest uppercase mb-1">
                  {currentPlan.esunPlan}
                </div>
                <div className="text-lg font-bold text-gray-900">{CARD_NAMES.esun}</div>
                <div className="text-sm text-gray-500 mt-0.5">月上限 {esunCap.toLocaleString()} 點</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">已使用</div>
                <div className="text-2xl font-bold text-gray-900">
                  {(cardTotals.esun?.cash ?? 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">點</div>
              </div>
            </div>
            <CapBar used={cardTotals.esun?.cash ?? 0} cap={esunCap} light />
            <div className="h-px bg-gray-200 my-3.5" />
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                {esunLocked ? (
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-amber-500" />
                    <span className="text-xs text-gray-400">本月已鎖定 UP 選</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    <span className="text-xs text-gray-400">本月可切換</span>
                  </div>
                )}
                {settings.statementDays?.esun && (
                  <StatementChip day={settings.statementDays.esun} light />
                )}
              </div>
              <button
                onClick={() => setSwitchingCard('esun')}
                className="flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 transition px-3.5 py-2.5 rounded-lg text-xs font-medium active:scale-95 cursor-pointer min-h-[36px]"
              >
                <RefreshCw size={12} />
                切換方案
              </button>
            </div>
          </div>
        )}

        {/* 永豐大戶 */}
        {!disabled.includes('sinopac') && (
          <div className={`rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS.sinopac} p-5 text-white shadow-md`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold opacity-60 tracking-widest uppercase mb-1">
                  {settings.sinopacLevel}
                </div>
                <div className="text-lg font-bold">{CARD_NAMES.sinopac}</div>
                <div className="text-sm opacity-75 mt-0.5">全通路（自動）</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-60 mb-1">月上限 1,000 元</div>
                <div className="text-2xl font-bold">
                  {(cardTotals.sinopac?.cash ?? 0).toLocaleString()}
                </div>
                <div className="text-xs opacity-60">元已用</div>
              </div>
            </div>
            <CapBar used={cardTotals.sinopac?.cash ?? 0} cap={sinopacCap} />
            <div className="h-px bg-white/15 my-3.5" />
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">無需切換方案</span>
              {settings.statementDays?.sinopac && (
                <StatementChip day={settings.statementDays.sinopac} />
              )}
            </div>
          </div>
        )}

        {/* 中信華航 */}
        {!disabled.includes('ctbc') && (
          <div className={`rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS.ctbc} p-5 text-white shadow-md`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-semibold opacity-60 tracking-widest uppercase mb-1">
                  {settings.ctbcCard}
                </div>
                <div className="text-lg font-bold">{CARD_NAMES.ctbc}</div>
                <div className="text-sm opacity-75 mt-0.5">里程累積</div>
              </div>
              <div className="text-right">
                <div className="text-xs opacity-60 mb-1">本月累積</div>
                <div className="text-2xl font-bold">
                  {(cardTotals.ctbc?.miles ?? 0).toLocaleString()}
                </div>
                <div className="text-xs opacity-60">哩</div>
              </div>
            </div>
            <div className="h-px bg-white/15 my-3.5" />
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">
                1 哩 ≈ NT${settings.mileValue}（里程制，不切換方案）
              </span>
              {settings.statementDays?.ctbc && (
                <StatementChip day={settings.statementDays.ctbc} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Plan switch sheets */}
      {switchingCard === 'cathay' && (
        <PlanSheet
          cardName={CARD_NAMES.cathay}
          currentPlan={currentPlan.cathayPlan}
          plans={CATHAY_PLANS}
          onSelect={(p) => updateCathayPlan(p as CathayPlan)}
          onClose={() => setSwitchingCard(null)}
        />
      )}
      {switchingCard === 'taishin' && (
        <PlanSheet
          cardName={CARD_NAMES.taishin}
          currentPlan={currentPlan.taishinPlan}
          plans={TAISHIN_PLANS}
          onSelect={(p) => updateTaishinPlan(p as TaishinPlan)}
          onClose={() => setSwitchingCard(null)}
        />
      )}
      {switchingCard === 'esun' && (
        <PlanSheet
          cardName={CARD_NAMES.esun}
          currentPlan={currentPlan.esunPlan}
          plans={ESUN_PLANS}
          locked={esunLocked}
          lockNote="本月已切換至 UP 選，無法再切換其他方案。"
          onSelect={(p) => updateEsunPlan(p as EsunPlan)}
          onClose={() => setSwitchingCard(null)}
        />
      )}
    </div>
  )
}

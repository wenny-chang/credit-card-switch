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

function CapBar({ used, cap }: { used: number; cap: number }) {
  const pct = Math.min((used / cap) * 100, 100)
  const color = pct >= 90 ? 'bg-red-400' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-400'
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
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-3 pb-12">
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
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isDisabled
                      ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white border-gray-100 text-gray-700 active:bg-gray-50'
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-300 text-sm">載入中…</div>
      </div>
    )
  }

  const esunLocked = currentPlan.esunUpSwitch
  const sinopacCap = 1000
  const esunCap = currentPlan.esunPlan === 'UP選' ? 5000 : 1000

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
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

        {/* 國泰 CUBE */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-600 p-5 text-white shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold opacity-60 tracking-widest uppercase mb-1">
                {settings.cathayLevel}
              </div>
              <div className="text-lg font-bold">{CARD_NAMES.cathay}</div>
              <div className="text-sm opacity-75 mt-0.5">{currentPlan.cathayPlan}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-60 mb-1">本月累積</div>
              <div className="text-2xl font-bold">
                +{(cardTotals.cathay?.cash ?? 0).toLocaleString()}
              </div>
              <div className="text-xs opacity-60">元</div>
            </div>
          </div>
          <div className="h-px bg-white/15 my-3.5" />
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-70">每月可切換</span>
            <button
              onClick={() => setSwitchingCard('cathay')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition px-3 py-1.5 rounded-lg text-xs font-medium active:scale-95"
            >
              <RefreshCw size={12} />
              切換方案
            </button>
          </div>
        </div>

        {/* 台新 Richart */}
        <div className="rounded-2xl bg-gradient-to-br from-red-800 to-red-600 p-5 text-white shadow-md">
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
            <span className="text-xs opacity-70">每月可切換</span>
            <button
              onClick={() => setSwitchingCard('taishin')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition px-3 py-1.5 rounded-lg text-xs font-medium active:scale-95"
            >
              <RefreshCw size={12} />
              切換方案
            </button>
          </div>
        </div>

        {/* 玉山 Unicard */}
        <div className="rounded-2xl bg-gradient-to-br from-amber-700 to-amber-500 p-5 text-white shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold opacity-60 tracking-widest uppercase mb-1">
                {currentPlan.esunPlan}
              </div>
              <div className="text-lg font-bold">{CARD_NAMES.esun}</div>
              <div className="text-sm opacity-75 mt-0.5">月上限 {esunCap.toLocaleString()} 點</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-60 mb-1">已使用</div>
              <div className="text-2xl font-bold">
                {(cardTotals.esun?.cash ?? 0).toLocaleString()}
              </div>
              <div className="text-xs opacity-60">點</div>
            </div>
          </div>
          <CapBar used={cardTotals.esun?.cash ?? 0} cap={esunCap} />
          <div className="h-px bg-white/15 my-3.5" />
          <div className="flex items-center justify-between">
            {esunLocked ? (
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-amber-300" />
                <span className="text-xs opacity-70">本月已鎖定 UP 選</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-300" />
                <span className="text-xs opacity-70">本月可切換</span>
              </div>
            )}
            <button
              onClick={() => setSwitchingCard('esun')}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition px-3 py-1.5 rounded-lg text-xs font-medium active:scale-95"
            >
              <RefreshCw size={12} />
              切換方案
            </button>
          </div>
        </div>

        {/* 永豐大戶 */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 p-5 text-white shadow-md">
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
          <span className="text-xs opacity-70">無需切換方案</span>
        </div>

        {/* 中信華航 */}
        <div className="rounded-2xl bg-gradient-to-br from-red-900 to-red-700 p-5 text-white shadow-md">
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
          <span className="text-xs opacity-70">
            1 哩 ≈ NT${settings.mileValue}（里程制，不切換方案）
          </span>
        </div>
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

'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, Info, X, Check } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { clearAllData } from '@/lib/db'
import type {
  CathayLevel,
  TaishinLevel,
  SinopacLevel,
  CtbcCard,
} from '@/types'

// ── Select Bottom Sheet ───────────────────────────────────────

interface SelectSheetProps<T extends string> {
  title: string
  current: T
  options: { value: T; label: string; note?: string }[]
  onSelect: (v: T) => void
  onClose: () => void
}

function SelectSheet<T extends string>({
  title,
  current,
  options,
  onSelect,
  onClose,
}: SelectSheetProps<T>) {
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
          <div className="text-base font-bold text-gray-900">{title}</div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="px-5 py-3 pb-24 space-y-2">
          {options.map((opt) => {
            const isCurrent = opt.value === current
            return (
              <button
                key={opt.value}
                onClick={() => {
                  onSelect(opt.value)
                  onClose()
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border transition-all text-left ${
                  isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-100 text-gray-700 active:bg-gray-50'
                }`}
              >
                <div>
                  <div className="font-medium">{opt.label}</div>
                  {opt.note && (
                    <div
                      className={`text-xs mt-0.5 ${
                        isCurrent ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      {opt.note}
                    </div>
                  )}
                </div>
                {isCurrent && <Check size={16} className="flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── 設定列 ───────────────────────────────────────────────────

interface SettingRowProps {
  label: string
  value: string
  editable?: boolean
  danger?: boolean
  onClick?: () => void
}

function SettingRow({ label, value, editable, danger, onClick }: SettingRowProps) {
  return (
    <button
      onClick={onClick}
      disabled={!editable && !onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition ${
        editable || onClick ? 'active:bg-gray-50 cursor-pointer' : 'cursor-default'
      }`}
    >
      <span className={`text-sm ${danger ? 'text-red-500' : 'text-gray-600'}`}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {value && (
          <span className={`text-sm font-medium ${danger ? 'text-red-400' : 'text-gray-900'}`}>
            {value}
          </span>
        )}
        {editable && (
          <ChevronRight
            size={14}
            className={danger ? 'text-red-300' : 'text-gray-300'}
          />
        )}
      </div>
    </button>
  )
}

// ── 主頁面 ───────────────────────────────────────────────────

type ActiveField =
  | 'cathayLevel'
  | 'taishinLevel'
  | 'sinopacLevel'
  | 'ctbcCard'
  | 'mileValue'
  | null

export default function SettingsPage() {
  const { settings, settingsLoaded, loadSettings, updateSettings } = useAppStore()
  const [activeField, setActiveField] = useState<ActiveField>(null)
  const [mileInput, setMileInput] = useState('')

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    if (settingsLoaded) {
      setMileInput(String(settings.mileValue))
    }
  }, [settingsLoaded, settings.mileValue])

  async function handleExport() {
    const { exportAllData: exportFn } = await import('@/lib/db')
    const json = await exportFn()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const month = new Date().toISOString().slice(0, 7)
    a.download = `刷哪張-備份-${month}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleClear() {
    if (!confirm('確定要清除所有資料？此操作無法還原。')) return
    await clearAllData()
    alert('資料已清除，請重新整理頁面。')
  }

  if (!settingsLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-300 text-sm">載入中…</div>
      </div>
    )
  }

  const CATHAY_LEVEL_OPTIONS: { value: CathayLevel; label: string; note: string }[] = [
    { value: 'L1', label: 'Level 1', note: '一般消費 0.3%' },
    { value: 'L2', label: 'Level 2', note: '帳戶扣繳，指定通路最高 3%' },
    { value: 'L3', label: 'Level 3', note: '資產門檻，指定通路最高 3%' },
  ]

  const TAISHIN_LEVEL_OPTIONS: { value: TaishinLevel; label: string; note: string }[] = [
    { value: 'L1', label: 'Level 1', note: '一般消費 0.3%' },
    { value: 'L2', label: 'Level 2', note: '帳戶扣繳，最高 3.8%' },
  ]

  const SINOPAC_LEVEL_OPTIONS: { value: SinopacLevel; label: string; note: string }[] = [
    { value: '大大', label: '大大', note: '國內 1%、海外 1%' },
    { value: '大戶', label: '大戶', note: '國內 3%、海外 4%' },
    { value: '大戶Plus', label: '大戶 Plus', note: '資產 ≥ 100 萬，國內 5%、海外 6%' },
  ]

  const CTBC_CARD_OPTIONS: { value: CtbcCard; label: string; note: string }[] = [
    { value: '商務御璽', label: '商務御璽', note: '國內 30 元 = 1 哩' },
    { value: '璀璨無限', label: '璀璨無限', note: '國內 18 元 = 1 哩，海外 9 元 = 1 哩' },
    { value: '鼎尊無限', label: '鼎尊無限', note: '國內 15 元 = 1 哩，海外 7.5 元 = 1 哩' },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-sm text-gray-400 mt-0.5">卡片等級與回饋參數</p>
      </div>

      <div className="px-5 space-y-6 pb-8">


        {/* 啟用卡片 */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2">啟用卡片</div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {(
              [
                { id: 'cathay', name: '國泰 CUBE', color: '#00693e' },
                { id: 'taishin', name: '台新 Richart', color: '#c41230' },
                { id: 'esun', name: '玉山 Unicard', color: '#d4860a' },
                { id: 'sinopac', name: '永豐大戶', color: '#005baa' },
                { id: 'ctbc', name: '中信華航', color: '#b91c1c' },
              ] as const
            ).map(({ id, name, color }) => {
              const isEnabled = !(settings.disabledCards ?? []).includes(id)
              return (
                <div key={id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm text-gray-700">{name}</span>
                  </div>
                  <button
                    onClick={() => {
                      const cur = settings.disabledCards ?? []
                      const next = isEnabled
                        ? [...cur, id]
                        : cur.filter((c) => c !== id)
                      updateSettings({ disabledCards: next })
                    }}
                    className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                      isEnabled ? 'bg-blue-500' : 'bg-gray-200'
                    }`}
                    role="switch"
                    aria-checked={isEnabled}
                  >
                    <span
                      className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-md transition-transform duration-200 ${
                        isEnabled ? 'translate-x-[18px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-1.5 px-1">停用的卡片不會出現在推薦結果與我的卡頁面</p>
        </div>

        {/* 國泰 CUBE */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-700" />
            <span className="text-sm font-semibold text-gray-700">國泰 CUBE</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <SettingRow
              label="等級"
              value={settings.cathayLevel === 'L2' ? 'Level 2（帳戶扣繳）' : settings.cathayLevel}
              editable
              onClick={() => setActiveField('cathayLevel')}
            />
            <SettingRow
              label="一般消費回饋率"
              value="0.3%"
            />
          </div>
        </div>

        {/* 台新 Richart */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-700" />
            <span className="text-sm font-semibold text-gray-700">台新 Richart</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <SettingRow
              label="等級"
              value={settings.taishinLevel === 'L2' ? 'Level 2（帳戶扣繳）' : settings.taishinLevel}
              editable
              onClick={() => setActiveField('taishinLevel')}
            />
            <SettingRow
              label="一般消費回饋率"
              value="0.3%"
            />
          </div>
        </div>

        {/* 玉山 Unicard */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-600" />
            <span className="text-sm font-semibold text-gray-700">玉山 Unicard</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <SettingRow
              label="本月方案"
              value="在「我的卡」頁切換"
            />
            <SettingRow
              label="UP 選月上限"
              value="5,000 點"
            />
          </div>
        </div>

        {/* 永豐大戶 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-800" />
            <span className="text-sm font-semibold text-gray-700">永豐大戶 DAWHO</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <SettingRow
              label="等級"
              value={settings.sinopacLevel}
              editable
              onClick={() => setActiveField('sinopacLevel')}
            />
            <SettingRow
              label="月回饋上限"
              value="NT$1,000"
            />
          </div>
        </div>

        {/* 中信華航 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-800" />
            <span className="text-sm font-semibold text-gray-700">中信華航</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <SettingRow
              label="卡等"
              value={settings.ctbcCard}
              editable
              onClick={() => setActiveField('ctbcCard')}
            />
            <button
              onClick={() => setActiveField('mileValue')}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left active:bg-gray-50 transition"
            >
              <span className="text-sm text-gray-600">哩程換算率</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-900">
                  1 哩 = NT${settings.mileValue}
                </span>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </button>
          </div>
        </div>

        {/* 應用程式 */}
        <div>
          <div className="text-sm font-semibold text-gray-700 mb-2">應用程式</div>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            <SettingRow
              label="資料備份"
              value="匯出 JSON"
              editable
              onClick={handleExport}
            />
            <SettingRow
              label="清除所有資料"
              value=""
              editable
              danger
              onClick={handleClear}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3.5">
          <Info size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-600 leading-relaxed">
            所有資料僅儲存在您的裝置上，不會上傳至任何伺服器。
          </p>
        </div>
      </div>

      {/* Select sheets */}
      {activeField === 'cathayLevel' && (
        <SelectSheet
          title="國泰 CUBE 等級"
          current={settings.cathayLevel}
          options={CATHAY_LEVEL_OPTIONS}
          onSelect={(v) => updateSettings({ cathayLevel: v })}
          onClose={() => setActiveField(null)}
        />
      )}
      {activeField === 'taishinLevel' && (
        <SelectSheet
          title="台新 Richart 等級"
          current={settings.taishinLevel}
          options={TAISHIN_LEVEL_OPTIONS}
          onSelect={(v) => updateSettings({ taishinLevel: v })}
          onClose={() => setActiveField(null)}
        />
      )}
      {activeField === 'sinopacLevel' && (
        <SelectSheet
          title="永豐大戶等級"
          current={settings.sinopacLevel}
          options={SINOPAC_LEVEL_OPTIONS}
          onSelect={(v) => updateSettings({ sinopacLevel: v, sinopacExpectedLevel: v })}
          onClose={() => setActiveField(null)}
        />
      )}
      {activeField === 'ctbcCard' && (
        <SelectSheet
          title="中信華航卡等"
          current={settings.ctbcCard}
          options={CTBC_CARD_OPTIONS}
          onSelect={(v) => updateSettings({ ctbcCard: v })}
          onClose={() => setActiveField(null)}
        />
      )}
      {activeField === 'mileValue' && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setActiveField(null)}
          />
          <div className="relative bg-white rounded-t-3xl shadow-2xl">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="text-base font-bold text-gray-900">哩程換算率</div>
              <button
                onClick={() => setActiveField(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="px-5 py-5 pb-24">
              <p className="text-xs text-gray-400 mb-3">
                哩程兌換商品或機票的估計現金等值（常見：0.4–0.8 元/哩）
              </p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">1 哩 = NT$</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="2"
                  value={mileInput}
                  onChange={(e) => setMileInput(e.target.value)}
                  className="w-24 text-2xl font-bold text-gray-900 border-b-2 border-blue-500 outline-none text-center bg-transparent pb-1"
                />
              </div>
              <button
                onClick={() => {
                  const v = parseFloat(mileInput)
                  if (v > 0) updateSettings({ mileValue: v })
                  setActiveField(null)
                }}
                className="mt-6 w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl active:bg-blue-700 transition text-sm"
              >
                儲存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

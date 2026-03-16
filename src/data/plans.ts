import type { CardId, CategoryId } from '@/types'

// 方案對照表頁面（/cards/plans）用的靜態資料

export interface PlanDetail {
  name: string
  channels: string        // 適用通路描述
  categories: CategoryId[] // 對應類別 ID
  rate: string            // 回饋率描述（顯示用）
  rateNumber: number      // 回饋率數值（計算用）
  monthlyLimit: string    // 月上限描述
  notes?: string          // 額外說明
}

export interface CardPlans {
  cardId: CardId
  cardName: string
  plans: PlanDetail[]
}

export const PLANS_DATA: CardPlans[] = [
  {
    cardId: 'cathay',
    cardName: '國泰 CUBE',
    plans: [
      {
        name: '玩數位',
        channels: 'Apple、Google Play、Spotify、Netflix、YouTube Premium、ChatGPT 等',
        categories: ['digital'],
        rate: '3%',
        rateNumber: 0.03,
        monthlyLimit: '無上限',
      },
      {
        name: '樂饗購',
        channels: '餐廳、食品、foodpanda、Uber Eats、網購（momo、蝦皮、PChome）',
        categories: ['dining', 'shopping'],
        rate: '3%',
        rateNumber: 0.03,
        monthlyLimit: '無上限',
      },
      {
        name: '趣旅行',
        channels: '旅遊（Booking.com、Agoda、KKday）、航空、高鐵、租車、海外消費',
        categories: ['travel', 'overseas', 'transport'],
        rate: '3%',
        rateNumber: 0.03,
        monthlyLimit: '無上限',
      },
      {
        name: '集精選',
        channels: 'SOGO、微風、全聯、Costco、新光三越、遠東百貨',
        categories: ['department', 'supermarket', 'shopping'],
        rate: '2%',
        rateNumber: 0.02,
        monthlyLimit: '無上限',
        notes: '集精選固定 2%（非 3%）',
      },
      {
        name: '慶生月',
        channels: '生日當月，餐飲、購物、百貨、旅遊均適用',
        categories: ['dining', 'shopping', 'department', 'travel'],
        rate: '3%',
        rateNumber: 0.03,
        monthlyLimit: '無上限',
        notes: '僅生日當月可選',
      },
    ],
  },
  {
    cardId: 'taishin',
    cardName: '台新 Richart',
    plans: [
      {
        name: '台新Pay',
        channels: '指定消費以台新 Pay 感應付款（餐飲、購物、百貨、數位、旅遊、交通）',
        categories: ['shopping', 'dining', 'department', 'digital', 'travel', 'transport'],
        rate: '3.8%',
        rateNumber: 0.038,
        monthlyLimit: '無上限',
        notes: 'L2（設定自動扣繳）才享 3.8%',
      },
      {
        name: 'LINE Pay',
        channels: '透過 LINE Pay 消費（購物、餐飲、數位）',
        categories: ['shopping', 'dining', 'digital'],
        rate: '2.3%',
        rateNumber: 0.023,
        monthlyLimit: '無上限',
      },
      {
        name: '生活',
        channels: '超市（全聯、家樂福）、便利商店、加油、交通',
        categories: ['supermarket', 'convenience', 'gas', 'transport'],
        rate: '3.3%',
        rateNumber: 0.033,
        monthlyLimit: '無上限',
      },
      {
        name: '百貨',
        channels: 'SOGO、新光三越、微風、遠百、漢神等百貨公司',
        categories: ['department'],
        rate: '3.3%',
        rateNumber: 0.033,
        monthlyLimit: '無上限',
      },
      {
        name: '餐飲',
        channels: '餐廳、飲料店、foodpanda、Uber Eats',
        categories: ['dining'],
        rate: '3.3%',
        rateNumber: 0.033,
        monthlyLimit: '無上限',
      },
      {
        name: '網購',
        channels: 'momo、蝦皮、PChome、Yahoo 購物、Amazon',
        categories: ['shopping'],
        rate: '3.3%',
        rateNumber: 0.033,
        monthlyLimit: '無上限',
      },
      {
        name: '旅遊',
        channels: 'Booking.com、Agoda、KKday、Klook、Airbnb、海外消費',
        categories: ['travel', 'overseas'],
        rate: '3.3%',
        rateNumber: 0.033,
        monthlyLimit: '無上限',
      },
    ],
  },
  {
    cardId: 'esun',
    cardName: '玉山 Unicard',
    plans: [
      {
        name: '簡單選',
        channels: '一般消費 1%；指定百大通路（百貨、購物）2%',
        categories: ['dining', 'shopping', 'department', 'supermarket', 'digital', 'travel', 'other'],
        rate: '1%～2%',
        rateNumber: 0.02,
        monthlyLimit: '1,000 點/月（≈ NT$50,000）',
      },
      {
        name: '任意選',
        channels: '自選指定通路享最高 3.5% 回饋，一般消費依通路而定',
        categories: ['dining', 'shopping', 'department', 'digital', 'travel'],
        rate: '最高 3.5%',
        rateNumber: 0.035,
        monthlyLimit: '1,000 點/月',
        notes: '方案細節依當月選定通路而異',
      },
      {
        name: 'UP選',
        channels: '一般消費 3%；指定通路最高 4.5%',
        categories: ['dining', 'shopping', 'department', 'digital', 'travel', 'transport', 'supermarket'],
        rate: '3%～4.5%',
        rateNumber: 0.045,
        monthlyLimit: '5,000 點/月（≈ NT$111,111）',
        notes: '上月刷卡 ≥ 3 萬 或 資產 ≥ 30 萬免費；否則 149 點/月。一旦切換當月無法切回',
      },
    ],
  },
]

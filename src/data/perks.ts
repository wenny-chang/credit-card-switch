import type { CardPerk } from '@/types'

// 卡片權益靜態資料（/cards/perks 頁面用）

export const PERKS_DATA: CardPerk[] = [
  // ── 停車優惠 ──────────────────────────────────────────────

  {
    id: 'cathay-parking-1',
    cardId: 'cathay',
    perkType: 'parking',
    name: 'CUBE App 小樹點折抵停車費',
    condition: '需使用 CUBE App 掃碼繳費；35 小樹點 = 1 小時',
    limit: '1 點 = 1 元，無次數上限',
    partners: ['嘟嘟房停車場', '台灣聯通停車場'],
    url: 'https://www.cathay-cube.com.tw/cathaybk/personal/event/overview/credit-card/bonus/product/parkingfee',
  },
  {
    id: 'taishin-parking-1',
    cardId: 'taishin',
    perkType: 'parking',
    name: 'Autopass 市區停車序號（月消費達標）',
    condition: '當期帳單消費累積滿 NT$6,000，次月 15 日發放序號，需於 Richart Life App 兌換',
    limit: '每月 6 小時；每天限折 1 小時/次；序號當月底前需兌換',
    partners: ['嘟嘟房停車場', '24TPS 永固便利停車場', '俥酷 iParking（限嘟嘟房場站）'],
    url: 'https://www.taishinbank.com.tw/TSB/personal/credit/intro/rights/parking/right0302/',
  },
  {
    id: 'sinopac-parking-1',
    cardId: 'sinopac',
    perkType: 'parking',
    name: '交通類特色通路消費回饋',
    condition: '使用永豐大戶卡於合作停車 App 消費（行類回饋，依當月選定方案計算）',
    limit: '計入月回饋上限 NT$1,000',
    partners: ['iParking', '停車大聲公', 'USPACE', 'Times 停車場', '歐特儀停車場', 'Autopass（麻吉付）'],
  },
  {
    id: 'sinopac-parking-2',
    cardId: 'sinopac',
    perkType: 'parking',
    name: '紅利點數折抵市區停車費',
    condition: '需於簽約合作停車場出示信用卡過卡取得授權，不可使用行動支付',
    limit: '每人每日 1 次、每次最多 3 小時；超過部分現金付費',
    partners: ['台灣聯通停車場', '嘟嘟房停車場'],
  },
  {
    id: 'ctbc-parking-1',
    cardId: 'ctbc',
    perkType: 'parking',
    name: '指定停車場免費停車 1 小時',
    condition: '單筆消費 ≥ NT$3,000，出示中信華航璀璨無限卡',
    limit: '每次 1 小時，依各停車場配合規定',
  },

  // ── 旅遊保險 ──────────────────────────────────────────────

  {
    id: 'cathay-insurance-1',
    cardId: 'cathay',
    perkType: 'insurance',
    name: '旅遊平安險',
    condition: '以 CUBE 卡購買機票或旅遊套裝行程',
    limit: '旅平險最高 NT$1,000 萬',
  },
  {
    id: 'taishin-insurance-1',
    cardId: 'taishin',
    perkType: 'insurance',
    name: '旅遊平安險',
    condition: '以台新 Richart 卡購買機票或旅遊套裝行程',
    limit: '旅平險最高 NT$1,000 萬',
  },
  {
    id: 'esun-insurance-1',
    cardId: 'esun',
    perkType: 'insurance',
    name: '旅遊平安險',
    condition: '以玉山 Unicard 購買機票或旅遊套裝行程',
    limit: '旅平險最高 NT$500 萬',
  },
  {
    id: 'ctbc-insurance-1',
    cardId: 'ctbc',
    perkType: 'insurance',
    name: '旅遊平安險（璀璨無限）',
    condition: '以中信華航璀璨無限卡購買機票',
    limit: '旅平險最高 NT$3,000 萬；不便險另計',
  },

  // ── 道路救援 ──────────────────────────────────────────────

  {
    id: 'cathay-roadside-1',
    cardId: 'cathay',
    perkType: 'roadside',
    name: '24 小時道路救援',
    condition: '持卡人本人使用，需電話申請',
    limit: '每年 2 次免費拖吊（50 公里內）',
  },
  {
    id: 'ctbc-roadside-1',
    cardId: 'ctbc',
    perkType: 'roadside',
    name: '24 小時道路救援',
    condition: '持璀璨無限卡，需電話申請',
    limit: '不限次數（依情況評估）',
  },

  // ── 機場接送 / 貴賓室 ────────────────────────────────────

  {
    id: 'ctbc-airport-1',
    cardId: 'ctbc',
    perkType: 'airport',
    name: '機場貴賓室（龍騰卡）',
    condition: '持璀璨無限卡，出示龍騰卡/Visa 貴賓卡',
    limit: '每年 6 次免費（含陪同 1 名），超過每次 NT$800',
    url: 'https://www.dragonpass.com.tw/',
  },
  {
    id: 'ctbc-airport-2',
    cardId: 'ctbc',
    perkType: 'airport',
    name: '機場接送服務',
    condition: '提前 3 天預約，單筆消費 ≥ NT$5,000',
    limit: '每次費用依距離計，持卡人享優惠價',
  },

  // ── 其他 ──────────────────────────────────────────────────

  {
    id: 'esun-other-1',
    cardId: 'esun',
    perkType: 'other',
    name: '玉山 Pay 感應付款優惠',
    condition: '使用玉山 Pay 感應付款',
    limit: '依當月活動而定',
    url: 'https://card.esunbank.com.tw/',
  },
  {
    id: 'sinopac-other-1',
    cardId: 'sinopac',
    perkType: 'other',
    name: '悠遊卡加值 5% 回饋',
    condition: '使用永豐大戶卡加值悠遊卡',
    limit: '上限 NT$500/月（獨立計算，不計入 NT$1,000 主上限）',
  },
  {
    id: 'cathay-other-1',
    cardId: 'cathay',
    perkType: 'other',
    name: 'CUBE Pay 行動支付',
    condition: '開通 CUBE Pay 後感應消費',
    limit: '依當月選定方案回饋',
    url: 'https://www.cathaybk.com.tw/',
  },
]

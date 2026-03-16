import type { CategoryId } from '@/types'

// 商家關鍵字 → CategoryId 對照表
// 用於首頁文字搜尋自動 match 類別
export const KEYWORD_MAP: Record<string, CategoryId> = {
  // 餐飲 dining
  '餐廳': 'dining',
  '餐飲': 'dining',
  '鼎泰豐': 'dining',
  '麥當勞': 'dining',
  '肯德基': 'dining',
  '漢堡王': 'dining',
  '星巴克': 'dining',
  'starbucks': 'dining',
  'foodpanda': 'dining',
  'ubereats': 'dining',
  'uber eats': 'dining',
  '外送': 'dining',
  '便當': 'dining',
  '早餐': 'dining',
  '咖啡': 'dining',
  '火鍋': 'dining',
  '燒肉': 'dining',
  '牛肉麵': 'dining',
  '吃飯': 'dining',

  // 網購 shopping
  'momo': 'shopping',
  '蝦皮': 'shopping',
  'shopee': 'shopping',
  'pchome': 'shopping',
  'amazon': 'shopping',
  'yahoo購物': 'shopping',
  '網購': 'shopping',
  '線上購物': 'shopping',
  'etmall': 'shopping',
  '松果購物': 'shopping',

  // 百貨 department
  'sogo': 'department',
  '新光三越': 'department',
  '微風': 'department',
  '遠百': 'department',
  '遠東百貨': 'department',
  '太平洋百貨': 'department',
  '漢神': 'department',
  '百貨': 'department',
  'uniqlo': 'department',
  'zara': 'department',
  'h&m': 'department',
  '無印良品': 'department',
  'muji': 'department',
  'ikea': 'department',
  'costco': 'department',
  '好市多': 'department',

  // 超市賣場 supermarket
  '全聯': 'supermarket',
  '家樂福': 'supermarket',
  '大潤發': 'supermarket',
  '愛買': 'supermarket',
  '頂好': 'supermarket',
  '美廉社': 'supermarket',
  '超市': 'supermarket',
  '量販': 'supermarket',

  // 超商 convenience
  '7-11': 'convenience',
  '711': 'convenience',
  '7eleven': 'convenience',
  '全家': 'convenience',
  'family mart': 'convenience',
  '萊爾富': 'convenience',
  'ok超商': 'convenience',
  'ok便利': 'convenience',
  '超商': 'convenience',
  '便利商店': 'convenience',

  // 加油 gas
  '中油': 'gas',
  '台塑': 'gas',
  '全國加油': 'gas',
  '加油': 'gas',
  '油錢': 'gas',
  'cpc': 'gas',
  'fpcc': 'gas',

  // 交通 transport
  'uber': 'transport',
  '高鐵': 'transport',
  '台鐵': 'transport',
  '捷運': 'transport',
  '公車': 'transport',
  '計程車': 'transport',
  'taxi': 'transport',
  'gogoro': 'transport',
  'youbike': 'transport',
  'u-bike': 'transport',
  '機票': 'transport',
  '航空': 'transport',
  '交通': 'transport',

  // 停車 parking
  '停車': 'parking',
  '停車場': 'parking',
  'utaggo': 'parking',
  'iparking': 'parking',
  '路邊停車': 'parking',
  'etag': 'parking',
  'eTag': 'parking',
  '高速公路': 'parking',

  // 充電 ev
  '充電': 'ev',
  'u-power': 'ev',
  'upower': 'ev',
  'evoasis': 'ev',
  'icharging': 'ev',
  'tesla': 'ev',
  '電動車': 'ev',

  // 數位/訂閱 digital
  'spotify': 'digital',
  'netflix': 'digital',
  'apple': 'digital',
  'apple tv': 'digital',
  'apple music': 'digital',
  'chatgpt': 'digital',
  'openai': 'digital',
  'youtube': 'digital',
  'line pay': 'digital',
  'line tv': 'digital',
  'kkbox': 'digital',
  'friDay': 'digital',
  'friday': 'digital',
  'disney': 'digital',
  'hbo': 'digital',
  '訂閱': 'digital',
  '數位': 'digital',
  'app store': 'digital',
  'google play': 'digital',

  // 旅遊 travel
  'booking.com': 'travel',
  'agoda': 'travel',
  'kkday': 'travel',
  'klook': 'travel',
  'airbnb': 'travel',
  '飯店': 'travel',
  '旅館': 'travel',
  '民宿': 'travel',
  '旅遊': 'travel',
  '出遊': 'travel',
  '租車': 'travel',

  // 海外 overseas
  '海外': 'overseas',
  '境外': 'overseas',
  'foreign': 'overseas',
  '外幣': 'overseas',
  '美元': 'overseas',
  '日幣': 'overseas',
  '歐元': 'overseas',

  // 保費 insurance
  '人壽': 'insurance',
  '產險': 'insurance',
  '保費': 'insurance',
  '保險': 'insurance',
  '壽險': 'insurance',
  '車險': 'insurance',
  '醫療險': 'insurance',
}

// 按關鍵字長度降序排列（確保較長關鍵字優先匹配）
export const SORTED_KEYWORDS = Object.keys(KEYWORD_MAP).sort(
  (a, b) => b.length - a.length
)

import { useEffect, useState } from 'react'
import type { CategoryId } from '@/types'
import { KEYWORD_MAP, SORTED_KEYWORDS } from '@/data/keywords'

// ============================================================
// 商家關鍵字 → CategoryId
// ============================================================

export function matchCategory(text: string): CategoryId | null {
  if (!text.trim()) return null
  const normalized = text.trim().toLowerCase()

  for (const keyword of SORTED_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      return KEYWORD_MAP[keyword]
    }
  }
  return null
}

// ============================================================
// Debounce hook
// ============================================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

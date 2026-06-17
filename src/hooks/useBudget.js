import { useCallback, useState } from 'react'
import { WEEKLY_BUDGET_LIMIT } from '../data/sipSpendDrinks'

const WEEKLY_KEY = 'coffee-tracker-weekly-budget'
const MONTHLY_KEY = 'coffee-tracker-monthly-budget'
const DEFAULT_MONTHLY = WEEKLY_BUDGET_LIMIT * 4

function readNumber(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return fallback
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : fallback
  } catch {
    return fallback
  }
}

function writeNumber(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    /* ignore */
  }
}

export function useBudget() {
  const [weeklyLimit, setWeeklyState] = useState(() => readNumber(WEEKLY_KEY, WEEKLY_BUDGET_LIMIT))
  const [monthlyLimit, setMonthlyState] = useState(() => readNumber(MONTHLY_KEY, DEFAULT_MONTHLY))

  const setWeeklyLimit = useCallback((value) => {
    const n = Math.max(1, Math.round(value * 100) / 100)
    setWeeklyState(n)
    writeNumber(WEEKLY_KEY, n)
  }, [])

  const setMonthlyLimit = useCallback((value) => {
    const n = Math.max(1, Math.round(value * 100) / 100)
    setMonthlyState(n)
    writeNumber(MONTHLY_KEY, n)
  }, [])

  return { weeklyLimit, monthlyLimit, setWeeklyLimit, setMonthlyLimit }
}

export function getStoredWeeklyBudget() {
  return readNumber(WEEKLY_KEY, WEEKLY_BUDGET_LIMIT)
}

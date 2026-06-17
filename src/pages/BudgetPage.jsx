import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  eachDayOfInterval,
  format,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { getAllDrinks } from '../db/database'
import { getDrinkType } from '../data/drinkTypes'
import { SIP_SPEND_DRINKS } from '../data/sipSpendDrinks'
import { useBudget } from '../hooks/useBudget'
import { formatPrice } from '../utils/format'
import { getWeeklyBudgetMetrics } from '../utils/weeklyBudget'
import { WEEK_OPTIONS } from '../utils/calendarWeek'
import BudgetAmountKeypad from '../components/BudgetAmountKeypad'
import SpendingLineChart from '../components/charts/SpendingLineChart'
import SpendingPieChart from '../components/charts/SpendingPieChart'
import '../styles/budget.css'
import '../styles/sipspend.css'

const CHART_PERIODS = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
]

function drinkLabel(drink) {
  const match = SIP_SPEND_DRINKS.find((d) => d.drinkType === drink.drinkType)
  return match?.name ?? getDrinkType(drink.drinkType)?.label ?? drink.drinkType
}

function BudgetPeriodCard({ label, spent, limit }) {
  const { budgetPercent, budgetState, remaining, budgetAlertText } = getWeeklyBudgetMetrics(spent, limit)

  return (
    <div className={`budget-period-card${label === 'This week' ? ' budget-period-card--highlight' : ''}`}>
      <span className="budget-period-label">{label}</span>
      <div className={`budget-period-remaining ${budgetState}`}>
        {budgetState === 'danger' ? formatPrice(spent - limit) : formatPrice(remaining)}
      </div>
      <p className="budget-period-meta">
        {budgetState === 'danger' ? 'over budget · ' : 'left · '}
        <strong>{formatPrice(spent)}</strong> of {formatPrice(limit)}
      </p>
      <div className="sipspend-progress-track">
        <div
          className={`sipspend-progress-fill ${budgetState}`}
          style={{ width: `${budgetPercent}%` }}
        />
      </div>
      <span className={`sipspend-budget-alert ${budgetState}`} style={{ fontSize: '0.68rem' }}>
        {budgetAlertText}
      </span>
    </div>
  )
}

export default function BudgetPage() {
  const { weeklyLimit, monthlyLimit, setWeeklyLimit, setMonthlyLimit } = useBudget()
  const [drinks, setDrinks] = useState([])
  const [chartPeriod, setChartPeriod] = useState('week')

  const load = useCallback(async () => {
    setDrinks(await getAllDrinks())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const weekStart = useMemo(() => startOfWeek(new Date(), WEEK_OPTIONS).getTime(), [])
  const monthStart = useMemo(() => startOfMonth(new Date()).getTime(), [])

  const weekDrinks = useMemo(
    () => drinks.filter((d) => d.timestamp >= weekStart),
    [drinks, weekStart],
  )

  const monthDrinks = useMemo(
    () => drinks.filter((d) => d.timestamp >= monthStart),
    [drinks, monthStart],
  )

  const weekSpent = useMemo(
    () => weekDrinks.reduce((s, d) => s + (d.price ?? 0), 0),
    [weekDrinks],
  )

  const monthSpent = useMemo(
    () => monthDrinks.reduce((s, d) => s + (d.price ?? 0), 0),
    [monthDrinks],
  )

  const chartDrinks = chartPeriod === 'week' ? weekDrinks : monthDrinks
  const chartBudgetLimit = chartPeriod === 'week' ? weeklyLimit : monthlyLimit

  const lineChartData = useMemo(() => {
    const now = new Date()
    const days =
      chartPeriod === 'week'
        ? eachDayOfInterval({
            start: startOfWeek(now, WEEK_OPTIONS),
            end: now,
          })
        : eachDayOfInterval({
            start: startOfMonth(now),
            end: now,
          })

    const byDay = {}
    for (const drink of chartDrinks) {
      const key = format(new Date(drink.timestamp), 'yyyy-MM-dd')
      byDay[key] = (byDay[key] ?? 0) + (drink.price ?? 0)
    }

    if (chartPeriod === 'month' && days.length > 14) {
      const buckets = []
      const chunkSize = Math.ceil(days.length / 7)
      for (let i = 0; i < days.length; i += chunkSize) {
        const chunk = days.slice(i, i + chunkSize)
        const amount = chunk.reduce((s, day) => {
          const key = format(day, 'yyyy-MM-dd')
          return s + (byDay[key] ?? 0)
        }, 0)
        buckets.push({
          label: format(chunk[0], 'd'),
          fullLabel: `${format(chunk[0], 'MMM d')}${chunk.length > 1 ? `–${format(chunk[chunk.length - 1], 'd')}` : ''}`,
          amount,
        })
      }
      return buckets
    }

    return days.map((day) => {
      const key = format(day, 'yyyy-MM-dd')
      return {
        label: chartPeriod === 'week' ? format(day, 'EEE').slice(0, 3) : format(day, 'd'),
        fullLabel: format(day, 'EEE, MMM d'),
        amount: byDay[key] ?? 0,
      }
    })
  }, [chartDrinks, chartPeriod])

  const pieSlices = useMemo(() => {
    const byType = {}
    for (const drink of chartDrinks) {
      byType[drink.drinkType] = (byType[drink.drinkType] ?? 0) + (drink.price ?? 0)
    }
    return Object.entries(byType)
      .map(([id, amount]) => ({
        id,
        label: getDrinkType(id)?.label ?? id,
        amount,
      }))
      .filter((s) => s.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [chartDrinks])

  const pieTotal = useMemo(() => pieSlices.reduce((s, slice) => s + slice.amount, 0), [pieSlices])

  const recentTransactions = useMemo(() => {
    const pool = chartPeriod === 'week' ? weekDrinks : monthDrinks
    return [...pool].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8)
  }, [chartPeriod, weekDrinks, monthDrinks])

  const avgDaily = useMemo(() => {
    const days = chartPeriod === 'week' ? 7 : Math.max(1, new Date().getDate())
    return chartDrinks.reduce((s, d) => s + (d.price ?? 0), 0) / days
  }, [chartDrinks, chartPeriod])

  return (
    <div className="budget-page">
      <h1 className="page-title">Budget</h1>
      <p className="page-subtitle">Track spending and stay on target</p>

      <div className="budget-summary-grid">
        <BudgetPeriodCard label="This week" spent={weekSpent} limit={weeklyLimit} />
        <BudgetPeriodCard label="This month" spent={monthSpent} limit={monthlyLimit} />
      </div>

      <div className="budget-limits-panel">
        <h2 className="budget-limits-title">Set your budget</h2>
        <div className="budget-limit-rows">
          <BudgetAmountKeypad label="Weekly" value={weeklyLimit} onChange={setWeeklyLimit} period="weekly" />
          <BudgetAmountKeypad label="Monthly" value={monthlyLimit} onChange={setMonthlyLimit} period="monthly" />
        </div>
      </div>

      <div className="segmented">
        {CHART_PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={chartPeriod === p.id ? 'active' : ''}
            onClick={() => setChartPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-value">{formatPrice(chartDrinks.reduce((s, d) => s + (d.price ?? 0), 0))}</div>
          <div className="stat-card-label">Total spent</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{formatPrice(avgDaily)}</div>
          <div className="stat-card-label">Avg / day</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{chartDrinks.length}</div>
          <div className="stat-card-label">Cups logged</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">
            {chartPeriod === 'week'
              ? formatPrice(Math.max(0, weeklyLimit - weekSpent))
              : formatPrice(Math.max(0, monthlyLimit - monthSpent))}
          </div>
          <div className="stat-card-label">Remaining</div>
        </div>
      </div>

      <div className="panel budget-chart-panel">
        <h2 className="panel-title">
          Spending trend
          <span className="budget-chart-subtitle">
            {chartPeriod === 'week' ? 'Last 7 days' : 'Month to date'}
          </span>
        </h2>
        <SpendingLineChart
          data={lineChartData}
          budgetLimit={chartPeriod === 'week' ? weeklyLimit / 7 : monthlyLimit / 30}
          emptyLabel="Log coffee with prices to see your trend"
        />
      </div>

      <div className="panel budget-chart-panel">
        <h2 className="panel-title">By drink type</h2>
        <SpendingPieChart
          slices={pieSlices}
          total={pieTotal}
          emptyLabel="No priced drinks in this period"
        />
      </div>

      <div className="panel budget-transactions">
        <h2 className="panel-title">Recent transactions</h2>
        <div className="sipspend-logs">
          {recentTransactions.length === 0 ? (
            <div className="sipspend-logs-empty">No transactions yet this period.</div>
          ) : (
            recentTransactions.map((log) => (
              <div key={log.id} className="sipspend-log-item">
                <div className="sipspend-log-left">
                  <div className="sipspend-log-icon">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="sipspend-log-name">{drinkLabel(log)}</p>
                    <span className="sipspend-log-meta">
                      {log.placeName || log.cafeName || 'Unknown'} • {format(new Date(log.timestamp), 'MMM d')}
                    </span>
                  </div>
                </div>
                <span className="sipspend-log-price">+{formatPrice(log.price ?? 0)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

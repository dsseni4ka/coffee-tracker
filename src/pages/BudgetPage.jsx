import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import { deleteDrink, getAllDrinks } from '../db/database'
import { useBudget } from '../hooks/useBudget'
import { formatPrice } from '../utils/format'
import { getWeeklyBudgetMetrics } from '../utils/weeklyBudget'
import { formatWeekRange, WEEK_OPTIONS } from '../utils/calendarWeek'
import BudgetGauge from '../components/BudgetGauge'
import BudgetSummaryCard from '../components/BudgetSummaryCard'
import BudgetRecentTransactions from '../components/BudgetRecentTransactions'
import BudgetWeekPicker from '../components/BudgetWeekPicker'
import SpendingLineChart from '../components/charts/SpendingLineChart'
import '../styles/budget.css'
import '../styles/sipspend.css'

const CHART_PERIODS = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
]

export default function BudgetPage() {
  const { weeklyLimit, monthlyLimit, setWeeklyLimit } = useBudget()
  const [drinks, setDrinks] = useState([])
  const [chartPeriod, setChartPeriod] = useState('week')
  const [weekOffset, setWeekOffset] = useState(0)

  const load = useCallback(async () => {
    setDrinks(await getAllDrinks())
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const today = useMemo(() => new Date(), [])
  const isCurrentWeek = weekOffset === 0

  const selectedWeek = useMemo(
    () => startOfWeek(subWeeks(today, weekOffset), WEEK_OPTIONS),
    [today, weekOffset],
  )

  const weekStart = useMemo(() => selectedWeek.getTime(), [selectedWeek])
  const weekEnd = useMemo(
    () => endOfWeek(selectedWeek, WEEK_OPTIONS).getTime(),
    [selectedWeek],
  )

  const monthStart = useMemo(() => startOfMonth(today).getTime(), [today])

  const weekDrinks = useMemo(
    () => drinks.filter((d) => d.timestamp >= weekStart && d.timestamp <= weekEnd),
    [drinks, weekStart, weekEnd],
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

  const weekMetrics = useMemo(
    () => getWeeklyBudgetMetrics(weekSpent, weeklyLimit),
    [weekSpent, weeklyLimit],
  )

  const daysLeftInWeek = useMemo(() => {
    if (!isCurrentWeek) return 0
    const end = endOfWeek(today, WEEK_OPTIONS)
    return Math.max(1, differenceInCalendarDays(end, today) + 1)
  }, [today, isCurrentWeek])

  const weekRangeLabel = useMemo(() => formatWeekRange(selectedWeek), [selectedWeek])

  const chartDrinks = chartPeriod === 'week' ? weekDrinks : monthDrinks

  const lineChartData = useMemo(() => {
    const days =
      chartPeriod === 'week'
        ? eachDayOfInterval({
            start: selectedWeek,
            end: isCurrentWeek ? today : endOfWeek(selectedWeek, WEEK_OPTIONS),
          })
        : eachDayOfInterval({
            start: startOfMonth(today),
            end: today,
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
  }, [chartDrinks, chartPeriod, today, selectedWeek, isCurrentWeek])

  const weekTransactions = useMemo(
    () => [...weekDrinks].sort((a, b) => b.timestamp - a.timestamp),
    [weekDrinks],
  )

  const avgDaily = useMemo(() => {
    const days = chartPeriod === 'week' ? 7 : Math.max(1, today.getDate())
    return chartDrinks.reduce((s, d) => s + (d.price ?? 0), 0) / days
  }, [chartDrinks, chartPeriod, today])

  function goToPreviousWeek() {
    setWeekOffset((offset) => offset + 1)
  }

  function goToNextWeek() {
    setWeekOffset((offset) => Math.max(0, offset - 1))
  }

  async function handleDeleteTransaction(id) {
    await deleteDrink(id)
    await load()
  }

  return (
    <div className="budget-page">
      <header className="calendar-hero budget-header">
        <BudgetWeekPicker
          selectedWeek={selectedWeek}
          isCurrentWeek={isCurrentWeek}
          budgetState={weekMetrics.budgetState}
          onPreviousWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
        />
      </header>

      <BudgetGauge
        remaining={weekMetrics.remaining}
        limit={weeklyLimit}
        percentRemaining={weekMetrics.percentRemaining}
        daysLeft={daysLeftInWeek}
        budgetState={weekMetrics.budgetState}
        isCurrentWeek={isCurrentWeek}
      />

      <BudgetSummaryCard
        weeklyLimit={weeklyLimit}
        onWeeklyLimitChange={setWeeklyLimit}
        weekSpent={weekSpent}
        transactionCount={weekDrinks.length}
        remaining={weekMetrics.remaining}
        overBy={weekMetrics.overBy}
        budgetState={weekMetrics.budgetState}
      />

      <BudgetRecentTransactions
        transactions={weekTransactions}
        weekRangeLabel={weekRangeLabel}
        onDeleteTransaction={handleDeleteTransaction}
      />

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
            {chartPeriod === 'week'
              ? (isCurrentWeek ? 'Last 7 days' : weekRangeLabel)
              : 'Month to date'}
          </span>
        </h2>
        <SpendingLineChart
          data={lineChartData}
          budgetLimit={chartPeriod === 'week' ? weeklyLimit / 7 : monthlyLimit / 30}
          emptyLabel="Log coffee with prices to see your trend"
        />
      </div>
    </div>
  )
}

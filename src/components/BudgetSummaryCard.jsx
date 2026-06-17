import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AmountKeypadSheet } from './BudgetAmountKeypad'
import { formatPrice } from '../utils/format'
import TallyAmount from './sipspend/TallyAmount'

const WEEKLY_PRESETS = [25, 40, 50, 75, 100]

function PieIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  )
}

function CoinsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-2.21 0-4 1.12-4 2.5S9.79 13 12 13s4-1.12 4-2.5S14.21 8 12 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 10.5C6 8.57 8.69 7 12 7s6 1.57 6 3.5M6 14.5c0 1.93 2.69 3.5 6 3.5s6-1.57 6-3.5M6 18.5c0 1.93 2.69 3.5 6 3.5s6-1.57 6-3.5" />
    </svg>
  )
}

function GaugeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

export default function BudgetSummaryCard({
  weeklyLimit,
  onWeeklyLimitChange,
  weekSpent,
  transactionCount,
  remaining,
  overBy,
  budgetState,
}) {
  const [keypadOpen, setKeypadOpen] = useState(false)
  const isOverspent = budgetState === 'danger'
  const displayRemaining = isOverspent ? 0 : remaining

  return (
    <>
      <div className="budget-summary-card">
        <div className="budget-summary-row">
          <div className="budget-summary-row-left">
            <span className="budget-summary-icon" aria-hidden>
              <PieIcon />
            </span>
            <span className="budget-summary-label">Budget</span>
          </div>
          <button
            type="button"
            className="budget-summary-budget-value"
            onClick={() => setKeypadOpen(true)}
            aria-label={`Weekly budget ${formatPrice(weeklyLimit)}, tap to edit`}
          >
            <PencilIcon />
            {formatPrice(weeklyLimit)}
          </button>
        </div>

        <div className="budget-summary-row">
          <div className="budget-summary-row-left">
            <span className="budget-summary-icon" aria-hidden>
              <CoinsIcon />
            </span>
            <div>
              <span className="budget-summary-label">Spent this week</span>
              <span className="budget-summary-sublabel">
                {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'}
              </span>
            </div>
          </div>
          <span className="budget-summary-value budget-summary-value--spent">
            −<span className="currency">€</span>
            <TallyAmount value={weekSpent} animateOnMount />
          </span>
        </div>

        <div className="budget-summary-row">
          <div className="budget-summary-row-left">
            <span className="budget-summary-icon" aria-hidden>
              <GaugeIcon />
            </span>
            <span className="budget-summary-label">Left to spend</span>
          </div>
          <div className="budget-summary-value-stack">
            <span className={`budget-summary-value budget-summary-value--tally${isOverspent ? ' budget-summary-value--muted' : ''}`}>
              <span className="currency">€</span>
              <TallyAmount value={displayRemaining} animateOnMount />
            </span>
            {isOverspent && (
              <span className="budget-summary-overspent">{formatPrice(overBy)} overspent</span>
            )}
          </div>
        </div>
      </div>

      {keypadOpen &&
        createPortal(
          <AmountKeypadSheet
            title="Weekly budget"
            value={weeklyLimit}
            presets={WEEKLY_PRESETS}
            minAmount={1}
            onConfirm={onWeeklyLimitChange}
            onClose={() => setKeypadOpen(false)}
          />,
          document.body,
        )}
    </>
  )
}

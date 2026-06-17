import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AmountKeypadSheet } from './BudgetAmountKeypad'
import { formatPrice } from '../utils/format'
import TallyAmount from './sipspend/TallyAmount'

const WEEKLY_PRESETS = [25, 40, 50, 75, 100]

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

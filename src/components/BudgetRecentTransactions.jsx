import { useState } from 'react'
import BudgetTransactionItem from './BudgetTransactionItem'
import BudgetTransactionsSheet from './BudgetTransactionsSheet'

const PREVIEW_COUNT = 4

export default function BudgetRecentTransactions({ transactions, weekRangeLabel }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const preview = transactions.slice(0, PREVIEW_COUNT)
  const hasMore = transactions.length > PREVIEW_COUNT

  return (
    <>
      <section className="budget-recent home-card budget-recent-card">
        <div className="budget-recent-header">
          <h2 className="budget-recent-title">Recent transactions</h2>
          {transactions.length > 0 && (
            <button
              type="button"
              className="budget-recent-view-all"
              onClick={() => setSheetOpen(true)}
            >
              View all
            </button>
          )}
        </div>

        {preview.length === 0 ? (
          <div className="sipspend-logs-empty budget-recent-empty">No transactions this week.</div>
        ) : (
          <div className="sipspend-logs recent-sips-logs budget-recent-list">
            {preview.map((log) => (
              <BudgetTransactionItem key={log.id} log={log} />
            ))}
            {hasMore && (
              <button
                type="button"
                className="budget-recent-more"
                onClick={() => setSheetOpen(true)}
              >
                +{transactions.length - PREVIEW_COUNT} more
              </button>
            )}
          </div>
        )}
      </section>

      {sheetOpen && (
        <BudgetTransactionsSheet
          title={`Transactions · ${weekRangeLabel}`}
          transactions={transactions}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  )
}

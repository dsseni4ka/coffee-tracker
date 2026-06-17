import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import BudgetTransactionItem from './BudgetTransactionItem'

export default function BudgetTransactionsSheet({ title, transactions, onClose }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return createPortal(
    <div className="sheet-overlay budget-transactions-overlay" onClick={onClose} role="presentation">
      <div
        className="sheet sheet--add-coffee budget-transactions-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="sheet-handle" aria-hidden />

        <header className="sheet-toolbar">
          <button type="button" className="add-coffee-text-btn" onClick={onClose}>
            Close
          </button>
          <h2 className="sheet-toolbar-title">{title}</h2>
          <span className="add-coffee-text-btn add-coffee-text-btn--spacer" aria-hidden />
        </header>

        <div className="budget-transactions-sheet-body">
          {transactions.length === 0 ? (
            <div className="sipspend-logs-empty">No transactions this week.</div>
          ) : (
            <div className="sipspend-logs budget-transactions-sheet-list">
              {transactions.map((log) => (
                <BudgetTransactionItem key={log.id} log={log} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}

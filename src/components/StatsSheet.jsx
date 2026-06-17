import StatsPage from '../pages/StatsPage'

export default function StatsSheet({ onClose }) {
  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <div
        className="sheet sheet--add-coffee sheet--stats"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Coffee statistics"
      >
        <div className="sheet-handle" aria-hidden />

        <header className="sheet-toolbar">
          <button type="button" className="add-coffee-text-btn" onClick={onClose}>
            Close
          </button>
          <h2 className="sheet-toolbar-title">Statistics</h2>
          <span className="add-coffee-text-btn add-coffee-text-btn--spacer" aria-hidden />
        </header>

        <div className="add-coffee-body stats-sheet-body">
          <StatsPage embedded />
        </div>
      </div>
    </div>
  )
}

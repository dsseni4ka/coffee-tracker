import { useMemo } from 'react'
import { formatPrice } from '../../utils/format'

const PAD = { top: 16, right: 12, bottom: 28, left: 36 }
const W = 320
const H = 160

function smoothPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
  }
  return d
}

export default function SpendingLineChart({ data = [], budgetLimit, emptyLabel = 'No spending yet' }) {
  const chart = useMemo(() => {
    if (data.length === 0) return null

    const values = data.map((d) => d.amount)
    const maxVal = Math.max(budgetLimit ?? 0, ...values, 1)
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom

    const points = data.map((d, i) => ({
      x: PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
      y: PAD.top + innerH - (d.amount / maxVal) * innerH,
      ...d,
    }))

    const linePath = smoothPath(points)
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD.top + innerH} L ${points[0].x} ${PAD.top + innerH} Z`

    const budgetY =
      budgetLimit != null
        ? PAD.top + innerH - (Math.min(budgetLimit, maxVal) / maxVal) * innerH
        : null

    const yTicks = [0, maxVal * 0.5, maxVal].map((v) => ({
      value: v,
      y: PAD.top + innerH - (v / maxVal) * innerH,
    }))

    return { points, linePath, areaPath, budgetY, yTicks, maxVal }
  }, [data, budgetLimit])

  if (!chart) {
    return (
      <div className="budget-chart-empty" role="img" aria-label={emptyLabel}>
        <svg viewBox={`0 0 ${W} ${H}`} className="budget-line-chart">
          <line
            x1={PAD.left}
            y1={H - PAD.bottom}
            x2={W - PAD.right}
            y2={H - PAD.bottom}
            className="budget-chart-axis"
          />
        </svg>
        <span>{emptyLabel}</span>
      </div>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="budget-line-chart" role="img" aria-label="Spending trend">
      <defs>
        <linearGradient id="budget-line-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {chart.yTicks.map((tick) => (
        <g key={tick.value}>
          <line
            x1={PAD.left}
            y1={tick.y}
            x2={W - PAD.right}
            y2={tick.y}
            className="budget-chart-grid"
          />
          <text x={PAD.left - 6} y={tick.y + 3} className="budget-chart-y-label" textAnchor="end">
            €{tick.value < 10 ? tick.value.toFixed(0) : Math.round(tick.value)}
          </text>
        </g>
      ))}

      {chart.budgetY != null && (
        <line
          x1={PAD.left}
          y1={chart.budgetY}
          x2={W - PAD.right}
          y2={chart.budgetY}
          className="budget-chart-limit-line"
        />
      )}

      <path d={chart.areaPath} fill="url(#budget-line-gradient)" className="budget-chart-area" />
      <path d={chart.linePath} className="budget-chart-line" fill="none" />

      {chart.points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="4" className="budget-chart-dot" />
          <circle cx={p.x} cy={p.y} r="8" className="budget-chart-dot-halo" />
          <text x={p.x} y={H - 8} className="budget-chart-x-label" textAnchor="middle">
            {p.label}
          </text>
          <title>{`${p.fullLabel}: ${formatPrice(p.amount)}`}</title>
        </g>
      ))}
    </svg>
  )
}

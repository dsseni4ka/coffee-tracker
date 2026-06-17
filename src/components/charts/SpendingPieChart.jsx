import { useMemo } from 'react'
import DrinkSticker from '../DrinkSticker'
import { formatPrice } from '../../utils/format'

const CHART_COLORS = ['#c5a880', '#d97706', '#10b981', '#b45309', '#8b6f47', '#a78bfa', '#38bdf8', '#f472b6']

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const large = endAngle - startAngle > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`
}

export default function SpendingPieChart({ slices = [], total = 0, emptyLabel = 'No spending data' }) {
  const chart = useMemo(() => {
    if (slices.length === 0 || total <= 0) return null

    const cx = 100
    const cy = 100
    const r = 72
    const innerR = 46
    let angle = 0

    const segments = slices.map((slice, i) => {
      const sweep = (slice.amount / total) * 360
      const start = angle
      const end = angle + sweep
      angle = end

      const color = slice.color ?? CHART_COLORS[i % CHART_COLORS.length]
      const outer = arcPath(cx, cy, r, start, end - 0.5)
      const inner = arcPath(cx, cy, innerR, end - 0.5, start)
      const d = `${outer} L ${polarToCartesian(cx, cy, innerR, end - 0.5).x} ${polarToCartesian(cx, cy, innerR, end - 0.5).y} ${inner} Z`

      const midAngle = start + sweep / 2
      const labelPos = polarToCartesian(cx, cy, (r + innerR) / 2, midAngle)

      return { ...slice, d, color, midAngle, labelPos, percent: Math.round((slice.amount / total) * 100) }
    })

    return { segments, cx, cy }
  }, [slices, total])

  if (!chart) {
    return (
      <div className="budget-chart-empty budget-pie-empty" role="img" aria-label={emptyLabel}>
        <svg viewBox="0 0 200 200" className="budget-pie-chart">
          <circle cx="100" cy="100" r="72" className="budget-pie-ring-bg" />
          <circle cx="100" cy="100" r="46" fill="var(--color-surface)" />
        </svg>
        <span>{emptyLabel}</span>
      </div>
    )
  }

  return (
    <div className="budget-pie-wrap">
      <svg viewBox="0 0 200 200" className="budget-pie-chart" role="img" aria-label="Spending by drink type">
        {chart.segments.map((seg, i) => (
          <path
            key={seg.id}
            d={seg.d}
            fill={seg.color}
            className="budget-pie-segment"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <title>{`${seg.label}: ${formatPrice(seg.amount)} (${seg.percent}%)`}</title>
          </path>
        ))}
        <circle cx={chart.cx} cy={chart.cy} r="46" fill="var(--color-surface)" />
        <text x={chart.cx} y={chart.cy - 6} className="budget-pie-center-value" textAnchor="middle">
          {formatPrice(total)}
        </text>
        <text x={chart.cx} y={chart.cy + 12} className="budget-pie-center-label" textAnchor="middle">
          total
        </text>
      </svg>

      <ul className="budget-pie-legend">
        {chart.segments.map((seg) => (
          <li key={seg.id} className="budget-pie-legend-item">
            <span className="budget-pie-legend-swatch" style={{ background: seg.color }} />
            <span className="budget-pie-legend-label">
              <DrinkSticker drinkType={seg.id} size="xs" cutout emoji />
              {seg.label}
            </span>
            <span className="budget-pie-legend-value">{formatPrice(seg.amount)}</span>
            <span className="budget-pie-legend-pct">{seg.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

import { SIZE_OPTIONS, getSizeOption } from '../../data/cupOptions'

const SIZE_SHORT = ['S', 'M', 'L', 'XL']

export default function SizeSlider({ value, onChange }) {
  const index = Math.max(0, SIZE_OPTIONS.findIndex((s) => s.id === value))
  const selected = getSizeOption(value) ?? SIZE_OPTIONS[1]
  const fillPercent = (index / (SIZE_OPTIONS.length - 1)) * 100

  function handleChange(e) {
    const nextIndex = Number(e.target.value)
    onChange(SIZE_OPTIONS[nextIndex].id)
  }

  return (
    <div className="sipspend-size-box">
      <div className="sipspend-size-visual" aria-hidden>
        <div
          className="sipspend-size-cup"
          style={{ transform: `scale(${0.72 + selected.multiplier * 0.22})` }}
        >
          <svg viewBox="0 0 48 56" fill="none">
            <path
              d="M10 18 H38 L34 46 C33 50 29 52 24 52 C19 52 15 50 14 46 Z"
              fill="#F0ECE6"
              stroke="#2C2520"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <ellipse cx="24" cy="20" rx="12" ry="3" fill="#C5A880" />
            <path d="M38 22 C44 22 45 34 37 36" stroke="#2C2520" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="sipspend-size-readout">
        <span className="sipspend-size-name">{selected.label}</span>
        <span className="sipspend-size-detail">{selected.volumeMl} ml est.</span>
      </div>

      <div className="sipspend-size-track-wrap">
        <div className="sipspend-size-track-bg">
          <div className="sipspend-size-track-fill" style={{ width: `${fillPercent}%` }} />
        </div>
        <input
          type="range"
          className="sipspend-size-range"
          min={0}
          max={SIZE_OPTIONS.length - 1}
          step={1}
          value={index}
          onChange={handleChange}
          aria-label="Cup size"
          aria-valuetext={selected.label}
        />
        <div className="sipspend-size-ticks" aria-hidden>
          {SIZE_OPTIONS.map((size, i) => (
            <button
              key={size.id}
              type="button"
              className={`sipspend-size-tick${i === index ? ' active' : ''}`}
              onClick={() => onChange(size.id)}
            >
              <span className="sipspend-size-tick-dot" />
              <span className="sipspend-size-tick-label">{SIZE_SHORT[i]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

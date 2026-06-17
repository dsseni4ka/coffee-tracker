import { useEffect, useRef, useState } from 'react'
import { SIZE_OPTIONS, getSizeOption } from '../../data/cupOptions'
import { useAxisLockGesture } from '../../hooks/useAxisLockGesture'

const SIZE_SHORT = ['S', 'M', 'L', 'XL']
const STICKER_BASE_PX = 64
const MIN_SCALE = 0.5
const MAX_SCALE = 1.2

function preserveSheetScroll(run) {
  const body = document.querySelector('.sipspend-body')
  const top = body?.scrollTop ?? 0
  run()
  requestAnimationFrame(() => {
    if (body) body.scrollTop = top
    requestAnimationFrame(() => {
      if (body) body.scrollTop = top
    })
  })
}

export default function SizeSlider({ value, onChange, drinkSticker }) {
  const index = Math.max(0, SIZE_OPTIONS.findIndex((s) => s.id === value))
  const selected = getSizeOption(value) ?? SIZE_OPTIONS[1]
  const fillPercent = (index / (SIZE_OPTIONS.length - 1)) * 100
  const sizeScale =
    MIN_SCALE + (index / (SIZE_OPTIONS.length - 1)) * (MAX_SCALE - MIN_SCALE)
  const stickerSize = STICKER_BASE_PX * sizeScale
  const [drinkSettling, setDrinkSettling] = useState(false)
  const prevSticker = useRef(drinkSticker)
  const { onPointerDown } = useAxisLockGesture()

  useEffect(() => {
    if (prevSticker.current === drinkSticker) return
    prevSticker.current = drinkSticker
    setDrinkSettling(true)
    const timer = setTimeout(() => setDrinkSettling(false), 520)
    return () => clearTimeout(timer)
  }, [drinkSticker])

  function handleChange(e) {
    preserveSheetScroll(() => onChange(SIZE_OPTIONS[Number(e.target.value)].id))
  }

  function selectSize(sizeId) {
    preserveSheetScroll(() => onChange(sizeId))
  }

  return (
    <div className="sipspend-size-box">
      <div className="sipspend-size-hero">
        <div className="sipspend-size-visual" aria-hidden>
          <div className="sipspend-size-stage">
            <div
              className="sipspend-size-cup"
              style={{ '--sticker-size': `${stickerSize}px` }}
            >
              <div
                className={`sipspend-size-sticker-wrap${drinkSettling ? ' sipspend-size-sticker-wrap--settle' : ''}`}
              >
                <img
                  key={drinkSticker}
                  src={drinkSticker}
                  alt=""
                  className="sipspend-size-sticker"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sipspend-size-readout">
          <span className="sipspend-size-name">{selected.label}</span>
          <span className="sipspend-size-detail">{selected.volumeMl} ml est.</span>
        </div>
      </div>

      <div className="sipspend-size-track-wrap" onPointerDown={onPointerDown}>
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
            <div
              key={size.id}
              role="button"
              tabIndex={-1}
              className={`sipspend-size-tick${i === index ? ' active' : ''}`}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => selectSize(size.id)}
            >
              <span className="sipspend-size-tick-dot" />
              <span className="sipspend-size-tick-label">{SIZE_SHORT[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

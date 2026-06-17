import { useEffect, useRef, useState } from 'react'
import { formatAmount } from '../../utils/format'

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

function TallyDigit({ digit }) {
  const index = Math.max(0, DIGITS.indexOf(digit))

  return (
    <span className="tally-digit" aria-hidden>
      <span
        className="tally-digit-strip"
        style={{ transform: `translateY(-${index * 10}%)` }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="tally-digit-cell">
            {d}
          </span>
        ))}
      </span>
    </span>
  )
}

export default function TallyAmount({ value, animateOnMount = false, className = '' }) {
  const [displayValue, setDisplayValue] = useState(() => (animateOnMount ? 0 : value))
  const [ticking, setTicking] = useState(false)
  const prevValue = useRef(animateOnMount ? 0 : value)
  const mountPlayed = useRef(false)

  useEffect(() => {
    if (animateOnMount && !mountPlayed.current) {
      mountPlayed.current = true
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          prevValue.current = value
          setDisplayValue(value)
          setTicking(true)
          setTimeout(() => setTicking(false), 420)
        })
      })
      return () => cancelAnimationFrame(frame)
    }

    if (prevValue.current === value) return undefined
    prevValue.current = value
    setDisplayValue(value)
    setTicking(true)
    const timer = setTimeout(() => setTicking(false), 420)
    return () => clearTimeout(timer)
  }, [value, animateOnMount])

  const formatted = formatAmount(displayValue)

  return (
    <span
      className={[
        'amount',
        'tally-amount',
        ticking && 'tally-amount--tick',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={formatAmount(value)}
    >
      {formatted.split('').map((char, index) =>
        char === ',' ? (
          <span key={`sep-${index}`} className="tally-sep">
            ,
          </span>
        ) : (
          <TallyDigit key={`digit-${index}`} digit={char} />
        ),
      )}
    </span>
  )
}

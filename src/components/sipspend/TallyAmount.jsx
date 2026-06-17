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

export default function TallyAmount({ value }) {
  const formatted = formatAmount(value)
  const [ticking, setTicking] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current === value) return
    prevValue.current = value
    setTicking(true)
    const timer = setTimeout(() => setTicking(false), 420)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <span
      className={`amount tally-amount${ticking ? ' tally-amount--tick' : ''}`}
      aria-label={formatted}
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

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import TallyAmount from './sipspend/TallyAmount'
import { formatPrice } from '../utils/format'

const MAX_CENTS = 999_999

const WEEKLY_PRESETS = [25, 40, 50, 75, 100]
const MONTHLY_PRESETS = [100, 160, 200, 300, 400]

const KEYPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['back', '0', 'done'],
]

function centsToAmount(cents) {
  return Math.round(cents) / 100
}

function amountToCents(amount) {
  return Math.round(amount * 100)
}

function BackspaceIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 14l-4-4 4-4M5 10h11a4 4 0 110 8h-1"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export function AmountKeypadSheet({
  title,
  value,
  presets = [],
  minAmount = 1,
  onConfirm,
  onClose,
}) {
  const [draftCents, setDraftCents] = useState(() => amountToCents(value))
  const [entered, setEntered] = useState(false)
  const [confirmPulse, setConfirmPulse] = useState(false)

  useEffect(() => {
    setDraftCents(amountToCents(value))
    setEntered(false)
  }, [value])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const draftAmount = centsToAmount(draftCents)
  const isValid = draftAmount >= minAmount

  const appendDigit = useCallback((digit) => {
    setEntered(true)
    setDraftCents((prev) => Math.min(MAX_CENTS, prev * 10 + digit))
  }, [])

  const backspace = useCallback(() => {
    setEntered(true)
    setDraftCents((prev) => Math.floor(prev / 10))
  }, [])

  const applyPreset = useCallback((amount) => {
    setEntered(true)
    setDraftCents(amountToCents(amount))
  }, [])

  const confirm = useCallback(() => {
    if (!isValid) return
    setConfirmPulse(true)
    setTimeout(() => {
      onConfirm(draftAmount)
      onClose()
    }, 180)
  }, [draftAmount, isValid, onClose, onConfirm])

  function handleKeyPress(key) {
    if (key === 'back') {
      backspace()
      return
    }
    if (key === 'done') {
      confirm()
      return
    }
    appendDigit(Number(key))
  }

  return (
    <div className="budget-keypad-overlay" onClick={onClose} role="presentation">
      <div
        className={`budget-keypad-sheet${confirmPulse ? ' budget-keypad-sheet--confirm' : ''}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
        aria-modal="true"
      >
        <div className="budget-keypad-handle" aria-hidden />

        <header className="budget-keypad-header">
          <button type="button" className="budget-keypad-cancel" onClick={onClose}>
            Cancel
          </button>
          <h2 className="budget-keypad-title">{title}</h2>
          <button
            type="button"
            className="budget-keypad-save"
            onClick={confirm}
            disabled={!isValid}
          >
            Save
          </button>
        </header>

        <div className={`budget-keypad-display${entered ? ' budget-keypad-display--active' : ''}`}>
          <span className="budget-keypad-display-currency">€</span>
          <TallyAmount value={draftAmount} />
        </div>
        <p className="budget-keypad-hint">
          {isValid ? `Currently ${formatPrice(value)}` : `Enter at least ${formatPrice(minAmount)}`}
        </p>

        {presets.length > 0 && (
          <div className="budget-keypad-presets" role="group" aria-label="Quick amounts">
            {presets.map((amount) => (
              <button
                key={amount}
                type="button"
                className={`budget-keypad-preset${draftAmount === amount ? ' budget-keypad-preset--active' : ''}`}
                onClick={() => applyPreset(amount)}
              >
                €{amount}
              </button>
            ))}
          </div>
        )}

        <div className="budget-keypad-grid" role="group" aria-label="Number keypad">
          {KEYPAD_KEYS.flat().map((key) => {
            const isBack = key === 'back'
            const isDone = key === 'done'

            return (
              <button
                key={key}
                type="button"
                className={[
                  'budget-keypad-key',
                  isBack ? 'budget-keypad-key--back' : '',
                  isDone ? 'budget-keypad-key--done' : '',
                  !isBack && !isDone ? 'budget-keypad-key--digit' : '',
                ].join(' ')}
                onClick={() => handleKeyPress(key)}
                disabled={isDone && !isValid}
                aria-label={isBack ? 'Delete digit' : isDone ? 'Save amount' : key}
              >
                {isBack ? <BackspaceIcon /> : isDone ? <CheckIcon /> : key}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BudgetKeypadSheet({ label, value, presets, onConfirm, onClose }) {
  return (
    <AmountKeypadSheet
      title={`${label} budget`}
      value={value}
      presets={presets}
      minAmount={1}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  )
}

export default function BudgetAmountKeypad({ label, value, onChange, period = 'weekly' }) {
  const [open, setOpen] = useState(false)
  const presets = period === 'monthly' ? MONTHLY_PRESETS : WEEKLY_PRESETS
  const id = `budget-${label}`

  return (
    <>
      <div className="budget-limit-row">
        <label htmlFor={id}>{label}</label>
        <button
          type="button"
          id={id}
          className="budget-limit-trigger"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${label} budget ${formatPrice(value)}, tap to edit`}
        >
          <span className="budget-limit-trigger-inner">
            <span className="budget-limit-trigger-currency">€</span>
            <TallyAmount value={value} />
          </span>
          <span className="budget-limit-trigger-icon" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </span>
        </button>
      </div>

      {open &&
        createPortal(
          <BudgetKeypadSheet
            label={label}
            value={value}
            presets={presets}
            onConfirm={onChange}
            onClose={() => setOpen(false)}
          />,
          document.body,
        )}
    </>
  )
}

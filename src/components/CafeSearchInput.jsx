import { useEffect, useRef, useState } from 'react'
import { PinIcon } from './icons/NavIcons'
import { searchPlaces } from '../utils/placeSearch'

export default function CafeSearchInput({
  value,
  onChange,
  onSelectPlace,
  disabled,
  center,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const debounceRef = useRef(null)
  const requestIdRef = useRef(0)
  const selectedRef = useRef(null)

  useEffect(() => {
    if (disabled) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      selectedRef.current = null
      return
    }

    const trimmed = value.trim()

    if (trimmed.length < 2) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }

    if (selectedRef.current?.name === trimmed) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const requestId = ++requestIdRef.current
      setLoading(true)

      const results = await searchPlaces(trimmed, center)

      if (requestId !== requestIdRef.current) return
      if (selectedRef.current?.name === trimmed) {
        setLoading(false)
        return
      }

      setSuggestions(results)
      setOpen(results.length > 0)
      setLoading(false)
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [value, center, disabled])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(e) {
    const next = e.target.value

    if (selectedRef.current && next.trim() !== selectedRef.current.name) {
      selectedRef.current = null
      onSelectPlace?.(null)
    }

    onChange(next)
  }

  function handleSelect(place) {
    requestIdRef.current += 1
    clearTimeout(debounceRef.current)

    selectedRef.current = { id: place.id, name: place.name }
    onChange(place.name)
    onSelectPlace?.(place)
    setSuggestions([])
    setOpen(false)
    setLoading(false)
  }

  const isCommitted = selectedRef.current?.name === value.trim() && value.trim().length > 0

  return (
    <div className={`cafe-search${isCommitted ? ' cafe-search--selected' : ''}`} ref={wrapRef}>
      <div className="add-coffee-row-card add-coffee-location-input">
        <span className="add-coffee-row-icon"><PinIcon size="sm" /></span>
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          placeholder="Search place (e.g. university, Fontys)"
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (!isCommitted && suggestions.length > 0) setOpen(true)
          }}
          disabled={disabled}
          autoComplete="off"
        />
        {isCommitted && (
          <span className="cafe-search-check" aria-label="Location selected">
            ✓
          </span>
        )}
      </div>

      {loading && !isCommitted && value.trim().length >= 2 && !disabled && (
        <p className="cafe-search-hint">Searching nearby…</p>
      )}

      {open && !isCommitted && suggestions.length > 0 && (
        <ul className="cafe-search-results" role="listbox">
          {suggestions.map((place) => (
            <li key={place.id} role="option">
              <button
                type="button"
                className="cafe-search-option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(place)}
              >
                <span className="cafe-search-option-name">{place.name}</span>
                {place.subtitle && (
                  <span className="cafe-search-option-sub">{place.subtitle}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

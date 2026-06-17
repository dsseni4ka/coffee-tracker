import { useEffect, useState } from 'react'

function isLocalhost(origin) {
  return origin.includes('localhost') || origin.includes('127.0.0.1')
}

export default function PhoneLinkCard() {
  const [url, setUrl] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const { origin, pathname } = window.location

    if (!isLocalhost(origin)) {
      setUrl(`${origin}${pathname}`)
      return
    }

    if (!import.meta.env.DEV) return

    fetch('/__dev/phone-url')
      .then((res) => res.json())
      .then((data) => setUrl(data.urls?.[0] ?? null))
      .catch(() => {})
  }, [])

  if (!url) return null

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  return (
    <>
      <label className="add-coffee-field-label">Open on phone</label>
      <div className="settings-phone-card">
        <p className="settings-phone-hint">
          Copy the link, open it on your phone (same Wi‑Fi), then add to home screen.
        </p>
        <div className="settings-phone-row">
          <code className="settings-phone-url">{url}</code>
          <button type="button" className="settings-phone-copy" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy link'}
          </button>
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'

export default function UsernameLabel({ username, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(username)

  function startEdit() {
    setDraft(username)
    setEditing(true)
  }

  function commit() {
    onSave(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        className="username-input"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') setEditing(false)
        }}
        autoFocus
        maxLength={24}
        aria-label="Username"
      />
    )
  }

  return (
    <button type="button" className="username-label" onClick={startEdit}>
      {username}
    </button>
  )
}

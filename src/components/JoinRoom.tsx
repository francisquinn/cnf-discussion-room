import { useState, type FormEvent } from 'react'
import { usePresence, type Status } from '../hooks/usePresence'

const OPTIONS: Array<{ key: Exclude<Status, null>; label: string }> = [
  { key: 'clarify', label: 'Clarify' },
  { key: 'second', label: 'Second' },
  { key: 'disagree', label: 'Disagree' },
  { key: 'newpoint', label: 'New point' },
]

export function JoinRoom({ roomId }: { roomId: string }) {
  const [name, setName] = useState('')
  const [joined, setJoined] = useState(false)
  const { status, setStatus, ended } = usePresence({ roomId, name: joined ? name : undefined })

  if (!joined) {
    const handleSubmit = (event: FormEvent) => {
      event.preventDefault()
      if (name.trim()) setJoined(true)
    }

    return (
      <main className="screen">
        <h1>Join the discussion</h1>
        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            autoFocus
          />
          <button type="submit" className="button primary" disabled={!name.trim()}>
            Join
          </button>
        </form>
      </main>
    )
  }

  if (ended) {
    return (
      <main className="screen">
        <h1>Discussion ended</h1>
        <p>Thanks for taking part, {name}.</p>
      </main>
    )
  }

  return (
    <main className="screen">
      <h1>Hi {name}</h1>
      <p>Tap what you're feeling right now. Tap it again to clear it.</p>
      <div className="signal-buttons">
        {OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            className={`signal-button signal-${option.key} ${status === option.key ? 'active' : ''}`}
            onClick={() => setStatus(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </main>
  )
}

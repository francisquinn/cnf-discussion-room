import { usePresence, type Status } from '../hooks/usePresence'

const COLUMNS: Array<{ key: Exclude<Status, null>; label: string }> = [
  { key: 'clarify', label: 'Clarifying' },
  { key: 'second', label: 'Seconding' },
  { key: 'disagree', label: 'Disagreeing' },
  { key: 'newpoint', label: 'New point' },
]

export function HostDashboard({ roomId }: { roomId: string }) {
  const { participants, clearBoard, dismissParticipant, ended, endDiscussion } = usePresence({
    roomId,
  })

  const byStatus: Record<string, Array<{ key: string; name: string }>> = {
    clarify: [],
    second: [],
    disagree: [],
    newpoint: [],
    none: [],
  }
  Object.entries(participants).forEach(([key, participant]) => {
    byStatus[participant.status ?? 'none'].push({ key, name: participant.name })
  })

  return (
    <main className="screen host">
      <h1>Facilitator view</h1>

      {ended ? (
        <p className="muted">
          Discussion ended — this is the final snapshot, nothing further is being tracked.
        </p>
      ) : (
        <div className="host-actions">
          <button type="button" className="button" onClick={clearBoard}>
            New point (clear board)
          </button>
          <button
            type="button"
            className="button danger"
            onClick={() => {
              if (window.confirm('End the discussion for everyone?')) endDiscussion()
            }}
          >
            End discussion
          </button>
        </div>
      )}

      <div className="columns">
        {COLUMNS.map((column) => (
          <div key={column.key} className={`column column-${column.key}`}>
            <h2>{column.label}</h2>
            <ul>
              {byStatus[column.key].map((person) => (
                <li key={person.key}>
                  {person.name}
                  {!ended && (
                    <button
                      type="button"
                      className="dismiss"
                      aria-label={`Dismiss ${person.name}'s signal`}
                      title="Mark resolved / clear their signal"
                      onClick={() => dismissParticipant(person.key)}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="muted">
        Not signaling: {byStatus.none.map((person) => person.name).join(', ') || '—'}
      </p>
    </main>
  )
}

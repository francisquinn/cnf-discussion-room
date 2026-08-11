import { usePresence, type Status } from '../hooks/usePresence'

const COLUMNS: Array<{ key: Exclude<Status, null>; label: string }> = [
  { key: 'clarify', label: 'Clarifying' },
  { key: 'second', label: 'Seconding' },
  { key: 'disagree', label: 'Disagreeing' },
]

export function HostDashboard({ roomId }: { roomId: string }) {
  const { participants, clearBoard, ended, endDiscussion } = usePresence({ roomId })

  const byStatus: Record<string, string[]> = { clarify: [], second: [], disagree: [], none: [] }
  Object.values(participants).forEach((participant) => {
    byStatus[participant.status ?? 'none'].push(participant.name)
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
              {byStatus[column.key].map((personName) => (
                <li key={personName}>{personName}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="muted">Not signaling: {byStatus.none.join(', ') || '—'}</p>
    </main>
  )
}

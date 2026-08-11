import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export type Status = 'clarify' | 'second' | 'disagree' | null

export interface Participant {
  name: string
  status: Status
}

interface UsePresenceOptions {
  roomId: string
  // Omit `name` for a read-only observer (the facilitator dashboard) — it
  // still subscribes and receives everyone else's live state, it just never
  // tracks a presence of its own.
  name?: string
}

interface UsePresenceResult {
  participants: Record<string, Participant>
  status: Status
  setStatus: (next: Exclude<Status, null>) => void
  clearBoard: () => void
}

export function usePresence({ roomId, name }: UsePresenceOptions): UsePresenceResult {
  const [participants, setParticipants] = useState<Record<string, Participant>>({})
  const [status, setStatusState] = useState<Status>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const clientIdRef = useRef(crypto.randomUUID())

  useEffect(() => {
    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: clientIdRef.current } },
    })
    channelRef.current = channel

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<Participant>()
        const next: Record<string, Participant> = {}
        for (const key in state) {
          const metas = state[key]
          const latest = metas[metas.length - 1]
          if (latest) next[key] = { name: latest.name, status: latest.status }
        }
        setParticipants(next)
      })
      .on('broadcast', { event: 'clear' }, () => {
        setStatusState(null)
      })
      .subscribe((subStatus) => {
        if (subStatus === 'SUBSCRIBED' && name) {
          channel.track({ name, status: null } satisfies Participant)
        }
      })

    return () => {
      channel.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId])

  // Push local status changes out as they happen (facilitator has no `name`,
  // so this is a no-op for the dashboard view).
  useEffect(() => {
    if (name) {
      channelRef.current?.track({ name, status } satisfies Participant)
    }
  }, [status, name])

  const setStatus = (next: Exclude<Status, null>) => {
    setStatusState((current) => (current === next ? null : next))
  }

  // Facilitator-only: tell every connected client to reset to neutral for a
  // new point. Each client resets its own status on receiving it.
  const clearBoard = () => {
    channelRef.current?.send({ type: 'broadcast', event: 'clear', payload: {} })
  }

  return { participants, status, setStatus, clearBoard }
}

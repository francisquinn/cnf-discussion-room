import { useEffect, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export type Status = 'clarify' | 'second' | 'disagree' | 'newpoint' | null

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
  dismissParticipant: (key: string) => void
  ended: boolean
  endDiscussion: () => void
}

export function usePresence({ roomId, name }: UsePresenceOptions): UsePresenceResult {
  const [participants, setParticipants] = useState<Record<string, Participant>>({})
  const [status, setStatusState] = useState<Status>(null)
  const [ended, setEnded] = useState(false)
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
      .on('broadcast', { event: 'dismiss' }, ({ payload }) => {
        if (payload?.key === clientIdRef.current) setStatusState(null)
      })
      .on('broadcast', { event: 'end' }, () => {
        setEnded(true)
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

  // Facilitator-only: reset one person's signal, e.g. their clarifying
  // question got answered out loud but they forgot to tap it off. Targeted
  // by presence key so nobody else's status is touched. Self-correcting if
  // it's ever wrong — the person just taps their button again.
  const dismissParticipant = (key: string) => {
    channelRef.current?.send({ type: 'broadcast', event: 'dismiss', payload: { key } })
  }

  // Facilitator-only: close out the room. Nothing is persisted, so this is
  // just a signal everyone reacts to locally — there's no server-side
  // "closed" state to clean up.
  const endDiscussion = () => {
    setEnded(true)
    channelRef.current?.send({ type: 'broadcast', event: 'end', payload: {} })
  }

  return { participants, status, setStatus, clearBoard, dismissParticipant, ended, endDiscussion }
}

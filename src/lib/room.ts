// Short, URL-friendly room id. Rooms are purely ephemeral (live Presence
// state only, nothing persisted), so this only needs to avoid collisions
// among rooms open at the same time — a 6-character base36 string is fine.
export function generateRoomId(): string {
  return Math.random().toString(36).slice(2, 8)
}

export function joinUrl(roomId: string): string {
  return `${window.location.origin}/join/${roomId}`
}

export function hostUrl(roomId: string): string {
  return `${window.location.origin}/host/${roomId}`
}

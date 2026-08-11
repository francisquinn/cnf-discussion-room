import { useMemo } from 'react'
import { CreateRoom } from './components/CreateRoom'
import { JoinRoom } from './components/JoinRoom'
import { HostDashboard } from './components/HostDashboard'

type Route =
  | { view: 'create' }
  | { view: 'join'; roomId: string }
  | { view: 'host'; roomId: string }

function parseRoute(pathname: string): Route {
  const join = pathname.match(/^\/join\/([a-zA-Z0-9]+)\/?$/)
  if (join) return { view: 'join', roomId: join[1] }

  const host = pathname.match(/^\/host\/([a-zA-Z0-9]+)\/?$/)
  if (host) return { view: 'host', roomId: host[1] }

  return { view: 'create' }
}

// No router library — there are only three screens and none of them need
// history/back-button behavior beyond what a plain link already gives.
export default function App() {
  const route = useMemo(() => parseRoute(window.location.pathname), [])

  switch (route.view) {
    case 'join':
      return <JoinRoom roomId={route.roomId} />
    case 'host':
      return <HostDashboard roomId={route.roomId} />
    default:
      return <CreateRoom />
  }
}

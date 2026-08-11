import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { generateRoomId, hostUrl, joinUrl } from '../lib/room'

export function CreateRoom() {
  const [roomId] = useState(() => generateRoomId())
  const link = joinUrl(roomId)

  return (
    <main className="screen">
      <h1>Start a discussion room</h1>
      <p>
        Share this link with the group beforehand — WhatsApp, event reminder,
        whatever's easiest:
      </p>
      <div className="link-box">{link}</div>

      <p>Or let a last-minute walk-in scan this straight off your phone:</p>
      <div className="qr-box">
        <QRCodeSVG value={link} size={180} />
      </div>

      <a className="button primary" href={hostUrl(roomId)}>
        Open facilitator view →
      </a>
    </main>
  )
}

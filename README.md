# CNF Discussion Room

A live helper for Club na Fealsúnachta's in-person discussions. Jackbox-style
in spirit — join a room from your phone, no accounts — but for reading the
room during a philosophy discussion instead of playing a game.

Each participant gets three buttons: **Clarify / Second / Disagree**. The
facilitator gets a live, named view of who's currently signaling what. It's a
helper for the facilitator, not a substitute — no turn queue, no scoring.

## How it works

- **Create a room** at `/` — generates a room id, shows a shareable join link
  and a QR code (for a last-minute walk-in to scan straight off the
  facilitator's phone, no shared screen needed).
- **Join** at `/join/:roomId` — enter a name, then tap Clarify / Second /
  Disagree. Tapping the active one again clears it. Your status is live —
  it stays lit until you change it or the facilitator clears the board.
- **Facilitator view** at `/host/:roomId` — see everyone's current status by
  name, plus a "new point" button that clears everyone back to neutral.

Everything is live/ephemeral by design — nothing is stored once the room
empties. There's no database table, no schema, no auth: the whole "backend"
is a [Supabase Realtime](https://supabase.com/docs/guides/realtime) Presence
channel, reusing CNF's existing Supabase project.

## Stack

Vite + React + TypeScript, `@supabase/supabase-js` (Presence + Broadcast
only), `qrcode.react`. No router library — there are only three screens, so
`App.tsx` reads `window.location.pathname` directly.

## Setup

```sh
npm install
cp .env.example .env.local   # fill in CNF's Supabase project URL + anon key
npm run dev
```

Deploying as a static site needs an SPA fallback so `/join/:id` and
`/host/:id` resolve on a hard refresh — `public/_redirects` already covers
Netlify; add the equivalent rewrite if hosting elsewhere.

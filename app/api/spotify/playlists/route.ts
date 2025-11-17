import { NextResponse } from 'next/server'
import { getSpotifyToken } from '@/lib/getSpotifyToken'


export async function GET (req: Request) {
  const token = getSpotifyToken(req)

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
    headers: { Authorization: 'Bearer ' + token }
  })

  const data = await res.json()
  return NextResponse.json(data)
}

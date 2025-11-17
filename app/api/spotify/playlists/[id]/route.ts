import { NextResponse } from 'next/server'
import { getSpotifyToken } from '@/lib/getSpotifyToken'

export async function GET (
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = getSpotifyToken(req)

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const playlistId = params.id

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: { Authorization: 'Bearer ' + token }
    }
  )

  const data = await res.json()

  // Extract important bits
  const tracks = data.items.map((item: any) => ({
    name: item.track.name,
    artists: item.track.artists.map((a: any) => a.name).join(', '),
    album: item.track.album.name,
    isrc: item.track.external_ids?.isrc || null,
    duration_ms: item.track.duration_ms,
    spotify_id: item.track.id
  }))

  return NextResponse.json({ tracks })
}

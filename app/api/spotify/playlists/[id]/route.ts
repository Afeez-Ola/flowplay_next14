import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET (
  req: Request,
  { params }: { params: { id: string } }
) {
  // Always read from real server-side cookies (App Router)
  let spotifyToken = cookies().get('spotify_access_token')?.value || null;

  // Fallback for manual cookie forwarding (from convert → playlist)
  if (!spotifyToken) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/spotify_access_token=([^;]+)/);
    spotifyToken = match?.[1] || null;
  }

  if (!spotifyToken) {
    return NextResponse.json(
      { error: 'Spotify not authenticated' },
      { status: 401 }
    );
  }

  const playlistId = params.id

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    {
      headers: { Authorization: 'Bearer ' + spotifyToken }
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

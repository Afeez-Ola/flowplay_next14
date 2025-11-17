import { NextResponse } from 'next/server'
import { getSpotifyToken } from '@/lib/getSpotifyToken'

function getYoutubeToken (req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(/youtube_access_token=([^;]+)/)
  return match?.[1] || null
}

export async function POST (req: Request) {
  try {
    const { url, from, to, playlistName } = await req.json()

    if (!url || !from || !to) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (from === to) {
      return NextResponse.json(
        { error: 'Source and destination cannot be the same' },
        { status: 400 }
      )
    }

    if (from !== 'Spotify') {
      return NextResponse.json(
        { error: 'Only Spotify as source is implemented right now' },
        { status: 400 }
      )
    }

    // Extract Spotify playlist ID
    const match = url.match(/playlist\/([A-Za-z0-9]+)/)
    const playlistId = match ? match[1] : null

    if (!playlistId) {
      return NextResponse.json(
        { error: 'Could not extract Spotify playlist ID from URL' },
        { status: 400 }
      )
    }

    // Get Spotify token
    const spotifyToken = getSpotifyToken(req)
    if (!spotifyToken) {
      return NextResponse.json(
        { error: 'Spotify not authenticated' },
        { status: 401 }
      )
    }

    // Fetch tracks
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000'

    const trackRes = await fetch(
      `${appUrl}/api/spotify/playlists/${playlistId}`,
      {
        headers: {
          cookie: req.headers.get('cookie') || ''
        }
      }
    )

    if (!trackRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Spotify tracks' },
        { status: 500 }
      )
    }

    const trackData = await trackRes.json()
    const tracks: any[] = trackData.tracks || []

    if (!tracks.length) {
      return NextResponse.json(
        { error: 'No tracks found in Spotify playlist' },
        { status: 400 }
      )
    }

    // ROUTING LOGIC
    if (to === 'Apple Music') {
      const result = await convertToAppleMusic(tracks, playlistName)
      return NextResponse.json(result)
    }

    if (to === 'YouTube Music') {
      const youtubeToken = getYoutubeToken(req)
      if (!youtubeToken) {
        return NextResponse.json(
          { error: 'YouTube not authenticated' },
          { status: 401 }
        )
      }

      const result = await convertToYouTube(tracks, youtubeToken, playlistName)
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { error: `Target platform '${to}' not implemented yet` },
      { status: 400 }
    )

  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}

/* ------------------- APPLE MUSIC (A1 MODE) ------------------- */

async function convertToAppleMusic (tracks: any[], playlistName?: string) {
  const REGIONS = ['us', 'gb', 'de', 'ng', 'fr']
  const matches: { source: any; apple: any | null }[] = []

  async function searchAppleByISRC (isrc: string) {
    for (const region of REGIONS) {
      const url = `https://itunes.apple.com/lookup?isrc=${isrc}&entity=song&country=${region}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.results?.length > 0) {
        const best = data.results[0]
        return {
          trackId: best.trackId,
          trackName: best.trackName,
          artistName: best.artistName,
          collectionName: best.collectionName,
          previewUrl: best.previewUrl,
          artworkUrl100: best.artworkUrl100,
          appleMusicUrl: best.trackViewUrl,
          region
        }
      }
    }
    return null
  }

  async function searchAppleByQuery (name: string, artists: string) {
    const q = encodeURIComponent(`${name} ${artists}`)
    for (const region of REGIONS) {
      const url = `https://itunes.apple.com/search?term=${q}&limit=1&entity=song&country=${region}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.results?.length > 0) {
        const best = data.results[0]
        return {
          trackId: best.trackId,
          trackName: best.trackName,
          artistName: best.artistName,
          collectionName: best.collectionName,
          previewUrl: best.previewUrl,
          artworkUrl100: best.artworkUrl100,
          appleMusicUrl: best.trackViewUrl,
          region
        }
      }
    }
    return null
  }

  for (const t of tracks) {
    let result = null

    // 1) Try ISRC first across multiple regions
    if (t.isrc) {
      result = await searchAppleByISRC(t.isrc)
    }

    // 2) Fallback to text query across multi-regions
    if (!result) {
      result = await searchAppleByQuery(t.name, t.artists)
    }

    matches.push({
      source: t,
      apple: result
    })
  }

  const matched = matches.filter(m => m.apple)
  const unmatched = matches.filter(m => !m.apple)

  const finalName =
    (playlistName && playlistName.trim()) || 'FlowPlay – Spotify → Apple Music'

  return {
    status: 'success',
    from: 'Spotify',
    to: 'Apple Music',
    regions_used: REGIONS,
    target_playlist_name: finalName,
    total_tracks: tracks.length,
    matched_tracks: matched.length,
    unmatched_count: unmatched.length,
    matches,
    unmatched: unmatched.map(u => ({
      name: u.source.name,
      artists: u.source.artists
    }))
  }
}


/* ------------------- YOUTUBE MUSIC ------------------- */

async function convertToYouTube(
  tracks: any[],
  youtubeToken: string,
  playlistName?: string
) {
  const matches: { source: any; videoId: string | null }[] = []

  for (const t of tracks) {
    const query = encodeURIComponent(`${t.name} ${t.artists}`)
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${query}`,
      {
        headers: {
          Authorization: `Bearer ${youtubeToken}`
        }
      }
    )

    const data = await res.json()
    const videoId =
      data.items?.length > 0 ? data.items[0].id?.videoId ?? null : null

    matches.push({
      source: t,
      videoId
    })
  }

  const matched = matches.filter(m => m.videoId)
  const unmatched = matches.filter(m => !m.videoId)

  return {
    status: "partial",
    note: "YouTube conversion is implemented but may fail due to API quota.",
    total_tracks: tracks.length,
    matched_tracks: matched.length,
    unmatched: unmatched.map(u => ({
      name: u.source.name,
      artists: u.source.artists
    }))
  }
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function getYoutubeToken() {
  return cookies().get('youtube_access_token')?.value || null;
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
    const spotifyToken = cookies().get('spotify_access_token')?.value || null;
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
        credentials: "include",
        headers: {
          Cookie: cookies().toString()
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
      const youtubeToken = getYoutubeToken()
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

/* ------------------- APPLE MUSIC (A1 MODE, CLEANED) ------------------- */

async function convertToAppleMusic(tracks: any[], playlistName?: string) {
  // Multi-region search improves match accuracy significantly
  const REGIONS = ["us", "gb", "de", "ng", "fr"]
  const matches: { source: any; apple: any | null }[] = []

  /** -------------- HELPERS -------------- **/

  // Search by ISRC (best accuracy — exact match)
  async function searchByISRC(isrc: string) {
    for (const region of REGIONS) {
      const url = `https://itunes.apple.com/lookup?isrc=${isrc}&entity=song&country=${region}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.results?.length > 0) {
        const best = data.results[0]
        return formatAppleResult(best, region)
      }
    }
    return null
  }

  // Search by text query (fallback when no ISRC or no match)
  async function searchByQuery(name: string, artists: string) {
    const q = encodeURIComponent(`${name} ${artists}`)
    for (const region of REGIONS) {
      const url = `https://itunes.apple.com/search?term=${q}&limit=1&entity=song&country=${region}`
      const res = await fetch(url)
      const data = await res.json()

      if (data.results?.length > 0) {
        const best = data.results[0]
        return formatAppleResult(best, region)
      }
    }
    return null
  }

  // Format Apple Music API response into a clean object
  function formatAppleResult(best: any, region: string) {
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

  /** -------------- MAIN MATCHING LOOP -------------- **/

  for (const t of tracks) {
    let result = null

    // Try ISRC first (best)
    if (t.isrc) {
      result = await searchByISRC(t.isrc)
    }

    // Fallback: search by name+artist in all regions
    if (!result) {
      result = await searchByQuery(t.name, t.artists)
    }

    matches.push({ source: t, apple: result })
  }

  /** -------------- SUMMARY -------------- **/

  const matched = matches.filter(m => m.apple)
  const unmatched = matches.filter(m => !m.apple)

  const finalName =
    (playlistName && playlistName.trim()) ||
    "FlowPlay – Spotify → Apple Music"

  return {
    status: "success",
    from: "Spotify",
    to: "Apple Music",
    target_playlist_name: finalName,
    playlist_name: finalName,
    regions_used: REGIONS,
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

/* ------------------- YOUTUBE MUSIC ------------------- */

async function convertToYouTube (
  tracks: any[],
  youtubeToken: string,
  playlistName?: string
) {
  const matches: { source: any; videoId: string | null; youtube: any | null }[] = [];
  // --- ISRC MATCHING (HIGHEST ACCURACY) ---
  async function searchYouTubeByISRC(isrc: string) {
    // YouTube API supports "isrc:XXXXX" advanced queries
    const encoded = encodeURIComponent(`isrc:${isrc}`);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=1&q=${encoded}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${youtubeToken}`,
        },
      }
    );

    const data = await res.json();
    if (data.items?.length > 0) {
      return data.items[0];
    }
    return null;
  }

  // 1) Enhanced YouTube matching engine
  for (const t of tracks) {
    // Try ISRC first
    let bestItem = null;

    if (t.isrc) {
      bestItem = await searchYouTubeByISRC(t.isrc);
    }

    // Only do text search if ISRC didn't match
    if (!bestItem) {
      const queries = [
        `${t.name} ${t.artists} audio`,
        `${t.name} ${t.artists} official audio`,
        `${t.artists} ${t.name} lyric`,
        `${t.name} ${t.artists} topic`,
        `${t.name} ${t.artists} auto-generated`,
      ];

      // Try multiple search patterns, stop at first valid match
      for (const q of queries) {
        const encoded = encodeURIComponent(q);
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=1&q=${encoded}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${youtubeToken}`,
            },
          }
        );

        const data = await res.json();
        if (data.items?.length > 0) {
          bestItem = data.items[0];
          break;
        }
      }
    }

    const videoId = bestItem?.id?.videoId ?? null;
    const snippet = bestItem?.snippet;

    const youtube =
      videoId != null
        ? {
            videoId,
            title: snippet?.title ?? t.name,
            channelTitle: snippet?.channelTitle ?? null,
            thumbnailUrl:
              snippet?.thumbnails?.medium?.url ??
              snippet?.thumbnails?.high?.url ??
              snippet?.thumbnails?.default?.url ??
              null,
            watchUrl: `https://music.youtube.com/watch?v=${videoId}`,
          }
        : null;

    matches.push({
      source: t,
      videoId,
      youtube,
    });
  }

  const matched = matches.filter(m => m.videoId)
  const unmatched = matches.filter(m => !m.videoId)

  // 2) Create YouTube playlist
  const finalName =
    (playlistName && playlistName.trim()) ||
    'FlowPlay – Spotify → YouTube Music'

  const createRes = await fetch(
    'https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${youtubeToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          title: finalName,
          description:
            'Converted with FlowPlay – Playlist Converter (Spotify → YouTube Music)'
        },
        status: {
          privacyStatus: 'private'
        }
      })
    }
  )

  const createData = await createRes.json()
  const newPlaylistId = createData.id

  // 3) Insert matched videos into created playlist
  for (const m of matched) {
    if (!m.videoId) continue

    await fetch(
      'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${youtubeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snippet: {
            playlistId: newPlaylistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: m.videoId
            }
          }
        })
      }
    )
  }

  // 4) Return result (mirror Apple Music structure)
  return {
    status: 'success',
    from: 'Spotify',
    to: 'YouTube Music',
    playlist_id: newPlaylistId,
    playlist_url: `https://music.youtube.com/playlist?list=${newPlaylistId}`,
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

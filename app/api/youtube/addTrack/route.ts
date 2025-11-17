import { NextResponse } from 'next/server'

export async function POST (req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const token = cookie.match(/youtube_access_token=([^;]+)/)?.[1]

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { playlistId, videoId } = await req.json()

  const res = await fetch(
    'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId
          }
        }
      })
    }
  )

  const data = await res.json()
  return NextResponse.json(data)
}

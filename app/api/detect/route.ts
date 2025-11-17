import { NextResponse } from 'next/server'

export async function POST (req: Request) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
    }

    let provider = 'unknown'

    if (url.includes('spotify.com')) provider = 'spotify'
    else if (url.includes('music.apple.com')) provider = 'applemusic'
    else if (url.includes('youtube.com') || url.includes('youtu.be'))
      provider = 'youtube'

    return NextResponse.json({ provider })
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 500 })
  }
}

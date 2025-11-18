import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET () {
  try {
    // Retrieve tokens from cookies (update names to match your auth flow)
    const spotifyToken = cookies().get('spotify_access_token')?.value
    const youtubeToken = cookies().get('youtube_access_token')?.value

    return NextResponse.json({
      spotify: Boolean(spotifyToken),
      youtube: Boolean(youtubeToken)
    })
  } catch (error) {
    console.error('Auth status error:', error)
    return NextResponse.json(
      { spotify: false, youtube: false },
      { status: 500 }
    )
  }
}

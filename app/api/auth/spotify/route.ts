import { NextResponse } from 'next/server'

const SCOPE = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-library-read'
].join(' ')

export async function GET () {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    scope: SCOPE
  })

  return NextResponse.redirect(
    'https://accounts.spotify.com/authorize?' + params.toString()
  )
}

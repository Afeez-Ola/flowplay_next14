import { NextResponse } from 'next/server'

export async function GET (req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(/spotify_access_token=([^;]+)/)
  const token = match?.[1]

  if (!token)
    return NextResponse.json({ error: 'No access token' }, { status: 401 })

  const res = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: 'Bearer ' + token }
  })

  const data = await res.json()
  return NextResponse.json(data)
}



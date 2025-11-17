import { NextResponse } from 'next/server'

export async function GET (req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ':' +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI!
    })
  })

  const tokens = await tokenRes.json()

  // Save tokens in secure httpOnly cookies
  const response = NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL!)
  response.cookies.set('spotify_access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    path: '/'
  })
  response.cookies.set('spotify_refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    path: '/'
  })

  return response
}

import { NextResponse } from 'next/server'

export async function GET (req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 })
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID!,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
      redirect_uri: process.env.YOUTUBE_REDIRECT_URI!,
      grant_type: 'authorization_code'
    })
  })

  const tokens = await tokenRes.json()

  const response = NextResponse.redirect(process.env.NEXT_PUBLIC_APP_URL!)

  response.cookies.set('youtube_access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    path: '/'
  })

  response.cookies.set('youtube_refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    path: '/'
  })

  return response
}

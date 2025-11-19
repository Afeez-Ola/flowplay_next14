import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET (req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL('/convert?error=spotify_auth', req.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(new URL('/convert?error=no_code', req.url))
    }

    // Exchange AUTH CODE for ACCESS TOKEN
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

    const tokenJson = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('Spotify token error:', tokenJson)
      return NextResponse.redirect(
        new URL('/convert?error=spotify_token', req.url)
      )
    }

    // Store tokens in secure HTTP-only cookies
    const accessToken = tokenJson.access_token
    const refreshToken = tokenJson.refresh_token

    const cookieOpts = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/'
    }

    cookies().set('spotify_access_token', accessToken, cookieOpts)
    cookies().set('spotify_refresh_token', refreshToken, cookieOpts)

    return NextResponse.redirect(new URL('/convert?connected=spotify', req.url))
  } catch (err) {
    console.error('Spotify callback error:', err)
    return NextResponse.redirect(
      new URL('/convert?error=spotify_callback', req.url)
    )
  }
}

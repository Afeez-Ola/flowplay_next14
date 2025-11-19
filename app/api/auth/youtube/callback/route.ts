import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET (req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL('/convert?error=youtube_auth', req.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(new URL('/convert?error=no_code', req.url))
    }

    // Exchange AUTH CODE for ACCESS TOKEN
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.YT_CLIENT_ID!,
        client_secret: process.env.YT_CLIENT_SECRET!,
        redirect_uri: process.env.YT_REDIRECT_URI!,
        grant_type: 'authorization_code'
      })
    })

    const tokenJson = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('YouTube token error:', tokenJson)
      return NextResponse.redirect(
        new URL('/convert?error=youtube_token', req.url)
      )
    }

    const accessToken = tokenJson.access_token
    const refreshToken = tokenJson.refresh_token

    const cookieOpts = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/'
    }

    cookies().set('youtube_access_token', accessToken, cookieOpts)
    cookies().set('youtube_refresh_token', refreshToken, cookieOpts)

    return NextResponse.redirect(new URL('/convert?connected=youtube', req.url))
  } catch (err) {
    console.error('YouTube callback error:', err)
    return NextResponse.redirect(
      new URL('/convert?error=youtube_callback', req.url)
    )
  }
}

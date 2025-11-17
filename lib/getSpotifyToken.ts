export function getSpotifyToken (req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.match(/spotify_access_token=([^;]+)/)
  return match?.[1] || null
}

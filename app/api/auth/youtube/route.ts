import { NextResponse } from 'next/server'

export async function GET () {
  const params = new URLSearchParams({
    client_id: process.env.YOUTUBE_CLIENT_ID!,
    redirect_uri: process.env.YOUTUBE_REDIRECT_URI!,
    response_type: 'code',
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ].join(' '),
    prompt: 'consent'
  })

  const authUrl =
    'https://accounts.google.com/o/oauth2/v2/auth?' + params.toString();

  const html = `
    <html>
      <body>
        <script>
          window.location.href = "${authUrl}";
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html" }
  });
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const rawPath = params.path ? params.path.join('/') : ''
    const apiBase = process.env.API_URL || 'http://api:4000'
    const targetUrl = `${apiBase}/uploads/${rawPath}`

    const res = await fetch(targetUrl, {
      headers: {
        'Accept': request.headers.get('Accept') || '*/*',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      // Fallback: try localhost:4000 if running locally outside docker
      if (apiBase === 'http://api:4000') {
        const localRes = await fetch(`http://localhost:4000/uploads/${rawPath}`).catch(() => null)
        if (localRes && localRes.ok) {
          const blob = await localRes.blob()
          return new NextResponse(blob, {
            status: 200,
            headers: {
              'Content-Type': localRes.headers.get('Content-Type') || 'application/octet-stream',
              'Cache-Control': 'public, max-age=86400, immutable',
            },
          })
        }
      }
      return new NextResponse('Asset Not Found', { status: res.status })
    }

    const blob = await res.blob()
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    })
  } catch (error) {
    console.error('Error proxying upload asset:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

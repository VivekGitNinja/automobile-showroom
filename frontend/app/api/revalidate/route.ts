import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { path, tag } = body

    if (!path && !tag) {
      return NextResponse.json({ message: 'Missing path or tag' }, { status: 400 })
    }

    if (path) {
      revalidatePath(path)
    }

    if (tag) {
      revalidateTag(tag)
    }

    return NextResponse.json({ revalidated: true, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Error parsing body' }, { status: 400 })
  }
}

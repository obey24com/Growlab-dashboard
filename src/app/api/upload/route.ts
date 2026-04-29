import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ORIGINAL_BUCKET = 'demo-media-original'
const THUMBNAIL_BUCKET = 'demo-media-thumbnail'

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid form data' },
      { status: 400 }
    )
  }

  const original = formData.get('original')
  const thumbnail = formData.get('thumbnail')
  const batchCode = (formData.get('batchCode') as string) || 'unassigned'

  if (!(original instanceof File) || !(thumbnail instanceof File)) {
    return NextResponse.json(
      { success: false, error: 'Both `original` and `thumbnail` files are required' },
      { status: 400 }
    )
  }

  const ext = original.name.split('.').pop() || 'jpg'
  const key = `${user.id}/${batchCode}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const originalUpload = await supabase.storage
    .from(ORIGINAL_BUCKET)
    .upload(key, original, {
      contentType: original.type,
      upsert: false,
    })

  if (originalUpload.error) {
    return NextResponse.json(
      { success: false, error: `Original upload failed: ${originalUpload.error.message}` },
      { status: 500 }
    )
  }

  const thumbnailUpload = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(key, thumbnail, {
      contentType: thumbnail.type,
      upsert: false,
    })

  if (thumbnailUpload.error) {
    // Best-effort cleanup of the original since the pair is incomplete
    await supabase.storage.from(ORIGINAL_BUCKET).remove([key])
    return NextResponse.json(
      { success: false, error: `Thumbnail upload failed: ${thumbnailUpload.error.message}` },
      { status: 500 }
    )
  }

  const { data: thumbPublic } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(key)

  return NextResponse.json({
    success: true,
    storage_path_original: key,
    storage_path_thumbnail: key,
    thumbnail_public_url: thumbPublic.publicUrl,
    file_name: original.name,
    mime_type: original.type,
    file_size_bytes: original.size,
  })
}

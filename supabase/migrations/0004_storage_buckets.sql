-- =====================================================
-- 0004: Storage buckets + access policies
-- =====================================================
-- Creates the two media buckets the demo uses:
--   - demo-media-original   : private, up to 50 MB
--   - demo-media-thumbnail  : public-read, up to 500 KB
-- Storage RLS lets any authenticated user read/write originals
-- and lets anyone read thumbnails. The application already gates
-- writes via the /api/upload route + role-based session checks.
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'demo-media-original',
    'demo-media-original',
    FALSE,
    52428800, -- 50 MiB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  ),
  (
    'demo-media-thumbnail',
    'demo-media-thumbnail',
    TRUE,
    524288, -- 512 KiB
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Object-level policies. RLS is already on for storage.objects.
-- =====================================================

DROP POLICY IF EXISTS "demo media original read"   ON storage.objects;
DROP POLICY IF EXISTS "demo media original write"  ON storage.objects;
DROP POLICY IF EXISTS "demo media original update" ON storage.objects;
DROP POLICY IF EXISTS "demo media original delete" ON storage.objects;
DROP POLICY IF EXISTS "demo media thumbnail read"  ON storage.objects;
DROP POLICY IF EXISTS "demo media thumbnail write" ON storage.objects;
DROP POLICY IF EXISTS "demo media thumbnail update" ON storage.objects;
DROP POLICY IF EXISTS "demo media thumbnail delete" ON storage.objects;

CREATE POLICY "demo media original read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'demo-media-original');

CREATE POLICY "demo media original write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'demo-media-original');

CREATE POLICY "demo media original update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'demo-media-original');

CREATE POLICY "demo media original delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'demo-media-original');

CREATE POLICY "demo media thumbnail read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'demo-media-thumbnail');

CREATE POLICY "demo media thumbnail write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'demo-media-thumbnail');

CREATE POLICY "demo media thumbnail update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'demo-media-thumbnail');

CREATE POLICY "demo media thumbnail delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'demo-media-thumbnail');

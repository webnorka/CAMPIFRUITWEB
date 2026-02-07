-- Migration 010: Storage Bucket Policies
-- Restrict uploads/deletes to admin role, allow public reads
-- ROLLBACK: Drop these policies from storage.objects

-- Note: This migration creates policies for the 'products' storage bucket.
-- If the bucket doesn't exist yet, create it first in Supabase Dashboard.

-- Public read access for product images
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- Admin-only upload
CREATE POLICY "Admin upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'products' AND public.is_admin()
  );

-- Admin-only update
CREATE POLICY "Admin update product images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'products' AND public.is_admin()
  );

-- Admin-only delete
CREATE POLICY "Admin delete product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'products' AND public.is_admin()
  );

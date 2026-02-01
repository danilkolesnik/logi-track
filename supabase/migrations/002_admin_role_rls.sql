-- Restrict admin-only policies to users with app_metadata.role = 'admin'
--
-- To create the first admin:
-- 1. Supabase Dashboard -> Authentication -> Users
-- 2. Select a user (or create one) -> Edit
-- 3. Under "User Metadata" / "Raw User Meta", add: { "role": "admin" }
--    Or use SQL: update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb where email = 'admin@example.com';

DROP POLICY IF EXISTS "Admins can view all access requests" ON access_requests;
DROP POLICY IF EXISTS "Admins can update access requests" ON access_requests;

CREATE POLICY "Admins can view all access requests"
  ON access_requests FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update access requests"
  ON access_requests FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

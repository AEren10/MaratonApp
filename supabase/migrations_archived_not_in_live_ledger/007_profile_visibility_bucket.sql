-- Allow users to read other users' public profile info (name, avatar) for
-- friend search / friend list joins. Without this, every search returns empty
-- and joined name/avatar columns come back null.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Wrong-question photos need to be publicly readable because the client uses
-- supabase.storage.getPublicUrl(). Otherwise getPublicUrl returns a 403 URL
-- and photos never render.
UPDATE storage.buckets SET public = true WHERE id = 'wrong-questions';

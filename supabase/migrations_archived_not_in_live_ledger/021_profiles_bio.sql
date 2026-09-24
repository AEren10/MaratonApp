-- EditProfileScreen bio alanı: kullanıcı hakkında kısa metin.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT;

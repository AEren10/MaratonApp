-- Personal wrong-question images must remain private at the bucket level.
--
-- Earlier migrations moved the client to signed URLs and narrowed SELECT
-- policies, but the bucket itself could still be public from the legacy
-- getPublicUrl() implementation. Public buckets bypass download-time RLS for
-- anyone with the asset URL, which is not appropriate for personal notebook
-- photos.

UPDATE storage.buckets
   SET public = false
 WHERE id = 'wrong-questions';

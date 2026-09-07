import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { createStorageSignedUrl } from "../../supabase/storage";

const MAX_CACHE = 100;
const TTL = 5 * 60 * 1000;
const cache = new Map();

function pruneCache() {
  if (cache.size <= MAX_CACHE) return;
  const toDelete = cache.size - MAX_CACHE;
  const iter = cache.keys();
  for (let i = 0; i < toDelete; i++) {
    cache.delete(iter.next().value);
  }
}

function resolveUrl(bucket, path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const key = `${bucket}/${path}`;
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.url;
}

export default function SignedImage({ bucket, path, style, contentFit, ...rest }) {
  const cached = resolveUrl(bucket, path);
  const [uri, setUri] = useState(cached);

  useEffect(() => {
    if (!path || path.startsWith("http") || cached) return;
    let cancelled = false;
    createStorageSignedUrl(bucket, path, 3600)
      .then((signedUrl) => {
        if (!cancelled && signedUrl) {
          cache.set(`${bucket}/${path}`, { url: signedUrl, ts: Date.now() });
          pruneCache();
          setUri(signedUrl);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [bucket, path, cached]);

  if (!uri) return null;
  return <Image source={{ uri }} style={style} contentFit={contentFit || "contain"} cachePolicy="memory-disk" {...rest} />;
}

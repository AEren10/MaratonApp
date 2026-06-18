import { useState, useEffect } from "react";
import { Image } from "expo-image";
import { supabase } from "../../supabase/client";

const cache = new Map();

function resolveUrl(bucket, path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const key = `${bucket}/${path}`;
  if (cache.has(key)) return cache.get(key);
  return null;
}

export default function SignedImage({ bucket, path, style, contentFit, ...rest }) {
  const cached = resolveUrl(bucket, path);
  const [uri, setUri] = useState(cached);

  useEffect(() => {
    if (!path || path.startsWith("http") || cached) return;
    let cancelled = false;
    supabase.storage
      .from(bucket)
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (!cancelled && data?.signedUrl) {
          cache.set(`${bucket}/${path}`, data.signedUrl);
          setUri(data.signedUrl);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [bucket, path, cached]);

  if (!uri) return null;
  return <Image source={{ uri }} style={style} contentFit={contentFit || "contain"} cachePolicy="memory-disk" {...rest} />;
}

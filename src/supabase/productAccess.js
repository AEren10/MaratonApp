import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";

export async function getProductAccessSnapshot() {
  try {
    const { data, error } = await supabase.rpc("get_product_access_snapshot");
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.reason || "Ürün erişimi alınamadı");
    return data;
  } catch (error) {
    handleSupabaseError(error, "getProductAccessSnapshot");
    throw error;
  }
}

let _cachedPublishers = null;

export async function getTrialPublishers() {
  if (_cachedPublishers) return _cachedPublishers;
  try {
    const { data, error } = await supabase
      .from("trial_publishers")
      .select("id, key, name")
      .eq("active", true)
      .order("name");
    if (error) throw error;
    _cachedPublishers = data || [];
    return _cachedPublishers;
  } catch (error) {
    handleSupabaseError(error, "getTrialPublishers");
    throw error;
  }
}


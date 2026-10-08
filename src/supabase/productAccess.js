import { supabase } from "./client";
import { handleSupabaseError } from "./handleError";
import { visiblePublisherOptions } from "../domain/trial/publisherSelection";

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

export async function getTrialPublishers() {
  try {
    const { data, error } = await supabase
      .from("trial_publishers")
      .select("id, key, name")
      .eq("active", true)
      .order("name");
    if (error) throw error;
    return visiblePublisherOptions(data || []);
  } catch (error) {
    handleSupabaseError(error, "getTrialPublishers");
    throw error;
  }
}

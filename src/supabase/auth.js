import { supabase } from "./client";

export const signUp = async ({ email, password, name }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
};

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data?.session ?? null;
};

export const updateEmail = async (email) => {
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
};

export const updatePassword = async (password) => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
};

export const signInWithAppleToken = async ({ idToken, nonce }) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: idToken,
    nonce,
  });
  if (error) throw error;
  return data;
};

export const signInWithGoogleToken = async ({ idToken }) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: idToken,
  });
  if (error) throw error;
  return data;
};

export const deleteAccount = async () => {
  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw error;
};

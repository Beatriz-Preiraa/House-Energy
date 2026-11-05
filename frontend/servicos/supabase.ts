import { createClient } from "@supabase/supabase-js";

const enderecoSupabase = process.env.EXPO_PUBLIC_SUPABASE_URL;
const chavePublicaSupabase = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!enderecoSupabase || !chavePublicaSupabase) {
  throw new Error("As variáveis do Supabase não foram configuradas.");
}

export const supabase = createClient(
  enderecoSupabase,
  chavePublicaSupabase,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
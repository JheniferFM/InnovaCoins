const SUPABASE_URL = "https://pdjaqvoxmsutfrylsaye.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_e7eBM_-PiaLzJiG_yCSCcA_9Pbhn4vQ";

if (!window.supabase?.createClient) {
  throw new Error("A biblioteca do Supabase não carregou. Confira sua conexão e recarregue o painel.");
}

window.innovaSupabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

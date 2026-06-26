import { createClient } from "@supabase/supabase-js";

// Pastikan Anda sudah membuat file .env.local yang berisi URL dan ANON KEY Supabase Anda
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

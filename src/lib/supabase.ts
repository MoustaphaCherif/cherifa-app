import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Clés à placer dans un fichier .env.local (voir .env.example).
// La clé "anon" est publique par conception : la sécurité repose sur les
// règles RLS du schéma, jamais sur le secret de cette clé.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isDemoMode = supabase === null;

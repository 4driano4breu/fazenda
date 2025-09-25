import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY
console.log('[SUPABASE] URL =', url)        // <-- debug temporário
export const supabase = createClient(url, anon)

// Configuração do Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cadxmaouujdvkypulxr.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhZHhtYW91dWpkdmt5cHVseHIiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcyNzE5NzQ5NCwiZXhwIjoyMDQyNzczNDk0fQ.VY8ts_Ub5QjKJHKOJgKJQJKJQJKJQJKJQJKJQJKJQJK';

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
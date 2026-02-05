// Configuração do Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bkqljchwxosumvfaqoaz.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWxqY2h3eG9zdW12ZmFxb2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMzY2MzUsImV4cCI6MjA4NTYxMjYzNX0.-I1Hhdfikk5SfHONNhjixmE7RbLiC9QTDLdE-tqTz1Q';

export const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
import { supabase } from '@/lib/supabase'

export default function TesteConexao() {
  async function ping() {
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1)
      console.log('PING profiles =>', { data, error })
      alert(error ? `Erro: ${error.message}` : 'OK: consegui consultar o banco')
    } catch (e) {
      console.error('PING exception:', e)
      alert(`Falhou: ${e?.message || e}`)
    }
  }
  return <button onClick={ping}>Testar conexão com o banco</button>
}

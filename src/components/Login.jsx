import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  async function onSignIn(e) {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (e) {
      // mostra a mensagem detalhada
      setErr(e?.message || String(e))
      console.error('signIn error:', e)
    } finally {
      setLoading(false)
    }
  }

  async function onSignUp(e) {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    } catch (e) {
      setErr(e?.message || String(e))
      console.error('signUp error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSignIn} style={{ display:'grid', gap:8, maxWidth:320 }}>
      <input placeholder="e-mail" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
      <button type="button" onClick={onSignUp} disabled={loading}>Criar conta</button>
      {err && <small style={{ color:'tomato' }}>{err}</small>}
    </form>
  )
}

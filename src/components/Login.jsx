// src/components/Login.jsx
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Login() {
  const [email, setEmail] = useState("")
  const [pass, setPass] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const signIn = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setMsg("")
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      })
      if (error) throw error
      setMsg("Entrando...")
    } catch (err) {
      setMsg(err.message || "Erro ao entrar")
    } finally {
      setLoading(false)
    }
  }

  const signInGoogle = async () => {
    try {
      setLoading(true)
      await supabase.auth.signInWithOAuth({ provider: "google" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">Fazenda</h1>
        <p className="text-sm text-muted-foreground">Acesse sua conta</p>
      </div>

      <form onSubmit={signIn} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="voce@exemplo.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Senha</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">ou</span>
        </div>
      </div>

      <button
        onClick={signInGoogle}
        disabled={loading}
        className="w-full rounded-md border bg-card px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-60"
      >
        Entrar com Google
      </button>

      {msg && (
        <p className="text-center text-sm text-destructive">{msg}</p>
      )}
    </div>
  )
}

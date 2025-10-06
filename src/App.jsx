import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import Layout from './components/Layout.jsx'
import EstoqueForm from './components/EstoqueForm.jsx'
import EstoqueList from './components/EstoqueList.jsx'
import MovimentacaoForm from './components/MovimentacaoForm.jsx'
import MovimentacaoList from './components/MovimentacaoList.jsx'
import { useAuthSession } from '@/hooks/useAuthSession'
import Login from '@/components/Login'
import { supabase } from '@/lib/supabase'

import {
  listarItens,
  criarItem as criarItemService,
  excluirItem as excluirItemService,
} from '@/services/itens'
import {
  listarMovimentacoes,
  registrarMovimentacao as registrarMovService,
} from '@/services/movimentacoes'

// ⛔ nada de './App.css' aqui

export default function App() {
  const { session, loading } = useAuthSession()

  const [itens, setItens] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [itemEditando, setItemEditando] = useState(null)
  const [bootLoading, setBootLoading] = useState(true)

  // ===== Helpers de mapeamento (DB → UI) =====
  const mapMovDbToUi = (m) => ({
    id: m.id,
    itemId: m.item_id,
    tipo: m.tipo,               // 'entrada' | 'saida'
    quantidade: m.quantidade,
    data: m.data,
    observacoes: m.observacoes ?? ''
  })

  // ===== Bootstrap dos dados do banco =====
  useEffect(() => {
    if (!session) return
    ;(async () => {
      try {
        setBootLoading(true)
        const [dbItens, dbMovs] = await Promise.all([
          listarItens(),
          listarMovimentacoes(200),
        ])
        setItens(dbItens)                          // { id, nome, descricao, unidade, quantidade, ... }
        setMovimentacoes(dbMovs.map(mapMovDbToUi)) // item_id -> itemId
      } catch (e) {
        console.error(e)
        alert('Erro ao carregar dados do banco: ' + (e.message || e))
      } finally {
        setBootLoading(false)
      }
    })()
  }, [session])

  // ===== Ações =====
  const adicionarItem = async (dadosItem) => {
    try {
      const novo = await criarItemService({
        nome: dadosItem.nome,
        descricao: dadosItem.descricao,
        unidade: dadosItem.unidade,
        quantidadeInicial: Number(dadosItem.quantidade || 0),
      })
      setItens((prev) => [novo, ...prev])

      // recarrega algumas movimentações (ver “Estoque inicial”)
      const movs = await listarMovimentacoes(50)
      setMovimentacoes(movs.map(mapMovDbToUi))
    } catch (e) {
      console.error(e)
      alert('Erro ao criar item: ' + (e.message || e))
    }
  }

  const editarItem = async (dadosItem) => {
    if (!itemEditando) return
    try {
      const { data, error } = await supabase
        .from('fazenda_estoque_itens')
        .update({
          nome: dadosItem.nome,
          descricao: dadosItem.descricao,
          unidade: dadosItem.unidade,
        })
        .eq('id', itemEditando.id)
        .select()
        .single()
      if (error) throw error

      setItens((prev) => prev.map((it) => (it.id === data.id ? data : it)))
      setItemEditando(null)
    } catch (e) {
      console.error(e)
      alert('Erro ao editar item: ' + (e.message || e))
    }
  }

  const excluirItem = async (itemId) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return
    try {
      await excluirItemService(itemId)
      setItens((prev) => prev.filter((i) => i.id !== itemId))
      setMovimentacoes((prev) => prev.filter((m) => m.itemId !== itemId))
    } catch (e) {
      console.error(e)
      alert('Erro ao excluir item: ' + (e.message || e))
    }
  }

  const registrarMovimentacao = async (dadosMov) => {
    try {
      const { item, movimentacao } = await registrarMovService({
        itemId: dadosMov.itemId,
        tipo: dadosMov.tipo === 'entrada' ? 'entrada' : 'saida',
        quantidade: Number(dadosMov.quantidade),
        data: dadosMov.data,
        observacoes: dadosMov.observacoes,
      })

      setItens((prev) => prev.map((i) => (i.id === item.id ? item : i)))

      if (movimentacao) {
        setMovimentacoes((prev) => [mapMovDbToUi(movimentacao), ...prev])
      }
    } catch (e) {
      console.error(e)
      alert('Erro ao registrar movimentação: ' + (e.message || e))
    }
  }

  // ===== KPIs =====
  const totalItens = itens.length
  const itensComEstoque = itens.filter((i) => (i.quantidade || 0) > 0).length
  const itensSemEstoque = itens.filter((i) => (i.quantidade || 0) === 0).length

  // ===== Render por aba =====
  const renderContent = (activeTab) => {
    switch (activeTab) {
      case 'estoque':
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
              <EstoqueForm
                onSubmit={itemEditando ? editarItem : adicionarItem}
                initialData={itemEditando}
              />
              {itemEditando && (
                <Button
                  variant="outline"
                  onClick={() => setItemEditando(null)}
                  className="mt-2 w-full"
                >
                  Cancelar Edição
                </Button>
              )}
            </div>
            <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
              <h3 className="mb-4 font-semibold">Itens em Estoque</h3>
              <EstoqueList itens={itens} onEdit={setItemEditando} onDelete={excluirItem} />
            </div>
          </div>
        )

      case 'mov-cadastrar': // da sidebar nova
        return (
          <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
            <h3 className="mb-4 font-semibold">Registrar Movimentação</h3>
            <MovimentacaoForm itens={itens} onSubmit={registrarMovimentacao} />
          </div>
        )

      case 'mov-listar': // da sidebar nova
        return (
          <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
            <h3 className="mb-4 font-semibold">Últimas Movimentações</h3>
            <MovimentacaoList movimentacoes={movimentacoes} itens={itens} />
          </div>
        )

      case 'movimentacao': // compatibilidade com layout antigo
        return (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
              <MovimentacaoForm itens={itens} onSubmit={registrarMovimentacao} />
            </div>
            <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
              <h3 className="mb-4 font-semibold">Últimas Movimentações</h3>
              <MovimentacaoList movimentacoes={movimentacoes.slice(0, 5)} itens={itens} />
            </div>
          </div>
        )

      case 'historico':
        return (
          <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Histórico Completo de Movimentações</h2>
            <MovimentacaoList movimentacoes={movimentacoes} itens={itens} />
          </div>
        )

      case 'relatorios':
        return (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
            <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground">Total de Itens</div>
                <div className="text-2xl font-semibold">{totalItens}</div>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground">Itens em Estoque</div>
                <div className="text-2xl font-semibold text-green-600">{itensComEstoque}</div>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground">Itens sem Estoque</div>
                <div className="text-2xl font-semibold text-red-600">{itensSemEstoque}</div>
              </div>
            </div>
            <div className="rounded-lg border bg-card text-card-foreground p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground">Total de Movimentações</div>
                <div className="text-2xl font-semibold">{movimentacoes.length}</div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // ===== Autenticação / Loading =====
  if (loading) return <p className="p-5">Carregando...</p>

  if (!session) {
    return (
      <div className="min-h-dvh grid place-items-center bg-background">
        <div className="rounded-lg border bg-card text-card-foreground p-6 shadow-sm w-[90%] max-w-md">
          <Login />
        </div>
      </div>
    )
  }

  if (bootLoading) {
    return <p className="p-5">Carregando dados do banco…</p>
  }

  // ===== App =====
  return (
    <div className="p-5">
      <header className="mb-4 flex items-center justify-between">
        <strong>Logado: {session.user?.email}</strong>
        <button
          onClick={() => supabase.auth.signOut()}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Sair
        </button>
      </header>

      <Layout>{({ activeTab }) => renderContent(activeTab)}</Layout>
    </div>
  )
}

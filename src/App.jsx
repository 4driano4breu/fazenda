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

import './App.css'

export default function App() {
  const { session, loading } = useAuthSession()

  const [itens, setItens] = useState([])
  const [movimentacoes, setMovimentacoes] = useState([])
  const [itemEditando, setItemEditando] = useState(null)
  const [bootLoading, setBootLoading] = useState(true)

  // ===== Helpers de mapeamento (DB → UI) =====
  const mapMovDbToUi = (m) => ({
    id: m.id,
    itemId: m.item_id,          // o componente usa itemId
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
        setItens(dbItens)                             // já vem com { id, nome, descricao, unidade, quantidade, ... }
        setMovimentacoes(dbMovs.map(mapMovDbToUi))    // adapta campo item_id -> itemId
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

      // recarrega últimas movimentações (opcional, para ver “Estoque inicial”)
      const movs = await listarMovimentacoes(50)
      setMovimentacoes((prev) => [...movs.map(mapMovDbToUi)])
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
          // quantidade não é editada aqui — é alterada pelas movimentações
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

      // Atualiza item no estado (quantidade nova vinda do banco)
      setItens((prev) => prev.map((i) => (i.id === item.id ? item : i)))

      // Adiciona a movimentação mais recente no topo (mapeada para a forma da UI)
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
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="card">
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
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Itens em Estoque</h3>
              <EstoqueList itens={itens} onEdit={setItemEditando} onDelete={excluirItem} />
            </div>
          </div>
        )

      case 'movimentacao':
        return (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="card">
              <MovimentacaoForm itens={itens} onSubmit={registrarMovimentacao} />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Últimas Movimentações</h3>
              <MovimentacaoList movimentacoes={movimentacoes.slice(0, 5)} itens={itens} />
            </div>
          </div>
        )

      case 'historico':
        return (
          <div className="card">
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
              Histórico Completo de Movimentações
            </h2>
            <MovimentacaoList movimentacoes={movimentacoes} itens={itens} />
          </div>
        )

      case 'relatorios':
        return (
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}
          >
            <div className="card">
              <div className="kpi">
                <div className="label">Total de Itens</div>
                <div className="value">{totalItens}</div>
              </div>
            </div>
            <div className="card">
              <div className="kpi">
                <div className="label">Itens em Estoque</div>
                <div className="value" style={{ color: '#059669' }}>
                  {itensComEstoque}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="kpi">
                <div className="label">Itens sem Estoque</div>
                <div className="value" style={{ color: '#dc2626' }}>
                  {itensSemEstoque}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="kpi">
                <div className="label">Total de Movimentações</div>
                <div className="value">{movimentacoes.length}</div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // ===== Autenticação / Loading =====
  if (loading) return <p>Carregando...</p>

  if (!session) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Fazenda — Entrar</h2>
        <Login />
      </div>
    )
  }

  if (bootLoading) {
    return <p style={{ padding: 20 }}>Carregando dados do banco…</p>
  }

  // ===== App =====
  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <strong>Logado: {session.user?.email}</strong>
        <button onClick={() => supabase.auth.signOut()}>Sair</button>
      </header>

      <Layout>{({ activeTab }) => renderContent(activeTab)}</Layout>
    </div>
  )
}

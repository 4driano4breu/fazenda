import { supabase } from '@/lib/supabase'

export async function listarMovimentacoes(limit = 50) {
  const { data, error } = await supabase
    .from('fazenda_estoque_movimentacoes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function registrarMovimentacao({ itemId, tipo, quantidade, data, observacoes }) {
  // usa a função que já atualiza o estoque e cria a movimentação
  const { error } = await supabase.rpc('ajustar_quantidade', {
    p_item_id: itemId,
    p_tipo: tipo, // 'entrada' | 'saida'
    p_quantidade: quantidade,
    p_data: data || new Date().toISOString().slice(0, 10),
    p_observacoes: observacoes || null
  })
  if (error) throw error

  // retorna saldo do item e a movimentação mais recente (opcional)
  const [{ data: item }, { data: movs }] = await Promise.all([
    supabase.from('fazenda_estoque_itens').select('*').eq('id', itemId).single(),
    supabase.from('fazenda_estoque_movimentacoes').select('*').eq('item_id', itemId).order('created_at', { ascending: false }).limit(1)
  ])

  return { item, movimentacao: movs?.[0] ?? null }
}

import { supabase } from '@/lib/supabase'

export async function listarItens() {
  const { data, error } = await supabase
    .from('fazenda_estoque_itens')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function criarItem({ nome, descricao, unidade, quantidadeInicial = 0 }) {
  // 1) cria o item (user_id é default = auth.uid())
  const { data: item, error } = await supabase
    .from('fazenda_estoque_itens')
    .insert({ nome, descricao, unidade, quantidade: 0 }) // começa em 0
    .select()
    .single()
  if (error) throw error

  // 2) se houver quantidade inicial, aplica como 'entrada' via RPC
  if (quantidadeInicial > 0) {
    const { error: rpcErr } = await supabase.rpc('ajustar_quantidade', {
      p_item_id: item.id,
      p_tipo: 'entrada',
      p_quantidade: quantidadeInicial,
      p_data: new Date().toISOString().slice(0, 10),
      p_observacoes: 'Estoque inicial'
    })
    if (rpcErr) throw rpcErr
  }

  // 3) retorna item já com quantidade atualizada
  const { data: atualizado, error: e2 } = await supabase
    .from('fazenda_estoque_itens')
    .select('*')
    .eq('id', item.id)
    .single()
  if (e2) throw e2
  return atualizado
}

export async function excluirItem(id) {
  const { error } = await supabase
    .from('fazenda_estoque_itens')
    .delete()
    .eq('id', id)
  if (error) throw error
}

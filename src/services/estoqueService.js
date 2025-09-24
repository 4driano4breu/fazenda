// Serviço de Estoque EXCLUSIVAMENTE com Supabase
import { supabase } from './supabaseConfig.js';

class EstoqueService {
  constructor() {
    this.itensTable = 'fazenda_estoque_itens';
    this.movimentacoesTable = 'fazenda_estoque_movimentacoes';
  }

  // CRUD de Itens
  async adicionarItem(dadosItem, userId) {
    try {
      const item = {
        ...dadosItem,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(this.itensTable)
        .insert([item])
        .select()
        .single();

      if (error) {
        console.error('Erro ao adicionar item:', error);
        return { success: false, error: 'Erro ao adicionar item. Verifique sua conexão.' };
      }
      
      // Registrar movimentação inicial se quantidade > 0
      if (dadosItem.quantidade > 0) {
        await this.registrarMovimentacao({
          item_id: data.id,
          tipo: 'entrada',
          quantidade: dadosItem.quantidade,
          observacoes: 'Estoque inicial',
          data: new Date().toISOString().split('T')[0]
        }, userId);
      }
      
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
  }

  async atualizarItem(itemId, dadosItem, userId) {
    try {
      const itemRef = { 
        ...dadosItem, 
        updated_at: new Date().toISOString() 
      };
      
      const { error } = await supabase
        .from(this.itensTable)
        .update(itemRef)
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao atualizar item:', error);
        return { success: false, error: 'Erro ao atualizar item. Verifique sua conexão.' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
  }

  async excluirItem(itemId, userId) {
    try {
      // Primeiro, excluir todas as movimentações relacionadas
      await supabase
        .from(this.movimentacoesTable)
        .delete()
        .eq('item_id', itemId)
        .eq('user_id', userId);

      // Depois, excluir o item
      const { error } = await supabase
        .from(this.itensTable)
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao excluir item:', error);
        return { success: false, error: 'Erro ao excluir item. Verifique sua conexão.' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
  }

  async obterItens(userId) {
    try {
      const { data, error } = await supabase
        .from(this.itensTable)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao obter itens:', error);
        return { success: false, error: 'Erro ao carregar itens. Verifique sua conexão.' };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erro ao obter itens:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
  }

  // CRUD de Movimentações
  async registrarMovimentacao(dadosMovimentacao, userId) {
    try {
      const movimentacao = {
        ...dadosMovimentacao,
        user_id: userId,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(this.movimentacoesTable)
        .insert([movimentacao])
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar movimentação:', error);
        return { success: false, error: 'Erro ao registrar movimentação. Verifique sua conexão.' };
      }

      // Atualizar quantidade do item
      await this.atualizarQuantidadeItem(dadosMovimentacao.item_id, dadosMovimentacao.tipo, dadosMovimentacao.quantidade, userId);
      
      return { success: true, id: data.id };
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
  }

  async atualizarQuantidadeItem(itemId, tipo, quantidade, userId) {
    try {
      // Obter item atual
      const { data: item, error: itemError } = await supabase
        .from(this.itensTable)
        .select('quantidade')
        .eq('id', itemId)
        .eq('user_id', userId)
        .single();

      if (itemError) {
        console.error('Erro ao obter item para atualização:', itemError);
        return { success: false, error: 'Erro ao atualizar quantidade.' };
      }

      // Calcular nova quantidade
      const quantidadeAtual = item.quantidade || 0;
      const novaQuantidade = tipo === 'entrada' 
        ? quantidadeAtual + quantidade 
        : quantidadeAtual - quantidade;

      // Atualizar item
      const { error: updateError } = await supabase
        .from(this.itensTable)
        .update({ 
          quantidade: Math.max(0, novaQuantidade),
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erro ao atualizar quantidade:', updateError);
        return { success: false, error: 'Erro ao atualizar quantidade.' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar quantidade do item:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
  }

  async obterMovimentacoes(userId, itemId = null) {
    try {
      let query = supabase
        .from(this.movimentacoesTable)
        .select(`
          *,
          fazenda_estoque_itens!inner(nome)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao obter movimentações:', error);
        return { success: false, error: 'Erro ao carregar movimentações. Verifique sua conexão.' };
      }
      
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Erro ao obter movimentações:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
  }

  // Relatórios e estatísticas
  async obterEstatisticas(userId) {
    try {
      const resultItens = await this.obterItens(userId);
      const resultMovimentacoes = await this.obterMovimentacoes(userId);

      if (!resultItens.success || !resultMovimentacoes.success) {
        return { success: false, error: 'Erro ao obter dados para estatísticas' };
      }

      const itens = resultItens.data;
      const movimentacoes = resultMovimentacoes.data;
      const itensEstoqueBaixo = itens.filter(item => item.quantidade <= 5);

      return {
        success: true,
        data: {
          totalItens: itens.length,
          totalMovimentacoes: movimentacoes.length,
          itensEstoqueBaixo: itensEstoqueBaixo.length,
          alertas: itensEstoqueBaixo
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
    }
  }
}

export const estoqueService = new EstoqueService();
export default estoqueService;
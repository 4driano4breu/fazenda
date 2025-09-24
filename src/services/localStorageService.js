// Serviço de fallback usando localStorage quando o Supabase não está disponível
class LocalStorageService {
  constructor() {
    this.usersKey = 'fazenda-users';
    this.itensKey = 'fazenda-estoque-itens';
    this.movimentacoesKey = 'fazenda-estoque-movimentacoes';
    this.currentUserKey = 'fazenda-current-user';
  }

  // Autenticação local
  async login(email, password) {
    try {
      const users = this.getUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const userSession = {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0]
        };
        
        localStorage.setItem(this.currentUserKey, JSON.stringify(userSession));
        return { success: true, user: userSession };
      } else {
        return { success: false, error: 'Email ou senha incorretos' };
      }
    } catch (error) {
      return { success: false, error: 'Erro no login local' };
    }
  }

  async register(email, password) {
    try {
      const users = this.getUsers();
      
      // Verificar se usuário já existe
      if (users.find(u => u.email === email)) {
        return { success: false, error: 'Usuário já cadastrado' };
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password,
        name: email.split('@')[0],
        created_at: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(this.usersKey, JSON.stringify(users));

      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta local' };
    }
  }

  async logout() {
    try {
      localStorage.removeItem(this.currentUserKey);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro no logout' };
    }
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem(this.currentUserKey);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  // Gestão de usuários
  getUsers() {
    try {
      const usersStr = localStorage.getItem(this.usersKey);
      return usersStr ? JSON.parse(usersStr) : [];
    } catch (error) {
      return [];
    }
  }

  // CRUD de Itens
  async adicionarItem(dadosItem, userId) {
    try {
      const itens = this.getItens(userId);
      const novoItem = {
        id: Date.now().toString(),
        ...dadosItem,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      itens.push(novoItem);
      this.saveItens(itens, userId);

      // Registrar movimentação inicial se quantidade > 0
      if (dadosItem.quantidade > 0) {
        await this.registrarMovimentacao({
          item_id: novoItem.id,
          tipo: 'entrada',
          quantidade: dadosItem.quantidade,
          observacoes: 'Estoque inicial',
          data: new Date().toISOString().split('T')[0]
        }, userId);
      }

      return { success: true, id: novoItem.id };
    } catch (error) {
      return { success: false, error: 'Erro ao adicionar item' };
    }
  }

  async atualizarItem(itemId, dadosItem, userId) {
    try {
      const itens = this.getItens(userId);
      const index = itens.findIndex(item => item.id === itemId);
      
      if (index === -1) {
        return { success: false, error: 'Item não encontrado' };
      }

      itens[index] = {
        ...itens[index],
        ...dadosItem,
        updated_at: new Date().toISOString()
      };

      this.saveItens(itens, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar item' };
    }
  }

  async excluirItem(itemId, userId) {
    try {
      const itens = this.getItens(userId);
      const itensAtualizados = itens.filter(item => item.id !== itemId);
      this.saveItens(itensAtualizados, userId);

      // Excluir movimentações relacionadas
      const movimentacoes = this.getMovimentacoes(userId);
      const movimentacoesAtualizadas = movimentacoes.filter(mov => mov.item_id !== itemId);
      this.saveMovimentacoes(movimentacoesAtualizadas, userId);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao excluir item' };
    }
  }

  async obterItens(userId) {
    try {
      const itens = this.getItens(userId);
      return { success: true, data: itens };
    } catch (error) {
      return { success: false, error: 'Erro ao obter itens' };
    }
  }

  // CRUD de Movimentações
  async registrarMovimentacao(dadosMovimentacao, userId) {
    try {
      const movimentacoes = this.getMovimentacoes(userId);
      const novaMovimentacao = {
        id: Date.now().toString(),
        ...dadosMovimentacao,
        user_id: userId,
        created_at: new Date().toISOString()
      };

      movimentacoes.push(novaMovimentacao);
      this.saveMovimentacoes(movimentacoes, userId);

      // Atualizar quantidade do item
      await this.atualizarQuantidadeItem(dadosMovimentacao.item_id, dadosMovimentacao.tipo, dadosMovimentacao.quantidade, userId);

      return { success: true, id: novaMovimentacao.id };
    } catch (error) {
      return { success: false, error: 'Erro ao registrar movimentação' };
    }
  }

  async atualizarQuantidadeItem(itemId, tipo, quantidade, userId) {
    try {
      const itens = this.getItens(userId);
      const index = itens.findIndex(item => item.id === itemId);
      
      if (index === -1) {
        return { success: false, error: 'Item não encontrado' };
      }

      const quantidadeAtual = itens[index].quantidade || 0;
      const novaQuantidade = tipo === 'entrada' 
        ? quantidadeAtual + quantidade 
        : quantidadeAtual - quantidade;

      itens[index].quantidade = Math.max(0, novaQuantidade);
      itens[index].updated_at = new Date().toISOString();

      this.saveItens(itens, userId);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao atualizar quantidade' };
    }
  }

  async obterMovimentacoes(userId, itemId = null) {
    try {
      let movimentacoes = this.getMovimentacoes(userId);
      
      if (itemId) {
        movimentacoes = movimentacoes.filter(mov => mov.item_id === itemId);
      }

      // Adicionar nome do item para compatibilidade
      const itens = this.getItens(userId);
      movimentacoes = movimentacoes.map(mov => {
        const item = itens.find(i => i.id === mov.item_id);
        return {
          ...mov,
          fazenda_estoque_itens: item ? { nome: item.nome } : { nome: 'Item removido' }
        };
      });

      return { success: true, data: movimentacoes };
    } catch (error) {
      return { success: false, error: 'Erro ao obter movimentações' };
    }
  }

  // Métodos auxiliares
  getItens(userId) {
    try {
      const key = `${this.itensKey}-${userId}`;
      const itensStr = localStorage.getItem(key);
      return itensStr ? JSON.parse(itensStr) : [];
    } catch (error) {
      return [];
    }
  }

  saveItens(itens, userId) {
    const key = `${this.itensKey}-${userId}`;
    localStorage.setItem(key, JSON.stringify(itens));
  }

  getMovimentacoes(userId) {
    try {
      const key = `${this.movimentacoesKey}-${userId}`;
      const movStr = localStorage.getItem(key);
      return movStr ? JSON.parse(movStr) : [];
    } catch (error) {
      return [];
    }
  }

  saveMovimentacoes(movimentacoes, userId) {
    const key = `${this.movimentacoesKey}-${userId}`;
    localStorage.setItem(key, JSON.stringify(movimentacoes));
  }
}

export const localStorageService = new LocalStorageService();
export default localStorageService;
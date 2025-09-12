// Serviço de Estoque integrado com Firestore (Ecosistema Rial)
import { db } from './firebaseConfig.js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  where,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';

class EstoqueService {
  constructor() {
    this.itensCollection = 'fazenda_estoque_itens';
    this.movimentacoesCollection = 'fazenda_estoque_movimentacoes';
  }

  // CRUD de Itens
  async adicionarItem(dadosItem, userId) {
    try {
      const item = {
        ...dadosItem,
        userId,
        dataCriacao: serverTimestamp(),
        dataAtualizacao: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.itensCollection), item);
      
      // Registrar movimentação inicial se quantidade > 0
      if (dadosItem.quantidade > 0) {
        await this.registrarMovimentacao({
          itemId: docRef.id,
          tipo: 'entrada',
          quantidade: dadosItem.quantidade,
          observacoes: 'Estoque inicial',
          data: new Date().toISOString().split('T')[0]
        }, userId);
      }
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return { success: false, error: error.message };
    }
  }

  async atualizarItem(itemId, dadosItem, userId) {
    try {
      const itemRef = doc(db, this.itensCollection, itemId);
      await updateDoc(itemRef, {
        ...dadosItem,
        dataAtualizacao: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      return { success: false, error: error.message };
    }
  }

  async excluirItem(itemId, userId) {
    try {
      // Excluir item
      await deleteDoc(doc(db, this.itensCollection, itemId));
      
      // Excluir movimentações relacionadas
      const movimentacoesQuery = query(
        collection(db, this.movimentacoesCollection),
        where('itemId', '==', itemId),
        where('userId', '==', userId)
      );
      
      const movimentacoesSnapshot = await getDocs(movimentacoesQuery);
      const deletePromises = movimentacoesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      return { success: false, error: error.message };
    }
  }

  async obterItens(userId) {
    try {
      const q = query(
        collection(db, this.itensCollection),
        where('userId', '==', userId),
        orderBy('dataCriacao', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const itens = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: itens };
    } catch (error) {
      console.error('Erro ao obter itens:', error);
      return { success: false, error: error.message };
    }
  }

  // Listener em tempo real para itens
  onItensChange(userId, callback) {
    const q = query(
      collection(db, this.itensCollection),
      where('userId', '==', userId),
      orderBy('dataCriacao', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const itens = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(itens);
    });
  }

  // CRUD de Movimentações
  async registrarMovimentacao(dadosMovimentacao, userId) {
    try {
      const movimentacao = {
        ...dadosMovimentacao,
        userId,
        dataRegistro: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, this.movimentacoesCollection), movimentacao);
      
      // Atualizar quantidade do item
      const itemRef = doc(db, this.itensCollection, dadosMovimentacao.itemId);
      const itemDoc = await getDoc(itemRef);
      
      if (itemDoc.exists()) {
        const itemData = itemDoc.data();
        const novaQuantidade = dadosMovimentacao.tipo === 'entrada'
          ? itemData.quantidade + dadosMovimentacao.quantidade
          : Math.max(0, itemData.quantidade - dadosMovimentacao.quantidade);
        
        await updateDoc(itemRef, {
          quantidade: novaQuantidade,
          dataAtualizacao: serverTimestamp()
        });
      }
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      return { success: false, error: error.message };
    }
  }

  async obterMovimentacoes(userId, limit = null) {
    try {
      let q = query(
        collection(db, this.movimentacoesCollection),
        where('userId', '==', userId),
        orderBy('dataRegistro', 'desc')
      );
      
      if (limit) {
        q = query(q, limit(limit));
      }
      
      const querySnapshot = await getDocs(q);
      const movimentacoes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { success: true, data: movimentacoes };
    } catch (error) {
      console.error('Erro ao obter movimentações:', error);
      return { success: false, error: error.message };
    }
  }

  // Listener em tempo real para movimentações
  onMovimentacoesChange(userId, callback) {
    const q = query(
      collection(db, this.movimentacoesCollection),
      where('userId', '==', userId),
      orderBy('dataRegistro', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const movimentacoes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(movimentacoes);
    });
  }

  // Relatórios
  async obterEstatisticas(userId) {
    try {
      const itensResult = await this.obterItens(userId);
      const movimentacoesResult = await this.obterMovimentacoes(userId);
      
      if (!itensResult.success || !movimentacoesResult.success) {
        throw new Error('Erro ao obter dados para estatísticas');
      }
      
      const itens = itensResult.data;
      const movimentacoes = movimentacoesResult.data;
      
      const totalItens = itens.length;
      const itensComEstoque = itens.filter(item => item.quantidade > 0).length;
      const itensSemEstoque = itens.filter(item => item.quantidade === 0).length;
      const totalMovimentacoes = movimentacoes.length;
      
      return {
        success: true,
        data: {
          totalItens,
          itensComEstoque,
          itensSemEstoque,
          totalMovimentacoes
        }
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { success: false, error: error.message };
    }
  }
}

// Exportar instância única (singleton)
export const estoqueService = new EstoqueService();
export default estoqueService;


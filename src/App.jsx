import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button.jsx';
import Layout from './components/Layout.jsx';
import EstoqueForm from './components/EstoqueForm.jsx';
import EstoqueList from './components/EstoqueList.jsx';
import MovimentacaoForm from './components/MovimentacaoForm.jsx';
import MovimentacaoList from './components/MovimentacaoList.jsx';
import './App.css';

function App() {
  const [itens, setItens] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [itemEditando, setItemEditando] = useState(null);

  // Carregar dados do localStorage
  useEffect(() => {
    const itensStorage = localStorage.getItem('fazenda-estoque-itens');
    const movimentacoesStorage = localStorage.getItem('fazenda-estoque-movimentacoes');
    
    if (itensStorage) {
      setItens(JSON.parse(itensStorage));
    }
    if (movimentacoesStorage) {
      setMovimentacoes(JSON.parse(movimentacoesStorage));
    }
  }, []);

  // Salvar dados no localStorage
  useEffect(() => {
    localStorage.setItem('fazenda-estoque-itens', JSON.stringify(itens));
  }, [itens]);

  useEffect(() => {
    localStorage.setItem('fazenda-estoque-movimentacoes', JSON.stringify(movimentacoes));
  }, [movimentacoes]);

  const adicionarItem = (dadosItem) => {
    const novoItem = {
      id: Date.now().toString(),
      ...dadosItem,
      dataCriacao: new Date().toISOString(),
    };
    setItens(prev => [...prev, novoItem]);
    
    // Registrar movimentação inicial se quantidade > 0
    if (dadosItem.quantidade > 0) {
      const movimentacao = {
        id: Date.now().toString() + '_inicial',
        itemId: novoItem.id,
        tipo: 'entrada',
        quantidade: dadosItem.quantidade,
        data: new Date().toISOString().split('T')[0],
        observacoes: 'Estoque inicial',
      };
      setMovimentacoes(prev => [...prev, movimentacao]);
    }
  };

  const editarItem = (dadosItem) => {
    setItens(prev => prev.map(item => 
      item.id === itemEditando.id 
        ? { ...item, ...dadosItem }
        : item
    ));
    setItemEditando(null);
  };

  const excluirItem = (itemId) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      setItens(prev => prev.filter(item => item.id !== itemId));
      setMovimentacoes(prev => prev.filter(mov => mov.itemId !== itemId));
    }
  };

  const registrarMovimentacao = (dadosMovimentacao) => {
    const novaMovimentacao = {
      id: Date.now().toString(),
      ...dadosMovimentacao,
    };
    
    // Atualizar quantidade do item
    setItens(prev => prev.map(item => {
      if (item.id === dadosMovimentacao.itemId) {
        const novaQuantidade = dadosMovimentacao.tipo === 'entrada'
          ? item.quantidade + dadosMovimentacao.quantidade
          : item.quantidade - dadosMovimentacao.quantidade;
        return { ...item, quantidade: Math.max(0, novaQuantidade) };
      }
      return item;
    }));
    
    setMovimentacoes(prev => [...prev, novaMovimentacao]);
  };

  const totalItens = itens.length;
  const itensComEstoque = itens.filter(item => item.quantidade > 0).length;
  const itensSemEstoque = itens.filter(item => item.quantidade === 0).length;

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
              <EstoqueList 
                itens={itens}
                onEdit={setItemEditando}
                onDelete={excluirItem}
              />
            </div>
          </div>
        );
      
      case 'movimentacao':
        return (
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            <div className="card">
              <MovimentacaoForm 
                itens={itens}
                onSubmit={registrarMovimentacao}
              />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: '16px', fontWeight: 600 }}>Últimas Movimentações</h3>
              <MovimentacaoList 
                movimentacoes={movimentacoes.slice(-5)}
                itens={itens}
              />
            </div>
          </div>
        );
      
      case 'historico':
        return (
          <div className="card">
            <h2 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>Histórico Completo de Movimentações</h2>
            <MovimentacaoList 
              movimentacoes={movimentacoes}
              itens={itens}
            />
          </div>
        );
      
      case 'relatorios':
        return (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px' }}>
            <div className="card">
              <div className="kpi">
                <div className="label">Total de Itens</div>
                <div className="value">{totalItens}</div>
              </div>
            </div>
            <div className="card">
              <div className="kpi">
                <div className="label">Itens em Estoque</div>
                <div className="value" style={{ color: '#059669' }}>{itensComEstoque}</div>
              </div>
            </div>
            <div className="card">
              <div className="kpi">
                <div className="label">Itens sem Estoque</div>
                <div className="value" style={{ color: '#dc2626' }}>{itensSemEstoque}</div>
              </div>
            </div>
            <div className="card">
              <div className="kpi">
                <div className="label">Total de Movimentações</div>
                <div className="value">{movimentacoes.length}</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Layout>
      {({ activeTab }) => renderContent(activeTab)}
    </Layout>
  );
}

export default App;


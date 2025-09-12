import { useState } from 'react';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Search, ArrowUp, ArrowDown, Calendar } from 'lucide-react';

const MovimentacaoList = ({ movimentacoes, itens }) => {
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('todos');

  const getItemNome = (itemId) => {
    const item = itens.find(i => i.id === itemId);
    return item ? item.nome : 'Item não encontrado';
  };

  const movimentacoesFiltradas = movimentacoes
    .filter(mov => {
      const itemNome = getItemNome(mov.itemId);
      const matchText = itemNome.toLowerCase().includes(filtro.toLowerCase()) ||
                       mov.observacoes.toLowerCase().includes(filtro.toLowerCase());
      const matchTipo = tipoFiltro === 'todos' || mov.tipo === tipoFiltro;
      return matchText && matchTipo;
    })
    .sort((a, b) => new Date(b.data) - new Date(a.data));

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getTipoBadge = (tipo) => {
    if (tipo === 'entrada') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <ArrowUp className="h-3 w-3 mr-1" />
          Entrada
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          <ArrowDown className="h-3 w-3 mr-1" />
          Saída
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar movimentações..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="entrada">Apenas entradas</SelectItem>
            <SelectItem value="saida">Apenas saídas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {movimentacoesFiltradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="mx-auto h-12 w-12 mb-4" />
          <p>Nenhuma movimentação encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {movimentacoesFiltradas.map(mov => (
            <div key={mov.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{getItemNome(mov.itemId)}</h4>
                    {getTipoBadge(mov.tipo)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Quantidade: <strong>{mov.quantidade}</strong></span>
                    <span>Data: {formatarData(mov.data)}</span>
                  </div>
                  
                  {mov.observacoes && (
                    <p className="text-sm text-gray-500 mt-2">{mov.observacoes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MovimentacaoList;


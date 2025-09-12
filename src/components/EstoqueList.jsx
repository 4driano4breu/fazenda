import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Search, Edit, Trash2, Package } from 'lucide-react';

const EstoqueList = ({ itens, onEdit, onDelete }) => {
  const [filtro, setFiltro] = useState('');

  const itensFiltrados = itens.filter(item =>
    item.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    item.descricao.toLowerCase().includes(filtro.toLowerCase())
  );

  const getStatusBadge = (quantidade) => {
    if (quantidade === 0) {
      return <Badge variant="destructive">Sem Estoque</Badge>;
    } else if (quantidade <= 10) {
      return <Badge variant="secondary">Estoque Baixo</Badge>;
    } else {
      return <Badge variant="default">Em Estoque</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar itens..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {itensFiltrados.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Package className="mx-auto h-12 w-12 mb-4" />
          <p>Nenhum item encontrado</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {itensFiltrados.map(item => (
            <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800">{item.nome}</h3>
                    {getStatusBadge(item.quantidade)}
                  </div>
                  
                  {item.descricao && (
                    <p className="text-gray-600 text-sm mb-2">{item.descricao}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Quantidade: <strong>{item.quantidade} {item.unidade}</strong></span>
                    <span>Unidade: {item.unidade}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EstoqueList;


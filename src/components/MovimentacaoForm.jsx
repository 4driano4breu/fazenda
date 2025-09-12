import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

const MovimentacaoForm = ({ itens, onSubmit }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    tipo: 'entrada',
    quantidade: 0,
    observacoes: '',
    data: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemId) {
      alert('Selecione um item');
      return;
    }
    if (formData.quantidade <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }
    
    const item = itens.find(i => i.id === formData.itemId);
    if (formData.tipo === 'saida' && item.quantidade < formData.quantidade) {
      alert('Quantidade insuficiente em estoque');
      return;
    }
    
    onSubmit(formData);
    setFormData({
      itemId: '',
      tipo: 'entrada',
      quantidade: 0,
      observacoes: '',
      data: new Date().toISOString().split('T')[0],
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const itemSelecionado = itens.find(i => i.id === formData.itemId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">Movimentação de Estoque</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="item">Item *</Label>
          <Select value={formData.itemId} onValueChange={(value) => handleChange('itemId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um item" />
            </SelectTrigger>
            <SelectContent>
              {itens.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.nome} (Estoque: {item.quantidade} {item.unidade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {itemSelecionado && (
            <p className="text-sm text-gray-600 mt-1">
              Estoque atual: {itemSelecionado.quantidade} {itemSelecionado.unidade}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="tipo">Tipo de Movimentação</Label>
          <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entrada">Entrada</SelectItem>
              <SelectItem value="saida">Saída</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="quantidade">Quantidade *</Label>
          <Input
            id="quantidade"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.quantidade}
            onChange={(e) => handleChange('quantidade', parseFloat(e.target.value) || 0)}
            placeholder="0"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="data">Data</Label>
          <Input
            id="data"
            type="date"
            value={formData.data}
            onChange={(e) => handleChange('data', e.target.value)}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => handleChange('observacoes', e.target.value)}
          placeholder="Observações sobre a movimentação..."
          rows={3}
        />
      </div>
      
      <Button type="submit" className="w-full">
        Registrar {formData.tipo === 'entrada' ? 'Entrada' : 'Saída'}
      </Button>
    </form>
  );
};

export default MovimentacaoForm;


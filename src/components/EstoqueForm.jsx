import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { Textarea } from '@/components/ui/textarea.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';

const EstoqueForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    unidade: initialData?.unidade || 'un',
    quantidade: initialData?.quantidade || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert('Nome do item é obrigatório');
      return;
    }
    onSubmit(formData);
    if (!initialData) {
      setFormData({ nome: '', descricao: '', unidade: 'un', quantidade: 0 });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800">
        {initialData ? 'Editar Item' : 'Cadastrar Novo Item'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome do Item *</Label>
          <Input
            id="nome"
            type="text"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Ex: Ração para gado"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="unidade">Unidade de Medida</Label>
          <Select value={formData.unidade} onValueChange={(value) => handleChange('unidade', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="un">Unidade</SelectItem>
              <SelectItem value="kg">Quilograma</SelectItem>
              <SelectItem value="g">Grama</SelectItem>
              <SelectItem value="l">Litro</SelectItem>
              <SelectItem value="ml">Mililitro</SelectItem>
              <SelectItem value="m">Metro</SelectItem>
              <SelectItem value="cm">Centímetro</SelectItem>
              <SelectItem value="saco">Saco</SelectItem>
              <SelectItem value="caixa">Caixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => handleChange('descricao', e.target.value)}
          placeholder="Descrição detalhada do item..."
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="quantidade">Quantidade Inicial</Label>
        <Input
          id="quantidade"
          type="number"
          min="0"
          step="0.01"
          value={formData.quantidade}
          onChange={(e) => handleChange('quantidade', parseFloat(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
      
      <Button type="submit" className="w-full">
        {initialData ? 'Atualizar Item' : 'Cadastrar Item'}
      </Button>
    </form>
  );
};

export default EstoqueForm;


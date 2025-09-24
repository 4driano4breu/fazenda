// Formulário de Login integrado com o Ecosistema Rial
import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { authService } from '../services/authService.js';
import { Package } from 'lucide-react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isRegister) {
      result = await authService.register(formData.email, formData.password);
      if (result.success) {
        setError('Conta criada com sucesso! Verifique seu email para confirmar.');
        setIsRegister(false);
        setFormData({ email: '', password: '' });
      }
    } else {
      result = await authService.login(formData.email, formData.password);
    }
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="lock">
      <div className="card" style={{ width: '400px', maxWidth: '90vw' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            <Package size={32} style={{ color: 'var(--primary)' }} />
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>FAZENDA</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)', fontWeight: 600 }}>estoque</div>
            </div>
          </div>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            {isRegister ? 'Criar nova conta' : 'Entre com suas credenciais'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="voce@empresa.com.br"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: error.includes('sucesso') ? '#f0fdf4' : '#fef2f2', 
              border: `1px solid ${error.includes('sucesso') ? '#bbf7d0' : '#fecaca'}`, 
              borderRadius: '8px',
              color: error.includes('sucesso') ? '#166534' : '#dc2626',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (isRegister ? 'Criando conta...' : 'Entrando...') : (isRegister ? 'Criar Conta' : 'Entrar')}
          </Button>

          <Button 
            type="button" 
            variant="outline"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setFormData({ email: '', password: '' });
            }}
            disabled={loading}
            style={{ width: '100%' }}
          >
            {isRegister ? 'Já tenho conta' : 'Criar nova conta'}
          </Button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#f8fafc', 
          borderRadius: '8px',
          fontSize: '12px',
          color: 'var(--muted)'
        }}>
          <strong>Sistema de Estoque da Fazenda:</strong><br />
          {isRegister 
            ? 'Crie uma conta para começar a gerenciar seu estoque.'
            : 'Use suas credenciais para acessar o sistema de controle de estoque.'
          }
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
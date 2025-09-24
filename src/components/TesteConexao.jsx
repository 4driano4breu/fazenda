import { useState } from 'react';
import { supabase } from '../services/supabaseConfig.js';
import { Button } from './ui/button.jsx';

const TesteConexao = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testarConexao = async () => {
    setLoading(true);
    setStatus('Testando conexão...');

    try {
      // Testar conexão básica
      const { data, error } = await supabase
        .from('fazenda_estoque_itens')
        .select('count(*)')
        .limit(1);

      if (error) {
        setStatus(`❌ Erro: ${error.message}`);
      } else {
        setStatus('✅ Conexão com Supabase funcionando!');
      }
    } catch (error) {
      setStatus(`❌ Erro de conexão: ${error.message}`);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Button onClick={testarConexao} disabled={loading}>
        {loading ? 'Testando...' : 'Testar Conexão com Supabase'}
      </Button>
      {status && (
        <div style={{ marginTop: '10px', fontSize: '14px' }}>
          {status}
        </div>
      )}
    </div>
  );
};

export default TesteConexao;
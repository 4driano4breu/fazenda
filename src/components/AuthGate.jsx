// Componente de proteção de autenticação integrado com o Ecosistema Rial
import { useState, useEffect } from 'react';
import { authService } from '../services/authService.js';
import LoginForm from './LoginForm.jsx';

const AuthGate = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializar listener de autenticação
    const unsubscribe = authService.initAuthStateListener();
    
    // Listener para mudanças no estado de autenticação
    const removeListener = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      removeListener();
    };
  }, []);

  if (loading) {
    return (
      <div className="lock">
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 600 }}>
            Carregando...
          </div>
          <div style={{ color: 'var(--muted)' }}>
            Verificando autenticação
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return children;
};

export default AuthGate;


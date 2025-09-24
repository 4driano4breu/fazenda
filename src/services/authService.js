// Serviço de Autenticação EXCLUSIVAMENTE com Supabase
import { supabase } from './supabaseConfig.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
    this.initializeAuth();
  }

  async initializeAuth() {
    try {
      // Verificar sessão atual
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao verificar sessão:', error);
        throw error;
      }

      this.currentUser = session?.user || null;
      
      // Escutar mudanças no estado de autenticação
      supabase.auth.onAuthStateChange((event, session) => {
        this.currentUser = session?.user || null;
        this.notifyAuthStateChange(this.currentUser);
      });
      
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      throw new Error('Falha na conexão com o banco de dados. Verifique sua conexão com a internet.');
    }
    
    this.notifyAuthStateChange(this.currentUser);
  }

  // Login com email e senha
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: this.getErrorMessage(error.message) };
      }

      this.currentUser = data.user;
      return {
        success: true,
        user: {
          uid: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário'
        }
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet e tente novamente.' };
    }
  }

  // Registro de novo usuário
  async register(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name || email.split('@')[0],
            ...userData
          }
        }
      });

      if (error) {
        return { success: false, error: this.getErrorMessage(error.message) };
      }

      // Se email confirmation estiver desabilitado, o usuário já estará logado
      if (data.user && !data.user.email_confirmed_at) {
        return { 
          success: true, 
          user: data.user,
          message: 'Conta criada com sucesso! Você já pode fazer login.'
        };
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet e tente novamente.' };
    }
  }

  // Logout
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: this.getErrorMessage(error.message) };
      }

      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet e tente novamente.' };
    }
  }

  // Reset de senha
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return { success: false, error: this.getErrorMessage(error.message) };
      }

      return { success: true, message: 'Email de recuperação enviado!' };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { success: false, error: 'Erro de conexão. Verifique sua internet e tente novamente.' };
    }
  }

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Obter usuário atual
  getCurrentUser() {
    if (!this.currentUser) return null;

    return {
      uid: this.currentUser.id,
      email: this.currentUser.email,
      name: this.currentUser.user_metadata?.name || this.currentUser.email?.split('@')[0] || 'Usuário'
    };
  }

  // Adicionar listener para mudanças no estado de autenticação
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    return () => {
      this.authStateListeners = this.authStateListeners.filter(
        listener => listener !== callback
      );
    };
  }

  // Notificar todos os listeners sobre mudanças no estado
  notifyAuthStateChange(user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Erro no listener de autenticação:', error);
      }
    });
  }

  // Obter token de acesso atual
  async getAccessToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }

  // Traduzir mensagens de erro do Supabase
  getErrorMessage(errorMessage) {
    const errorMessages = {
      'Invalid login credentials': 'Email ou senha incorretos',
      'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
      'User not found': 'Usuário não encontrado',
      'Invalid email': 'Email inválido',
      'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
      'User already registered': 'Usuário já cadastrado',
      'Too many requests': 'Muitas tentativas. Tente novamente mais tarde',
      'Failed to fetch': 'Erro de conexão. Verifique sua internet e as configurações do Supabase.',
      'signup is disabled': 'Registro de novos usuários está desabilitado',
      'Email rate limit exceeded': 'Limite de emails excedido. Tente novamente mais tarde'
    };
    
    for (const [key, value] of Object.entries(errorMessages)) {
      if (errorMessage && errorMessage.includes(key)) {
        return value;
      }
    }
    
    return errorMessage || 'Erro desconhecido. Verifique sua conexão e tente novamente';
  }
}

export const authService = new AuthService();
export default authService;
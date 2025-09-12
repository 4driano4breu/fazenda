// Serviço de Autenticação integrado com o Ecosistema Rial
import { auth } from './firebaseConfig.js';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];
  }

  // Inicializar o listener de estado de autenticação
  initAuthStateListener() {
    return onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authStateListeners.forEach(callback => callback(user));
    });
  }

  // Adicionar listener para mudanças no estado de autenticação
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    };
  }

  // Login com email e senha (compatível com o ecosistema Rial)
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        success: true,
        user: {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          name: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'Usuário'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Obter usuário atual
  getCurrentUser() {
    return this.currentUser ? {
      uid: this.currentUser.uid,
      email: this.currentUser.email,
      name: this.currentUser.displayName || this.currentUser.email?.split('@')[0] || 'Usuário'
    } : null;
  }

  // Traduzir códigos de erro do Firebase
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/invalid-credential': 'Credenciais inválidas'
    };
    
    return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente';
  }
}

// Exportar instância única (singleton)
export const authService = new AuthService();
export default authService;


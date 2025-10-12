import type { LoginCredentials, RegisterCredentials, User } from '../types/user';

const MOCK_USER: User = {
  id: '1',
  email: 'demo@example.com',
  name: 'Demo User',
  createdAt: new Date().toISOString()
};

const MOCK_TOKEN = 'mock-jwt-token-' + Date.now();

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    await delay(1000); 
    
    //  mock validation
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      return {
        user: MOCK_USER,
        token: MOCK_TOKEN
      };
    } else {
      throw new Error('Invalid email or password');
    }
  },

  async register(credentials: RegisterCredentials): Promise<{ user: User; token: string }> {
    await delay(1000); 
    
    // Mock registration 
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email: credentials.email,
      name: credentials.name,
      createdAt: new Date().toISOString()
    };

    return {
      user: newUser,
      token: MOCK_TOKEN + '-new'
    };
  },

  async getCurrentUser(): Promise<User> {
    await delay(500);
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    return MOCK_USER;
  },

  logout(): void {
    localStorage.removeItem('token');
  }
};
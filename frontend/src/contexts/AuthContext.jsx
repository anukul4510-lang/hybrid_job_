import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // First, login to get the token
      const loginResponse = await authAPI.login(email, password);
      const { access_token } = loginResponse.data;
      
      // Store the token
      localStorage.setItem('token', access_token);
      
      // Then fetch user data using the token
      const userResponse = await authAPI.getCurrentUser();
      const userData = userResponse.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success(`Welcome back, ${userData.email}!`);
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      toast.success('Registration successful! Please login.');
      return { success: true, data: response.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // During hot-reload, context might be temporarily undefined
    // Return a loading state instead of throwing
    if (import.meta.hot) {
      console.warn('AuthContext not available during hot-reload, returning fallback');
      return {
        user: null,
        loading: true,
        isAuthenticated: false,
        login: async () => ({ success: false, error: 'Context not ready' }),
        register: async () => ({ success: false, error: 'Context not ready' }),
        logout: () => {},
      };
    }
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;

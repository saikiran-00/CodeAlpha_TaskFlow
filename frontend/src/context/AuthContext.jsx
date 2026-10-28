import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('taskflow_token'));
  const [loading, setLoading] = useState(true);

  // On mount, validate token
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authAPI.getMe();
        setUser(data.user || data);
        setToken(storedToken);
      } catch {
        localStorage.removeItem('taskflow_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('taskflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success('Logged in successfully');
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('taskflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
    toast.success('Account created successfully');
    return data;
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    setToken(null);
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;

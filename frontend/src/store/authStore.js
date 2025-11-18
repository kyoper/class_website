import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set) => ({
  admin: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  
  login: async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      // 响应拦截器已经返回了 response.data，所以这里直接访问 data 属性
      const { token, admin } = response.data;
      
      localStorage.setItem('token', token);
      set({ admin, token, isAuthenticated: true });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || '登录失败' };
    }
  },
  
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      set({ admin: null, token: null, isAuthenticated: false });
    }
  },
  
  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false });
      return false;
    }
    
    try {
      const response = await authAPI.verify();
      // 响应拦截器已经返回了 response.data
      set({ admin: response.data.admin, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Verify token error:', error);
      localStorage.removeItem('token');
      set({ admin: null, token: null, isAuthenticated: false });
      return false;
    }
  },
}));

export default useAuthStore;

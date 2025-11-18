import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;

      if (status === 401) {
        const isLoginRequest = config?.url?.includes('/auth/login');
        if (!isLoginRequest) {
          localStorage.removeItem('token');
          window.location.href = '/admin/login';
        }
      }

      return Promise.reject(data.error || { message: '请求失败' });
    }

    if (error.request) {
      return Promise.reject({ message: '网络连接失败，请检查网络' });
    }

    return Promise.reject({ message: '发生未知错误' });
  }
);

export default api;

// API 方法
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),
};

export const announcementAPI = {
  getList: (params) => api.get('/announcements', { params }),
  getById: (id) => api.get(`/announcements/${id}`),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const albumAPI = {
  getList: () => api.get('/albums'),
  getById: (id) => api.get(`/albums/${id}`),
  create: (data) => api.post('/albums', data),
  update: (id, data) => api.put(`/albums/${id}`, data),
  delete: (id) => api.delete(`/albums/${id}`),
  uploadPhoto: (id, data) => api.post(`/albums/${id}/photos`, data),
  deletePhoto: (id) => api.delete(`/photos/${id}`),
};

export const memberAPI = {
  getList: (params) => api.get('/members', { params }),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
};

export const scheduleAPI = {
  get: () => api.get('/schedule'),
  update: (data) => api.put('/schedule', data),
};

export const homeworkAPI = {
  getList: (params) => api.get('/homework', { params }),
  getById: (id) => api.get(`/homework/${id}`),
  create: (data) => api.post('/homework', data),
  update: (id, data) => api.put(`/homework/${id}`, data),
  delete: (id) => api.delete(`/homework/${id}`),
};

export const honorAPI = {
  getList: (params) => api.get('/honors', { params }),
  getById: (id) => api.get(`/honors/${id}`),
  create: (data) => api.post('/honors', data),
  update: (id, data) => api.put(`/honors/${id}`, data),
  delete: (id) => api.delete(`/honors/${id}`),
};

export const messageAPI = {
  getList: (params) => api.get('/messages', { params }),
  create: (data) => api.post('/messages', data),
  delete: (id) => api.delete(`/messages/${id}`),
};

export const searchAPI = {
  search: (params) => api.get('/search', { params }),
};

export const classInfoAPI = {
  get: () => api.get('/class-info'),
  update: (data) => api.put('/class-info', data),
};

// 投票 API
export const pollAPI = {
  // 获取所有投票
  getAll: (params) => api.get('/polls', { params }),
  
  // 获取单个投票
  getById: (id) => api.get(`/polls/${id}`),
  
  // 获取投票结果
  getResults: (id) => api.get(`/polls/${id}/results`),
  
  // 检查是否已投票
  checkVoted: (id) => api.get(`/polls/${id}/check-voted`),
  
  // 提交投票
  vote: (id, data) => api.post(`/polls/${id}/vote`, data),
  
  // 创建投票（管理员）
  create: (data) => api.post('/polls', data),
  
  // 更新投票（管理员）
  update: (id, data) => api.put(`/polls/${id}`, data),
  
  // 删除投票（管理员）
  delete: (id) => api.delete(`/polls/${id}`),
};

// 资源库 API
export const resourceAPI = {
  // 分类管理
  getAllCategories: () => api.get('/resources/categories'),
  createCategory: (data) => api.post('/resources/categories', data),
  updateCategory: (id, data) => api.put(`/resources/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/resources/categories/${id}`),
  
  // 资源管理
  getAll: (params) => api.get('/resources', { params }),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  download: (id) => api.post(`/resources/${id}/download`),
  getStats: (id) => api.get(`/resources/${id}/stats`),
};

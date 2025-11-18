import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://class-website-zeta.vercel.app/',
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 开发环境禁用缓存
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });
}

// 静态文件服务（上传的图片）
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '清水亭学校七（三）班级网站API运行中' });
});

// 导入路由
import authRoutes from './routes/authRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import albumRoutes, { photoRouter } from './routes/albumRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import homeworkRoutes from './routes/homeworkRoutes.js';
import honorRoutes from './routes/honorRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import classInfoRoutes from './routes/classInfoRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import pollRoutes from './routes/pollRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import { apiLimiter } from './middleware/loginLimiter.js';

// API路由
app.get('/api', (req, res) => {
  res.json({ 
    message: '欢迎使用班级网站API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      announcements: '/api/announcements',
      albums: '/api/albums',
      members: '/api/members',
      schedule: '/api/schedule',
      homework: '/api/homework',
      honors: '/api/honors',
      messages: '/api/messages',
      search: '/api/search',
      classInfo: '/api/class-info',
      polls: '/api/polls',
      resources: '/api/resources'
    }
  });
});

// 应用 API 限流
app.use('/api', apiLimiter);

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/photos', photoRouter);
app.use('/api/members', memberRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/honors', honorRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/class-info', classInfoRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/resources', resourceRoutes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: '请求的资源不存在',
      code: 'NOT_FOUND'
    }
  });
});

// 全局错误处理（后续完善）
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || '服务器内部错误',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log(`📚 API文档: http://localhost:${PORT}/api`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
});

export default app;


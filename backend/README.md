# 清水亭学校七（三）班级网站 - 后端API

基于 Express + Prisma + SQLite 的班级网站后端服务。

## 技术栈

- **Node.js 18+** - JavaScript运行环境
- **Express.js** - Web框架
- **Prisma** - ORM数据库工具
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证
- **bcrypt** - 密码加密
- **Sharp** - 图片处理

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
npm run prisma:migrate
```

### 3. 添加种子数据

```bash
npm run seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将运行在 http://localhost:3000

## 可用脚本

- `npm run dev` - 启动开发服务器（支持热重载）
- `npm start` - 启动生产服务器
- `npm run prisma:generate` - 生成Prisma Client
- `npm run prisma:migrate` - 运行数据库迁移
- `npm run prisma:studio` - 打开Prisma Studio（数据库可视化工具）
- `npm run seed` - 添加种子数据

## 默认管理员账号

- 用户名: `admin`
- 密码: `admin123`

**⚠️ 生产环境请立即修改默认密码！**

## API文档

### 健康检查
- `GET /health` - 检查服务器状态

### 认证相关
- `POST /api/auth/login` - 管理员登录
- `POST /api/auth/logout` - 管理员登出
- `GET /api/auth/verify` - 验证token

### 公告相关
- `GET /api/announcements` - 获取公告列表
- `GET /api/announcements/:id` - 获取公告详情
- `POST /api/announcements` - 创建公告（需认证）
- `PUT /api/announcements/:id` - 更新公告（需认证）
- `DELETE /api/announcements/:id` - 删除公告（需认证）

（更多API文档待完善...）

## 项目结构

```
backend/
├── prisma/              # Prisma配置和迁移
│   ├── schema.prisma   # 数据库模型定义
│   └── seed.js         # 种子数据
├── src/
│   ├── server.js       # 服务器入口
│   ├── routes/         # API路由
│   ├── controllers/    # 控制器
│   ├── middleware/     # 中间件
│   ├── services/       # 业务逻辑
│   └── utils/          # 工具函数
├── uploads/            # 上传文件存储
├── .env                # 环境变量
└── package.json        # 项目配置
```

## 环境变量

复制 `.env.example` 到 `.env` 并修改配置：

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```

## 部署

### Render部署（免费）

1. 推送代码到GitHub
2. 在Render创建Web Service
3. 连接GitHub仓库
4. 设置构建命令: `npm install && npm run prisma:generate`
5. 设置启动命令: `npm start`
6. 添加环境变量
7. 部署！

## 许可证

MIT

# 🎓 班级网站管理系统

一个功能完整、现代化的班级网站系统，包含公告、相册、成员、课程表、作业、荣誉、留言板等功能。

![完成度](https://img.shields.io/badge/完成度-98%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ 特性

### 🌐 公开页面
- 📢 **公告系统** - 发布和浏览班级公告，支持富文本
- 📸 **相册功能** - 展示班级照片，支持灯箱查看
- 👥 **成员展示** - 教师和学生信息展示
- 📅 **课程表** - 可视化课程安排
- 📝 **作业公示** - 每日作业发布和查看
- 🏆 **荣誉墙** - 班级荣誉时间线展示
- 💬 **留言板** - 访客留言功能
- 🔍 **全局搜索** - 搜索公告、相册、留言

### 🔐 管理后台
- 📊 **仪表板** - 数据统计和快捷操作
- 📝 **内容管理** - 完整的 CRUD 功能
- 🎨 **富文本编辑** - React Quill 编辑器
- 📱 **响应式设计** - 完美支持移动端
- 🔒 **权限控制** - JWT 认证和授权
- 📈 **操作日志** - 记录管理员操作

## 🛠️ 技术栈

### 后端
- **Node.js** + **Express.js** - 服务器框架
- **Prisma** - ORM 数据库工具
- **SQLite** - 轻量级数据库
- **JWT** - 身份认证
- **bcryptjs** - 密码加密
- **Joi** - 数据验证

### 前端
- **React 18** - UI 框架
- **Vite** - 构建工具
- **React Router v6** - 路由管理
- **Tailwind CSS** - 样式框架
- **Ant Design** - UI 组件库
- **Zustand** - 状态管理
- **Axios** - HTTP 客户端
- **React Quill** - 富文本编辑器
- **dayjs** - 日期处理

## 📦 快速开始

### 环境要求
- Node.js >= 16
- npm >= 8

### 安装和运行

#### 1. 克隆项目
```bash
git clone <repository-url>
cd class-website
```

#### 2. 启动后端
```bash
cd backend
npm install
npm run dev
```
后端运行在：http://localhost:3000

#### 3. 启动前端
```bash
cd frontend
npm install
npm run dev
```
前端运行在：http://localhost:5174

#### 4. 访问系统

**公开网站：** http://localhost:5174

**管理后台：** http://localhost:5174/admin/login
- 用户名：admin
- 密码：admin123

## 📚 文档

- [项目状态](PROJECT_STATUS.md) - 查看项目完成度和功能清单
- [最近更新](RECENT_UPDATES.md) - 查看最新的开发进展
- [部署指南](DEPLOYMENT_GUIDE.md) - 学习如何部署到生产环境
- [使用手册](USER_MANUAL.md) - 详细的使用说明

## 🎯 功能模块

### 公告管理
- ✅ 发布公告（支持富文本）
- ✅ 编辑和删除公告
- ✅ 重要公告标记
- ✅ 自动生成摘要
- ✅ 分页展示

### 相册管理
- ✅ 创建相册
- ✅ 添加照片（URL方式）
- ✅ 设置封面
- ✅ 照片网格展示
- ✅ 灯箱查看

### 成员管理
- ✅ 添加教师和学生
- ✅ 角色分类
- ✅ 头像和简介
- ✅ 排序功能

### 课程表管理
- ✅ 可视化编辑
- ✅ 周一到周五，8节课
- ✅ 科目、教师、教室
- ✅ 当前课程高亮

### 作业管理
- ✅ 发布每日作业
- ✅ 科目分类
- ✅ 截止日期
- ✅ 附件链接

### 荣誉管理
- ✅ 添加荣誉
- ✅ 分类管理
- ✅ 时间线展示
- ✅ 证书图片

### 留言板
- ✅ 访客留言
- ✅ 管理员删除
- ✅ 批量操作
- ✅ 字数限制

### 班级信息
- ✅ 基本信息编辑
- ✅ 班级口号
- ✅ 背景图和Logo
- ✅ 联系方式

## 📊 项目结构

```
class-website/
├── backend/                 # 后端代码
│   ├── prisma/             # 数据库配置
│   │   ├── schema.prisma   # 数据模型
│   │   └── seed.js         # 种子数据
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由
│   │   ├── utils/          # 工具函数
│   │   └── server.js       # 服务器入口
│   └── package.json
│
├── frontend/               # 前端代码
│   ├── src/
│   │   ├── components/     # 组件
│   │   │   ├── common/     # 通用组件
│   │   │   ├── home/       # 首页组件
│   │   │   └── layout/     # 布局组件
│   │   ├── pages/          # 页面
│   │   │   ├── Admin/      # 管理后台页面
│   │   │   └── ...         # 公开页面
│   │   ├── services/       # API 服务
│   │   ├── store/          # 状态管理
│   │   ├── App.jsx         # 应用入口
│   │   └── main.jsx        # 主入口
│   └── package.json
│
├── PROJECT_STATUS.md       # 项目状态
├── RECENT_UPDATES.md       # 更新日志
├── DEPLOYMENT_GUIDE.md     # 部署指南
├── USER_MANUAL.md          # 使用手册
└── README.md               # 本文件
```

## 🚀 部署

### 推荐方案（免费）

**前端：** Vercel
- 自动部署
- 全球 CDN
- HTTPS 支持

**后端：** Render
- 免费套餐
- 自动部署
- 数据库持久化

**图片：** 图床服务
- imgur
- sm.ms
- Cloudinary

详细部署步骤请查看 [部署指南](DEPLOYMENT_GUIDE.md)

## 🔒 安全性

- ✅ JWT 身份认证
- ✅ 密码加密存储
- ✅ 登录失败限制
- ✅ CORS 配置
- ✅ API 限流
- ✅ 输入验证

## 🎨 界面预览

### 公开页面
- 现代化设计
- 响应式布局
- 流畅动画
- 优秀的用户体验

### 管理后台
- 专业的后台界面
- 侧边栏导航
- 数据可视化
- 操作便捷

## 📈 性能

- ⚡ 快速加载
- 📱 移动端优化
- 🎯 代码分割
- 🖼️ 图片懒加载（可选）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👥 作者

班级网站管理系统

## 🙏 致谢

感谢所有开源项目的贡献者！

## 📞 支持

如有问题，请查看文档或提交 Issue。

---

**开发时间：** 2025-11-13  
**版本：** 1.0.0  
**完成度：** 98%

---

⭐ 如果这个项目对你有帮助，请给个 Star！

import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保资源上传目录存在
const resourceDir = path.join(__dirname, '../../uploads/resources');

if (!fs.existsSync(resourceDir)) {
  fs.mkdirSync(resourceDir, { recursive: true });
}

// 配置 Multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resourceDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名，保留原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    // 清理文件名，移除特殊字符
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_');
    cb(null, cleanName + '-' + uniqueSuffix + ext);
  }
});

// 文件过滤器 - 允许常见文档和压缩文件
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-zip-compressed',
    'text/plain',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'), false);
  }
};

// 创建 Multer 实例
export const uploadResource = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  }
});

// 处理上传后的文件信息
export const processResourceFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: '没有上传文件' });
  }

  try {
    const file = req.file;
    const fileUrl = `/uploads/resources/${file.filename}`;
    const fileType = path.extname(file.originalname).slice(1).toLowerCase();

    // 添加文件信息到响应
    req.uploadedFile = {
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      fileType,
    };

    next();
  } catch (error) {
    console.error('文件处理错误:', error);
    res.status(500).json({ success: false, message: '文件处理失败' });
  }
};

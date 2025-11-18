import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
const thumbDir = path.join(uploadDir, 'thumbnails');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(thumbDir)) {
  fs.mkdirSync(thumbDir, { recursive: true });
}

// 配置 Multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只允许图片
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只能上传图片文件'), false);
  }
};

// 创建 Multer 实例
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// 图片处理中间件
export const processImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const filename = req.file.filename;
    const thumbFilename = 'thumb-' + filename;
    const thumbPath = path.join(thumbDir, thumbFilename);

    // 压缩原图
    await sharp(filePath)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(filePath + '.tmp');

    // 替换原文件
    fs.renameSync(filePath + '.tmp', filePath);

    // 生成缩略图
    await sharp(filePath)
      .resize(300, 300, {
        fit: 'cover'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbPath);

    // 添加 URL 到 req
    req.file.url = `/uploads/${filename}`;
    req.file.thumbnailUrl = `/uploads/thumbnails/${thumbFilename}`;

    next();
  } catch (error) {
    console.error('图片处理错误:', error);
    next(error);
  }
};

// 处理多图上传
export const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processedFiles = [];

    for (const file of req.files) {
      const filePath = file.path;
      const filename = file.filename;
      const thumbFilename = 'thumb-' + filename;
      const thumbPath = path.join(thumbDir, thumbFilename);

      // 压缩原图
      await sharp(filePath)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(filePath + '.tmp');

      fs.renameSync(filePath + '.tmp', filePath);

      // 生成缩略图
      await sharp(filePath)
        .resize(300, 300, {
          fit: 'cover'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);

      processedFiles.push({
        url: `/uploads/${filename}`,
        thumbnailUrl: `/uploads/thumbnails/${thumbFilename}`,
        originalName: file.originalname,
        size: file.size
      });
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    console.error('批量图片处理错误:', error);
    next(error);
  }
};

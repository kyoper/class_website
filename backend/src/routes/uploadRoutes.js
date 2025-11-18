import express from 'express';
import { upload, processImage, processImages } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/upload/image
 * @desc    上传单张图片
 * @access  Private
 */
router.post('/image', authenticate, upload.single('image'), processImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: '没有上传文件', code: 'NO_FILE' }
      });
    }

    res.json({
      success: true,
      data: {
        url: req.file.url,
        thumbnailUrl: req.file.thumbnailUrl,
        originalName: req.file.originalname,
        size: req.file.size
      },
      message: '图片上传成功'
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '图片上传失败', code: 'UPLOAD_ERROR' }
    });
  }
});

/**
 * @route   POST /api/upload/images
 * @desc    上传多张图片
 * @access  Private
 */
router.post('/images', authenticate, upload.array('images', 10), processImages, (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: '没有上传文件', code: 'NO_FILE' }
      });
    }

    res.json({
      success: true,
      data: {
        files: req.processedFiles
      },
      message: `成功上传 ${req.processedFiles.length} 张图片`
    });
  } catch (error) {
    console.error('批量上传错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '图片上传失败', code: 'UPLOAD_ERROR' }
    });
  }
});

export default router;

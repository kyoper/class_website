import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadResource, processResourceFile } from '../middleware/resourceUpload.js';

const router = express.Router();

// ========== 分类路由 ==========

// 公开路由
router.get('/categories', resourceController.getAllCategories);

// 管理员路由
router.post('/categories', authenticate, resourceController.createCategory);
router.put('/categories/:id', authenticate, resourceController.updateCategory);
router.delete('/categories/:id', authenticate, resourceController.deleteCategory);

// ========== 文件上传路由 ==========

// 管理员路由 - 上传文件
router.post('/upload', authenticate, uploadResource.single('file'), processResourceFile, (req, res) => {
  res.json({
    success: true,
    data: req.uploadedFile
  });
});

// ========== 资源路由 ==========

// 公开路由
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);
router.post('/:id/download', resourceController.downloadResource);
router.get('/:id/stats', resourceController.getDownloadStats);

// 管理员路由
router.post('/', authenticate, resourceController.createResource);
router.put('/:id', authenticate, resourceController.updateResource);
router.delete('/:id', authenticate, resourceController.deleteResource);

export default router;

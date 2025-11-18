import express from 'express';
import {
  getAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  uploadPhotos,
  deletePhoto
} from '../controllers/albumController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, albumSchema } from '../middleware/validation.js';

const router = express.Router();

// 相册路由
router.get('/', getAlbums);
router.get('/:id', getAlbumById);
router.post('/', authenticate, validate(albumSchema), createAlbum);
router.put('/:id', authenticate, validate(albumSchema), updateAlbum);
router.delete('/:id', authenticate, deleteAlbum);

// 照片路由
router.post('/:id/photos', authenticate, uploadPhotos);

// 单独的照片删除路由
export const photoRouter = express.Router();
photoRouter.delete('/:id', authenticate, deletePhoto);

export default router;

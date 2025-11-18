import express from 'express';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, announcementSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   GET /api/announcements
 * @desc    获取公告列表（支持分页）
 * @access  Public
 */
router.get('/', getAnnouncements);

/**
 * @route   GET /api/announcements/:id
 * @desc    获取单个公告详情
 * @access  Public
 */
router.get('/:id', getAnnouncementById);

/**
 * @route   POST /api/announcements
 * @desc    创建公告
 * @access  Private
 */
router.post('/', authenticate, validate(announcementSchema), createAnnouncement);

/**
 * @route   PUT /api/announcements/:id
 * @desc    更新公告
 * @access  Private
 */
router.put('/:id', authenticate, validate(announcementSchema), updateAnnouncement);

/**
 * @route   DELETE /api/announcements/:id
 * @desc    删除公告
 * @access  Private
 */
router.delete('/:id', authenticate, deleteAnnouncement);

export default router;

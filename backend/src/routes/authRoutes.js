import express from 'express';
import { login, logout, verify, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, changePasswordSchema } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    管理员登录
 * @access  Public
we */
router.post('/login', login);

/**
 * @route   POST /api/auth/logout
 * @desc    管理员登出
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/verify
 * @desc    验证 token 是否有效
 * @access  Private
 */
router.get('/verify', authenticate, verify);

/**
 * @route   PUT /api/auth/password
 * @desc    修改管理员密码
 * @access  Private
 */
router.put('/password', authenticate, validate(changePasswordSchema), changePassword);

export default router;

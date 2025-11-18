import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

/**
 * 管理员登录
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 1. 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: '用户名和密码不能为空',
          code: 'MISSING_CREDENTIALS'
        }
      });
    }
    
    // 2. 查找管理员
    const admin = await prisma.admin.findUnique({
      where: { username }
    });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          message: '用户名或密码错误',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    // 3. 验证密码
    const isPasswordValid = await comparePassword(password, admin.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          message: '用户名或密码错误',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    // 4. 生成 token
    const token = generateToken({
      adminId: admin.id,
      username: admin.username
    });
    
    // 5. 记录登录日志
    await prisma.operationLog.create({
      data: {
        adminId: admin.id,
        action: 'login',
        target: 'auth',
        details: `管理员 ${admin.username} 登录系统`
      }
    });
    
    // 6. 返回成功响应
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '登录过程发生错误',
        code: 'LOGIN_ERROR'
      }
    });
  }
};

/**
 * 管理员登出
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    // 记录登出日志
    if (req.admin) {
      await prisma.operationLog.create({
        data: {
          adminId: req.admin.id,
          action: 'logout',
          target: 'auth',
          details: `管理员 ${req.admin.username} 登出系统`
        }
      });
    }
    
    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '登出过程发生错误',
        code: 'LOGOUT_ERROR'
      }
    });
  }
};

/**
 * 验证 token 有效性
 * GET /api/auth/verify
 */
export const verify = async (req, res) => {
  try {
    // 如果能执行到这里，说明 token 已经通过认证中间件验证
    res.json({
      success: true,
      data: {
        admin: req.admin
      },
      message: 'Token 有效'
    });
  } catch (error) {
    console.error('验证错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '验证过程发生错误',
        code: 'VERIFY_ERROR'
      }
    });
  }
};

/**
 * 修改管理员密码
 * PUT /api/auth/password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: {
          message: '管理员账号不存在',
          code: 'ADMIN_NOT_FOUND'
        }
      });
    }

    const isCurrentValid = await comparePassword(currentPassword, admin.password);

    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: '当前密码错误',
          code: 'INVALID_CURRENT_PASSWORD'
        }
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: '新密码不能与当前密码相同',
          code: 'PASSWORD_NOT_CHANGED'
        }
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.admin.update({
      where: { id: adminId },
      data: { password: hashedPassword }
    });

    await prisma.operationLog.create({
      data: {
        adminId,
        action: 'update',
        target: 'admin',
        details: '修改账户密码'
      }
    });

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '修改密码失败',
        code: 'CHANGE_PASSWORD_ERROR'
      }
    });
  }
};

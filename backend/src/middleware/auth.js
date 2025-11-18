import { extractToken, verifyToken } from '../utils/jwt.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 认证中间件 - 验证 JWT token
 * 使用方法：在需要认证的路由前添加此中间件
 */
export const authenticate = async (req, res, next) => {
  try {
    // 1. 提取 token
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: '未提供认证令牌',
          code: 'NO_TOKEN'
        }
      });
    }
    
    // 2. 验证 token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: {
          message: '认证令牌无效或已过期',
          code: 'INVALID_TOKEN'
        }
      });
    }
    
    // 3. 验证管理员是否存在
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        username: true,
        name: true
      }
    });
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          message: '管理员账号不存在',
          code: 'ADMIN_NOT_FOUND'
        }
      });
    }
    
    // 4. 将管理员信息附加到请求对象
    req.admin = admin;
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '认证过程发生错误',
        code: 'AUTH_ERROR'
      }
    });
  }
};

/**
 * 可选认证中间件 - 如果有 token 则验证，没有也继续
 * 用于某些既可以公开访问，也可以认证访问的路由
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (token) {
      const decoded = verifyToken(token);
      
      if (decoded) {
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.adminId },
          select: {
            id: true,
            username: true,
            name: true
          }
        });
        
        if (admin) {
          req.admin = admin;
        }
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败不影响继续执行
    next();
  }
};

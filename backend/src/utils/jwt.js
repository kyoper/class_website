import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'class-website-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * 生成 JWT token
 * @param {Object} payload - token 载荷数据
 * @returns {string} JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * 验证 JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} 解码后的载荷数据，验证失败返回 null
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * 从请求头中提取 token
 * @param {Object} req - Express 请求对象
 * @returns {string|null} token 或 null
 */
export const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }
  
  // 支持 "Bearer token" 格式
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
};

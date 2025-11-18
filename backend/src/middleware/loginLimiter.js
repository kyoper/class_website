import rateLimit from 'express-rate-limit';

/**
 * 登录失败限制中间件
 * 限制：15分钟内最多5次登录尝试
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 最多5次请求
  message: {
    success: false,
    error: {
      message: '登录尝试次数过多，请15分钟后再试',
      code: 'TOO_MANY_ATTEMPTS'
    }
  },
  standardHeaders: true, // 返回 RateLimit-* 头
  legacyHeaders: false, // 禁用 X-RateLimit-* 头
  // 根据 IP 地址限制
  keyGenerator: (req) => {
    return req.ip;
  },
  // 跳过成功的登录请求
  skipSuccessfulRequests: true
});

/**
 * API 通用限流中间件
 * 开发环境：15分钟内最多1000次请求
 * 生产环境：15分钟内最多100次请求
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 开发环境放宽限制
  message: {
    success: false,
    error: {
      message: '请求过于频繁，请稍后再试',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 开发环境跳过限流
  skip: (req) => process.env.NODE_ENV !== 'production'
});

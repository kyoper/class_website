import Joi from 'joi';

/**
 * 验证中间件工厂函数
 * @param {Object} schema - Joi 验证模式
 * @returns {Function} Express 中间件
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // 返回所有错误
      stripUnknown: true // 移除未知字段
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({
        success: false,
        error: {
          message: '数据验证失败',
          code: 'VALIDATION_ERROR',
          details: errors
        }
      });
    }
    
    // 将验证后的数据替换原始数据
    req.body = value;
    next();
  };
};

/**
 * 公告验证模式
 */
export const announcementSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': '标题不能为空',
    'string.max': '标题不能超过200个字符',
    'any.required': '标题是必填项'
  }),
  content: Joi.string().min(1).required().messages({
    'string.empty': '内容不能为空',
    'any.required': '内容是必填项'
  }),
  summary: Joi.string().max(500).optional().allow('').messages({
    'string.max': '摘要不能超过500个字符'
  }),
  isImportant: Joi.boolean().optional().default(false)
});

/**
 * 成员验证模式
 */
export const memberSchema = Joi.object({
  name: Joi.string().min(1).max(50).required().messages({
    'string.empty': '姓名不能为空',
    'string.max': '姓名不能超过50个字符',
    'any.required': '姓名是必填项'
  }),
  role: Joi.string().valid('teacher', 'student').required().messages({
    'any.only': '角色必须是 teacher 或 student',
    'any.required': '角色是必填项'
  }),
  position: Joi.string().max(100).optional().allow(''),
  avatar: Joi.string().uri().optional().allow(''),
  bio: Joi.string().max(500).optional().allow(''),
  specialty: Joi.string().max(200).optional().allow(''),
  order: Joi.number().integer().min(0).optional().default(0)
});

/**
 * 作业验证模式
 */
export const homeworkSchema = Joi.object({
  date: Joi.date().required().messages({
    'any.required': '日期是必填项'
  }),
  subject: Joi.string().min(1).max(50).required().messages({
    'string.empty': '科目不能为空',
    'any.required': '科目是必填项'
  }),
  content: Joi.string().min(1).required().messages({
    'string.empty': '作业内容不能为空',
    'any.required': '作业内容是必填项'
  }),
  deadline: Joi.date().optional().allow(null),
  attachments: Joi.string().optional().allow('', null)
});

/**
 * 荣誉验证模式
 */
export const honorSchema = Joi.object({
  title: Joi.string().min(1).max(200).required().messages({
    'string.empty': '荣誉名称不能为空',
    'any.required': '荣誉名称是必填项'
  }),
  description: Joi.string().min(1).max(1000).required().messages({
    'string.empty': '荣誉描述不能为空',
    'string.max': '荣誉描述不能超过1000个字符',
    'any.required': '荣誉描述是必填项'
  }),
  date: Joi.date().required().messages({
    'any.required': '获奖日期是必填项'
  }),
  imageUrl: Joi.string().uri().optional().allow(''),
  images: Joi.string().optional().allow('', null),
  category: Joi.string().max(50).optional().allow('')
});

/**
 * 留言验证模式
 */
export const messageSchema = Joi.object({
  nickname: Joi.string().min(1).max(50).required().messages({
    'string.empty': '昵称不能为空',
    'string.max': '昵称不能超过50个字符',
    'any.required': '昵称是必填项'
  }),
  content: Joi.string().min(1).max(500).required().messages({
    'string.empty': '留言内容不能为空',
    'string.max': '留言内容不能超过500个字符',
    'any.required': '留言内容是必填项'
  })
});

/**
 * 相册验证模式
 */
export const albumSchema = Joi.object({
  title: Joi.string().min(1).max(100).required().messages({
    'string.empty': '相册标题不能为空',
    'any.required': '相册标题是必填项'
  }),
  description: Joi.string().max(500).optional().allow(''),
  coverImage: Joi.string().uri().optional().allow('')
});

/**
 * 修改密码验证模式
 */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required().messages({
    'string.empty': '当前密码不能为空',
    'any.required': '当前密码是必填项',
    'string.min': '当前密码至少需要6个字符'
  }),
  newPassword: Joi.string().min(6).max(64).required().messages({
    'string.empty': '新密码不能为空',
    'any.required': '新密码是必填项',
    'string.min': '新密码至少需要6个字符',
    'string.max': '新密码不能超过64个字符'
  }),
  confirmPassword: Joi.any().valid(Joi.ref('newPassword')).required().messages({
    'any.only': '两次输入的新密码不一致',
    'any.required': '请确认新密码'
  })
});

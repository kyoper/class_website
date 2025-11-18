import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * 加密密码
 * @param {string} password - 明文密码
 * @returns {Promise<string>} 加密后的密码
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * 验证密码
 * @param {string} password - 明文密码
 * @param {string} hashedPassword - 加密后的密码
 * @returns {Promise<boolean>} 密码是否匹配
 */
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

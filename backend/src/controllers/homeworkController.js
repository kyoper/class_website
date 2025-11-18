import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHomework = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    const homework = await prisma.homework.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    
    res.json({ success: true, data: { homework } });
  } catch (error) {
    console.error('获取作业列表错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取作业列表失败', code: 'GET_HOMEWORK_ERROR' }
    });
  }
};

export const getHomeworkById = async (req, res) => {
  try {
    const homework = await prisma.homework.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!homework) {
      return res.status(404).json({
        success: false,
        error: { message: '作业不存在', code: 'HOMEWORK_NOT_FOUND' }
      });
    }
    
    res.json({ success: true, data: { homework } });
  } catch (error) {
    console.error('获取作业详情错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取作业详情失败', code: 'GET_HOMEWORK_ERROR' }
    });
  }
};

export const createHomework = async (req, res) => {
  try {
    const homework = await prisma.homework.create({ data: req.body });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'create',
        target: 'homework',
        targetId: homework.id,
        details: `发布作业: ${homework.subject}`
      }
    });
    
    res.status(201).json({
      success: true,
      data: { homework },
      message: '作业发布成功'
    });
  } catch (error) {
    console.error('创建作业错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '创建作业失败', code: 'CREATE_HOMEWORK_ERROR' }
    });
  }
};

export const updateHomework = async (req, res) => {
  try {
    const homework = await prisma.homework.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update',
        target: 'homework',
        targetId: homework.id,
        details: `更新作业: ${homework.subject}`
      }
    });
    
    res.json({
      success: true,
      data: { homework },
      message: '作业更新成功'
    });
  } catch (error) {
    console.error('更新作业错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '更新作业失败', code: 'UPDATE_HOMEWORK_ERROR' }
    });
  }
};

export const deleteHomework = async (req, res) => {
  try {
    const homework = await prisma.homework.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!homework) {
      return res.status(404).json({
        success: false,
        error: { message: '作业不存在', code: 'HOMEWORK_NOT_FOUND' }
      });
    }
    
    await prisma.homework.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'delete',
        target: 'homework',
        targetId: parseInt(req.params.id),
        details: `删除作业: ${homework.subject}`
      }
    });
    
    res.json({ success: true, message: '作业删除成功' });
  } catch (error) {
    console.error('删除作业错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除作业失败', code: 'DELETE_HOMEWORK_ERROR' }
    });
  }
};

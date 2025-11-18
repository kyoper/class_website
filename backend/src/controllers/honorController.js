import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getHonors = async (req, res) => {
  try {
    const { category } = req.query;
    const where = category ? { category } : {};
    
    const honors = await prisma.honor.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    
    res.json({ success: true, data: { honors } });
  } catch (error) {
    console.error('获取荣誉列表错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取荣誉列表失败', code: 'GET_HONORS_ERROR' }
    });
  }
};

export const getHonorById = async (req, res) => {
  try {
    const honor = await prisma.honor.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!honor) {
      return res.status(404).json({
        success: false,
        error: { message: '荣誉不存在', code: 'HONOR_NOT_FOUND' }
      });
    }
    
    res.json({ success: true, data: { honor } });
  } catch (error) {
    console.error('获取荣誉详情错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取荣誉详情失败', code: 'GET_HONOR_ERROR' }
    });
  }
};

export const createHonor = async (req, res) => {
  try {
    const honor = await prisma.honor.create({ data: req.body });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'create',
        target: 'honor',
        targetId: honor.id,
        details: `添加荣誉: ${honor.title}`
      }
    });
    
    res.status(201).json({
      success: true,
      data: { honor },
      message: '荣誉添加成功'
    });
  } catch (error) {
    console.error('创建荣誉错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '创建荣誉失败', code: 'CREATE_HONOR_ERROR' }
    });
  }
};

export const updateHonor = async (req, res) => {
  try {
    const honor = await prisma.honor.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update',
        target: 'honor',
        targetId: honor.id,
        details: `更新荣誉: ${honor.title}`
      }
    });
    
    res.json({
      success: true,
      data: { honor },
      message: '荣誉更新成功'
    });
  } catch (error) {
    console.error('更新荣誉错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '更新荣誉失败', code: 'UPDATE_HONOR_ERROR' }
    });
  }
};

export const deleteHonor = async (req, res) => {
  try {
    const honor = await prisma.honor.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!honor) {
      return res.status(404).json({
        success: false,
        error: { message: '荣誉不存在', code: 'HONOR_NOT_FOUND' }
      });
    }
    
    await prisma.honor.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'delete',
        target: 'honor',
        targetId: parseInt(req.params.id),
        details: `删除荣誉: ${honor.title}`
      }
    });
    
    res.json({ success: true, message: '荣誉删除成功' });
  } catch (error) {
    console.error('删除荣誉错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除荣誉失败', code: 'DELETE_HONOR_ERROR' }
    });
  }
};

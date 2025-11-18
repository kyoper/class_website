import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const skip = (page - 1) * pageSize;
    
    const total = await prisma.message.count();
    const messages = await prisma.message.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('获取留言列表错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取留言列表失败', code: 'GET_MESSAGES_ERROR' }
    });
  }
};

export const createMessage = async (req, res) => {
  try {
    const message = await prisma.message.create({ data: req.body });
    
    res.status(201).json({
      success: true,
      data: { message },
      message: '留言发表成功'
    });
  } catch (error) {
    console.error('创建留言错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '创建留言失败', code: 'CREATE_MESSAGE_ERROR' }
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: { message: '留言不存在', code: 'MESSAGE_NOT_FOUND' }
      });
    }
    
    await prisma.message.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'delete',
        target: 'message',
        targetId: parseInt(req.params.id),
        details: '删除留言'
      }
    });
    
    res.json({ success: true, message: '留言删除成功' });
  } catch (error) {
    console.error('删除留言错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除留言失败', code: 'DELETE_MESSAGE_ERROR' }
    });
  }
};

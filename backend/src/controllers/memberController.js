import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMembers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    
    const members = await prisma.member.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }]
    });
    
    res.json({ success: true, data: { members } });
  } catch (error) {
    console.error('获取成员列表错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取成员列表失败', code: 'GET_MEMBERS_ERROR' }
    });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: { message: '成员不存在', code: 'MEMBER_NOT_FOUND' }
      });
    }
    
    res.json({ success: true, data: { member } });
  } catch (error) {
    console.error('获取成员详情错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取成员详情失败', code: 'GET_MEMBER_ERROR' }
    });
  }
};

export const createMember = async (req, res) => {
  try {
    const member = await prisma.member.create({ data: req.body });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'create',
        target: 'member',
        targetId: member.id,
        details: `添加成员: ${member.name}`
      }
    });
    
    res.status(201).json({
      success: true,
      data: { member },
      message: '成员添加成功'
    });
  } catch (error) {
    console.error('创建成员错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '创建成员失败', code: 'CREATE_MEMBER_ERROR' }
    });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await prisma.member.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update',
        target: 'member',
        targetId: member.id,
        details: `更新成员: ${member.name}`
      }
    });
    
    res.json({
      success: true,
      data: { member },
      message: '成员更新成功'
    });
  } catch (error) {
    console.error('更新成员错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '更新成员失败', code: 'UPDATE_MEMBER_ERROR' }
    });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await prisma.member.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!member) {
      return res.status(404).json({
        success: false,
        error: { message: '成员不存在', code: 'MEMBER_NOT_FOUND' }
      });
    }
    
    await prisma.member.delete({
      where: { id: parseInt(req.params.id) }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'delete',
        target: 'member',
        targetId: parseInt(req.params.id),
        details: `删除成员: ${member.name}`
      }
    });
    
    res.json({ success: true, message: '成员删除成功' });
  } catch (error) {
    console.error('删除成员错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除成员失败', code: 'DELETE_MEMBER_ERROR' }
    });
  }
};

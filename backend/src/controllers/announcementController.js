import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 获取公告列表（支持分页）
 * GET /api/announcements?page=1&pageSize=10
 */
export const getAnnouncements = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    
    // 获取总数
    const total = await prisma.announcement.count();
    
    // 获取公告列表
    const announcements = await prisma.announcement.findMany({
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc' // 按创建时间倒序
      },
      select: {
        id: true,
        title: true,
        summary: true,
        isImportant: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({
      success: true,
      data: {
        announcements,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    console.error('获取公告列表错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '获取公告列表失败',
        code: 'GET_ANNOUNCEMENTS_ERROR'
      }
    });
  }
};

/**
 * 获取单个公告详情
 * GET /api/announcements/:id
 */
export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        error: {
          message: '公告不存在',
          code: 'ANNOUNCEMENT_NOT_FOUND'
        }
      });
    }
    
    res.json({
      success: true,
      data: { announcement }
    });
  } catch (error) {
    console.error('获取公告详情错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '获取公告详情失败',
        code: 'GET_ANNOUNCEMENT_ERROR'
      }
    });
  }
};

/**
 * 创建公告
 * POST /api/announcements
 */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, summary, isImportant } = req.body;
    
    // 如果没有提供摘要，自动生成（取内容前100个字符）
    const autoSummary = summary || content.replace(/<[^>]*>/g, '').substring(0, 100);
    
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        summary: autoSummary,
        isImportant: isImportant || false
      }
    });
    
    // 记录操作日志
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'create',
        target: 'announcement',
        targetId: announcement.id,
        details: `创建公告: ${title}`
      }
    });
    
    res.status(201).json({
      success: true,
      data: { announcement },
      message: '公告创建成功'
    });
  } catch (error) {
    console.error('创建公告错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '创建公告失败',
        code: 'CREATE_ANNOUNCEMENT_ERROR'
      }
    });
  }
};

/**
 * 更新公告
 * PUT /api/announcements/:id
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, isImportant } = req.body;
    
    // 检查公告是否存在
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        error: {
          message: '公告不存在',
          code: 'ANNOUNCEMENT_NOT_FOUND'
        }
      });
    }
    
    // 更新公告
    const announcement = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        summary,
        isImportant
      }
    });
    
    // 记录操作日志
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update',
        target: 'announcement',
        targetId: announcement.id,
        details: `更新公告: ${title}`
      }
    });
    
    res.json({
      success: true,
      data: { announcement },
      message: '公告更新成功'
    });
  } catch (error) {
    console.error('更新公告错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '更新公告失败',
        code: 'UPDATE_ANNOUNCEMENT_ERROR'
      }
    });
  }
};

/**
 * 删除公告
 * DELETE /api/announcements/:id
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查公告是否存在
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingAnnouncement) {
      return res.status(404).json({
        success: false,
        error: {
          message: '公告不存在',
          code: 'ANNOUNCEMENT_NOT_FOUND'
        }
      });
    }
    
    // 删除公告
    await prisma.announcement.delete({
      where: { id: parseInt(id) }
    });
    
    // 记录操作日志
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'delete',
        target: 'announcement',
        targetId: parseInt(id),
        details: `删除公告: ${existingAnnouncement.title}`
      }
    });
    
    res.json({
      success: true,
      message: '公告删除成功'
    });
  } catch (error) {
    console.error('删除公告错误:', error);
    res.status(500).json({
      success: false,
      error: {
        message: '删除公告失败',
        code: 'DELETE_ANNOUNCEMENT_ERROR'
      }
    });
  }
};

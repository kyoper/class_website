import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ========== 资源分类管理 ==========

// 获取所有分类
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.resourceCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { resources: true }
        }
      }
    });
    
    res.json({ success: true, data: { categories } });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({ success: false, message: '获取分类列表失败' });
  }
};

// 创建分类（管理员）
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, order } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: '请提供分类名称' });
    }
    
    const category = await prisma.resourceCategory.create({
      data: { name, description, icon, order: order || 0 }
    });
    
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    console.error('创建分类失败:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: '分类名称已存在' });
    }
    res.status(500).json({ success: false, message: '创建分类失败' });
  }
};

// 更新分类（管理员）
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, order } = req.body;
    
    const category = await prisma.resourceCategory.update({
      where: { id: parseInt(id) },
      data: { name, description, icon, order }
    });
    
    res.json({ success: true, data: { category } });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.status(500).json({ success: false, message: '更新分类失败' });
  }
};

// 删除分类（管理员）
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.resourceCategory.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true, message: '分类已删除' });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.status(500).json({ success: false, message: '删除分类失败' });
  }
};

// ========== 资源管理 ==========

// 获取所有资源
export const getAllResources = async (req, res) => {
  try {
    const { categoryId, search, page = 1, pageSize = 20 } = req.query;
    
    const where = {};
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);
    
    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        include: {
          category: true,
          _count: {
            select: { downloads: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.resource.count({ where })
    ]);
    
    res.json({
      success: true,
      data: {
        resources,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total,
          totalPages: Math.ceil(total / parseInt(pageSize))
        }
      }
    });
  } catch (error) {
    console.error('获取资源列表失败:', error);
    res.status(500).json({ success: false, message: '获取资源列表失败' });
  }
};

// 获取单个资源
export const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(id) },
      include: {
        category: true,
        _count: {
          select: { downloads: true }
        }
      }
    });
    
    if (!resource) {
      return res.status(404).json({ success: false, message: '资源不存在' });
    }
    
    res.json({ success: true, data: { resource } });
  } catch (error) {
    console.error('获取资源详情失败:', error);
    res.status(500).json({ success: false, message: '获取资源详情失败' });
  }
};

// 创建资源（管理员）
export const createResource = async (req, res) => {
  try {
    const { title, description, categoryId, fileUrl, fileName, fileSize, fileType } = req.body;
    
    if (!title || !categoryId || !fileUrl || !fileName) {
      return res.status(400).json({ 
        success: false, 
        message: '请提供标题、分类、文件URL和文件名' 
      });
    }
    
    const resource = await prisma.resource.create({
      data: {
        title,
        description,
        categoryId: parseInt(categoryId),
        fileUrl,
        fileName,
        fileSize: fileSize ? parseInt(fileSize) : null,
        fileType
      },
      include: {
        category: true
      }
    });
    
    res.status(201).json({ success: true, data: { resource } });
  } catch (error) {
    console.error('创建资源失败:', error);
    res.status(500).json({ success: false, message: '创建资源失败' });
  }
};

// 更新资源（管理员）
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, categoryId, fileUrl, fileName, fileSize, fileType } = req.body;
    
    const resource = await prisma.resource.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        fileUrl,
        fileName,
        fileSize: fileSize ? parseInt(fileSize) : undefined,
        fileType
      },
      include: {
        category: true
      }
    });
    
    res.json({ success: true, data: { resource } });
  } catch (error) {
    console.error('更新资源失败:', error);
    res.status(500).json({ success: false, message: '更新资源失败' });
  }
};

// 删除资源（管理员）
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.resource.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true, message: '资源已删除' });
  } catch (error) {
    console.error('删除资源失败:', error);
    res.status(500).json({ success: false, message: '删除资源失败' });
  }
};

// 下载资源（公开）
export const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    const downloaderIp = req.ip || req.connection.remoteAddress;
    
    // 增加下载次数
    await prisma.resource.update({
      where: { id: parseInt(id) },
      data: {
        downloadCount: { increment: 1 }
      }
    });
    
    // 记录下载
    await prisma.resourceDownload.create({
      data: {
        resourceId: parseInt(id),
        downloaderIp
      }
    });
    
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(id) }
    });
    
    res.json({ 
      success: true, 
      data: { 
        fileUrl: resource.fileUrl,
        fileName: resource.fileName
      } 
    });
  } catch (error) {
    console.error('下载资源失败:', error);
    res.status(500).json({ success: false, message: '下载资源失败' });
  }
};

// 获取下载统计
export const getDownloadStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(id) },
      include: {
        downloads: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });
    
    if (!resource) {
      return res.status(404).json({ success: false, message: '资源不存在' });
    }
    
    // 按日期统计
    const downloadsByDate = {};
    resource.downloads.forEach(download => {
      const date = download.createdAt.toISOString().split('T')[0];
      downloadsByDate[date] = (downloadsByDate[date] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        totalDownloads: resource.downloadCount,
        recentDownloads: resource.downloads.length,
        downloadsByDate
      }
    });
  } catch (error) {
    console.error('获取下载统计失败:', error);
    res.status(500).json({ success: false, message: '获取下载统计失败' });
  }
};

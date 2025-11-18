import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 获取相册列表
 * GET /api/albums
 */
export const getAlbums = async (req, res) => {
  try {
    const albums = await prisma.album.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        photos: {
          take: 20,
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { photos: true }
        }
      }
    });
    
    res.json({
      success: true,
      data: { albums }
    });
  } catch (error) {
    console.error('获取相册列表错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取相册列表失败', code: 'GET_ALBUMS_ERROR' }
    });
  }
};

/**
 * 获取相册详情（包含所有照片）
 * GET /api/albums/:id
 */
export const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) },
      include: {
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    if (!album) {
      return res.status(404).json({
        success: false,
        error: { message: '相册不存在', code: 'ALBUM_NOT_FOUND' }
      });
    }
    
    res.json({
      success: true,
      data: { album }
    });
  } catch (error) {
    console.error('获取相册详情错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '获取相册详情失败', code: 'GET_ALBUM_ERROR' }
    });
  }
};

/**
 * 创建相册
 * POST /api/albums
 */
export const createAlbum = async (req, res) => {
  try {
    const { title, description, coverImage } = req.body;
    
    const album = await prisma.album.create({
      data: { title, description, coverImage }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'create',
        target: 'album',
        targetId: album.id,
        details: `创建相册: ${title}`
      }
    });
    
    res.status(201).json({
      success: true,
      data: { album },
      message: '相册创建成功'
    });
  } catch (error) {
    console.error('创建相册错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '创建相册失败', code: 'CREATE_ALBUM_ERROR' }
    });
  }
};

/**
 * 更新相册
 * PUT /api/albums/:id
 */
export const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, coverImage } = req.body;
    
    const album = await prisma.album.update({
      where: { id: parseInt(id) },
      data: { title, description, coverImage }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'update',
        target: 'album',
        targetId: album.id,
        details: `更新相册: ${title}`
      }
    });
    
    res.json({
      success: true,
      data: { album },
      message: '相册更新成功'
    });
  } catch (error) {
    console.error('更新相册错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '更新相册失败', code: 'UPDATE_ALBUM_ERROR' }
    });
  }
};

/**
 * 删除相册
 * DELETE /api/albums/:id
 */
export const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    
    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!album) {
      return res.status(404).json({
        success: false,
        error: { message: '相册不存在', code: 'ALBUM_NOT_FOUND' }
      });
    }
    
    await prisma.album.delete({
      where: { id: parseInt(id) }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'delete',
        target: 'album',
        targetId: parseInt(id),
        details: `删除相册: ${album.title}`
      }
    });
    
    res.json({
      success: true,
      message: '相册删除成功'
    });
  } catch (error) {
    console.error('删除相册错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除相册失败', code: 'DELETE_ALBUM_ERROR' }
    });
  }
};

/**
 * 上传照片到相册
 * POST /api/albums/:id/photos
 */
export const uploadPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, thumbnailUrl, caption } = req.body;
    
    // 验证必填字段
    if (!url) {
      return res.status(400).json({
        success: false,
        error: { message: '照片URL不能为空', code: 'URL_REQUIRED' }
      });
    }
    
    const album = await prisma.album.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!album) {
      return res.status(404).json({
        success: false,
        error: { message: '相册不存在', code: 'ALBUM_NOT_FOUND' }
      });
    }
    
    const photo = await prisma.photo.create({
      data: {
        albumId: parseInt(id),
        url,
        thumbnailUrl: thumbnailUrl || null,
        caption: caption || null
      }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'create',
        target: 'photo',
        targetId: photo.id,
        details: `上传照片到相册: ${album.title}`
      }
    });
    
    res.status(201).json({
      success: true,
      data: { photo },
      message: '照片上传成功'
    });
  } catch (error) {
    console.error('上传照片错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '上传照片失败', code: 'UPLOAD_PHOTO_ERROR' }
    });
  }
};

/**
 * 删除照片
 * DELETE /api/photos/:id
 */
export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        error: { message: '照片不存在', code: 'PHOTO_NOT_FOUND' }
      });
    }
    
    await prisma.photo.delete({
      where: { id: parseInt(id) }
    });
    
    await prisma.operationLog.create({
      data: {
        adminId: req.admin.id,
        action: 'delete',
        target: 'photo',
        targetId: parseInt(id),
        details: '删除照片'
      }
    });
    
    res.json({
      success: true,
      message: '照片删除成功'
    });
  } catch (error) {
    console.error('删除照片错误:', error);
    res.status(500).json({
      success: false,
      error: { message: '删除照片失败', code: 'DELETE_PHOTO_ERROR' }
    });
  }
};
